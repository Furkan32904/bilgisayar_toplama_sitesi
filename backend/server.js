const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const productsDataPath = path.join(__dirname, 'data', 'products.json');
let products = [];
try {
  const data = fs.readFileSync(productsDataPath, 'utf-8');
  products = JSON.parse(data);
} catch (error) {
  console.error("Error reading products.json", error);
}

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get specific product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Compatibility Engine
app.post('/api/products/compatible', (req, res) => {
  const { selectedParts } = req.body;
  // selectedParts = { cpu: 'cpu-1', motherboard: null, ... }
  
  const selectedCPU = products.find(p => p.id === selectedParts?.cpu);
  const selectedMB = products.find(p => p.id === selectedParts?.motherboard);
  const selectedRAM = products.find(p => p.id === selectedParts?.ram);
  const selectedGPU = products.find(p => p.id === selectedParts?.gpu);
  const selectedCase = products.find(p => p.id === selectedParts?.case);
  const selectedStorage = products.find(p => p.id === selectedParts?.storage);

  // Calculate System TDP
  let totalTdp = 50; // base for MB, fans, SSD etc.
  if (selectedCPU) totalTdp += (selectedCPU.specs.tdp || 0);
  if (selectedGPU) totalTdp += (selectedGPU.specs.tdp || 0);

  const compatibleList = {
    cpu: [],
    motherboard: [],
    ram: [],
    gpu: [],
    case: [],
    psu: [],
    storage: []
  };

  products.forEach(p => {
    let isCompatible = true;

    if (p.category === 'cpu') {
      if (selectedMB && p.specs.socket !== selectedMB.specs.socket) isCompatible = false;
    }
    else if (p.category === 'motherboard') {
      if (selectedCPU && p.specs.socket !== selectedCPU.specs.socket) isCompatible = false;
      if (selectedRAM && p.specs.memoryType !== selectedRAM.specs.memoryType) isCompatible = false;
      if (selectedCase && (!selectedCase.specs.supportedFormFactors || !selectedCase.specs.supportedFormFactors.includes(p.specs.formFactor))) isCompatible = false;
      if (selectedStorage && selectedStorage.specs.interface === 'M.2 NVMe' && (!p.specs.m2Slots || p.specs.m2Slots <= 0)) isCompatible = false;
    }
    else if (p.category === 'ram') {
      if (selectedMB && p.specs.memoryType !== selectedMB.specs.memoryType) isCompatible = false;
    }
    else if (p.category === 'gpu') {
      if (selectedCase && p.specs.length > selectedCase.specs.maxGpuLength) isCompatible = false;
    }
    else if (p.category === 'case') {
      if (selectedMB && p.specs.supportedFormFactors && !p.specs.supportedFormFactors.includes(selectedMB.specs.formFactor)) isCompatible = false;
      if (selectedGPU && p.specs.maxGpuLength < selectedGPU.specs.length) isCompatible = false;
    }
    else if (p.category === 'psu') {
      // User requirement: System TDP <= PSU Wattage * 0.75
      if (p.specs.wattage * 0.75 < totalTdp) isCompatible = false;
    }
    else if (p.category === 'storage') {
      if (p.specs.interface === 'M.2 NVMe') {
        if (selectedMB && (!selectedMB.specs.m2Slots || selectedMB.specs.m2Slots <= 0)) isCompatible = false;
      }
    }

    if (isCompatible) {
      compatibleList[p.category].push(p);
    }
  });

  res.json({ compatibleList, totalTdp });
});

// AI Builder Engine
app.post('/api/products/ai-build', async (req, res) => {
  const { budget, preferences } = req.body;
  if (!budget) return res.status(400).json({ error: 'Budget is required' });
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in the backend' });
  }

  const prompt = `
You are an expert PC builder. I have a list of available products:
${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price, specs: p.specs })))}

The user has a maximum budget of ${budget} TL.
Their preferences: "${preferences || 'No specific preferences'}".

Rules for the build:
1. You MUST select EXACTLY ONE product for EACH of these categories: cpu, motherboard, ram, gpu, case, psu, storage.
2. Compatibility is STRICT:
   - CPU and Motherboard must have the same socket.
   - RAM and Motherboard must have the same memoryType (e.g. DDR5).
   - Motherboard formFactor must be supported by the Case (supportedFormFactors).
   - GPU length must be <= Case maxGpuLength.
   - Storage interface (if M.2 NVMe) requires the Motherboard to have m2Slots > 0.
   - PSU wattage * 0.75 must be >= System TDP (System TDP is 50 + CPU tdp + GPU tdp).
3. Budget Constraint: Try your absolute best to keep the sum of prices <= ${budget}. 
   *HOWEVER*, if the cheapest possible valid combination of parts in the database exceeds ${budget}, you MUST still provide valid builds, but choose the absolute cheapest options available and explicitly state in the "description" that the budget was insufficient for the current market/database prices.
4. Preference Constraint: If the user asks for a specific brand (e.g., AMD GPU, Intel CPU) but there are no matching parts in the database, select the best alternative available and explicitly apologize/explain in the "description" that the requested brand was not available in the inventory.
   
Return EXACTLY a valid JSON array of 3 distinct build options. Each build option MUST be an object with:
- title: string (e.g., "Bütçe Dostu (Zorunlu Aşım)", "Dengeli", "Maksimum Performans")
- description: string (Explain why you chose these parts, and IF you exceeded the budget or ignored a brand preference due to lack of inventory, YOU MUST explain it here in Turkish!)
- totalPrice: number (sum of part prices)
- parts: object mapping category names to product IDs (e.g. { "cpu": "cpu-1", "motherboard": "mb-1", "ram": "ram-1", "gpu": "gpu-1", "case": "case-1", "psu": "psu-1", "storage": "storage-1" })

Do not wrap the JSON in Markdown formatting (no \`\`\`json) or include any extra text. Just output the JSON array.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let text = response.text;
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const builds = JSON.parse(text);
    res.json({ builds });
  } catch (error) {
    console.error("AI Build Error:", error);
    res.status(500).json({ error: 'Failed to generate AI builds' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
