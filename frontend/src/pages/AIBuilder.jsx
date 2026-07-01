import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Zap, ArrowRight, Loader } from 'lucide-react';

function AIBuilder() {
  const navigate = useNavigate();
  const [budget, setBudget] = useState('');
  const [preferences, setPreferences] = useState('');
  const [loading, setLoading] = useState(false);
  const [builds, setBuilds] = useState([]);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    // Remove any dots if user typed 45.000 meaning 45000
    const rawBudget = String(budget).replace(/\./g, '');
    const numericBudget = Number(rawBudget);

    if (!rawBudget || isNaN(numericBudget) || numericBudget <= 0) {
      setError("Lütfen geçerli bir bütçe giriniz.");
      return;
    }

    setLoading(true);
    setError(null);
    setBuilds([]);

    try {
      const response = await fetch('http://localhost:5000/api/products/ai-build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget: numericBudget, preferences }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      setBuilds(data.builds || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBuild = (build) => {
    navigate('/builder', { state: { aiSelectedParts: build.parts } });
  };

  return (
    <div className="builder-page" style={{ minHeight: '100vh', paddingTop: '100px' }}>
      <div className="builder-bg-orb orb-1" />
      <div className="builder-bg-orb orb-2" />

      <div className="container-fluid relative z-10" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div className="flex items-center gap-3 mb-6">
            <Bot size={32} color="#00f0ff" />
            <h1 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>PC Asistan</h1>
          </div>
          <p className="text-muted mb-6">
            Bütçenizi ve ne amaçla kullanacağınızı belirtin, PC Asistan sizin için en uyumlu ve performanslı 3 farklı PC toplama seçeneği sunsun.
          </p>

          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Maksimum Bütçe (TL)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Örn: 30000"
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '1.1rem'
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Özel İstekleriniz (İsteğe Bağlı)</label>
              <textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="Örn: Sadece oyun oynayacağım, kasada bolca RGB olsun, Intel işlemci tercih ederim vs."
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '1rem',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: '1rem', display: 'flex', justifyContent: 'center', fontSize: '1.1rem' }}
            >
              {loading ? <><Loader className="animate-spin" size={20} /> AI Analiz Ediyor...</> : <><Zap size={20} /> Sistem Önerileri Üret</>}
            </button>

            {error && (
              <div style={{ color: '#ff4d4f', background: 'rgba(255,77,79,0.1)', padding: '1rem', borderRadius: '8px' }}>
                Hata: {error}
              </div>
            )}
          </form>
        </div>

        {builds.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', marginTop: '1rem' }}>Önerilen Sistemler</h2>
            {builds.map((build, index) => (
              <div key={index} className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ color: '#00f0ff', fontSize: '1.3rem', margin: '0 0 0.5rem 0' }}>{build.title}</h3>
                    <p style={{ color: '#ccc', margin: 0 }}>{build.description}</p>
                  </div>
                  <div style={{ background: 'rgba(0,240,255,0.1)', color: '#00f0ff', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold' }}>
                    {build.totalPrice.toLocaleString('tr-TR')} TL
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                  {Object.entries(build.parts).map(([cat, partId]) => (
                    <div key={cat}>
                      <span style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase' }}>{cat}</span>
                      <div style={{ color: '#fff', fontSize: '0.95rem' }}>{partId}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectBuild(build)}
                  className="btn"
                  style={{ background: 'transparent', border: '1px solid #00f0ff', color: '#00f0ff', width: '100%', display: 'flex', justifyContent: 'center' }}
                >
                  Bu Sistemi Seç ve Düzenle <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIBuilder;
