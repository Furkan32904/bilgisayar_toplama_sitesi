import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Check, Cpu, HardDrive, Layout, Monitor, Power, Zap, ChevronRight, X, ShoppingCart, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { id: 'cpu',         label: 'İşlemci',       sub: 'Gücün kalbi',          icon: Cpu },
  { id: 'motherboard', label: 'Anakart',        sub: 'Sistemin omurgası',     icon: Layout },
  { id: 'ram',         label: 'RAM',            sub: 'Hız ve çoklu görev',   icon: HardDrive },
  { id: 'storage',     label: 'Depolama',       sub: 'Geniş alan, yüksek hız',icon: HardDrive },
  { id: 'gpu',         label: 'Ekran Kartı',    sub: 'Görsel üstünlük',      icon: Monitor },
  { id: 'case',        label: 'Kasa',           sub: 'Tarzını yansıt',       icon: Layout },
  { id: 'psu',         label: 'Güç Kaynağı',   sub: 'Stabil enerji',        icon: Power },
];

const SPEC_LABELS = {
  socket: { label: 'Soket' }, tdp: { label: 'TDP', s: 'W' },
  formFactor: { label: 'Form Factor' }, memoryType: { label: 'Bellek Tipi' },
  m2Slots: { label: 'M.2 Yuva' }, length: { label: 'Boy', s: 'mm' },
  maxGpuLength: { label: 'Max GPU', s: 'mm' }, wattage: { label: 'Güç', s: 'W' },
  supportedFormFactors: { label: 'Destek' }, interface: { label: 'Arayüz' },
  capacity: { label: 'Kapasite', s: '' }, speed: { label: 'Frekans', s: 'MHz' },
  readSpeed: { label: 'Okuma Hızı', s: 'MB/s' }, writeSpeed: { label: 'Yazma Hızı', s: 'MB/s' }
};

/* ── Custom Filter Dropdown ── */
function FilterDropdown({ filter, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isFiltered = !!value;
  const displayLabel = value ? `${value}${filter.s ? ` ${filter.s}` : ''}` : filter.label;

  return (
    <div className={`fd-wrap ${open ? 'fd-open' : ''} ${isFiltered ? 'fd-active' : ''}`} ref={ref}>
      <button className="fd-trigger" onClick={() => setOpen(o => !o)}>
        <svg className="fd-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        <span className="fd-label">{displayLabel}</span>
        <svg className="fd-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="fd-menu">
          <div className="fd-menu-inner">
            <button
              className={`fd-option ${!value ? 'fd-option-active' : ''}`}
              onClick={() => { onChange(''); setOpen(false); }}
            >
              <span className="fd-option-dot" />
              <span>Tümü</span>
            </button>
            {filter.options.map(opt => (
              <button
                key={opt}
                className={`fd-option ${value === opt ? 'fd-option-active' : ''}`}
                onClick={() => { onChange(opt); setOpen(false); }}
              >
                <span className="fd-option-dot" />
                <span>{opt}{filter.s ? ` ${filter.s}` : ''}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Builder() {
  const location = useLocation();
  const aiParts = location.state?.aiSelectedParts;
  
  const [activeCategory, setActiveCategory] = useState('cpu');
  const [selectedParts, setSelectedParts] = useState({
    cpu: null, motherboard: null, ram: null, storage: null, gpu: null, case: null, psu: null
  });

  useEffect(() => {
    if (aiParts) {
      fetch('http://localhost:5000/api/products')
        .then(res => res.json())
        .then(allProducts => {
          const newSelected = { ...selectedParts };
          Object.keys(aiParts).forEach(cat => {
            newSelected[cat] = allProducts.find(p => p.id === aiParts[cat]) || null;
          });
          setSelectedParts(newSelected);
          window.history.replaceState({}, document.title);
        })
        .catch(err => console.error("Error fetching all products:", err));
    }
  }, [aiParts]);
  const [compatibleProducts, setCompatibleProducts] = useState({
    cpu: [], motherboard: [], ram: [], storage: [], gpu: [], case: [], psu: []
  });
  const [totalTdp, setTotalTdp] = useState(0);
  const [loading, setLoading] = useState(false);
  const [justSelected, setJustSelected] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    fetchCompatibleProducts();
  }, [selectedParts]);

  const fetchCompatibleProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/products/compatible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedParts: getSelectedIds() })
      });
      const data = await response.json();
      setCompatibleProducts(data.compatibleList);
      setTotalTdp(data.totalTdp);
    } catch (error) {
      console.error("Error fetching compatible products:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedIds = () => {
    const ids = {};
    Object.keys(selectedParts).forEach(key => {
      ids[key] = selectedParts[key] ? selectedParts[key].id : null;
    });
    return ids;
  };

  const handleSelectProduct = (product) => {
    if (selectedParts[activeCategory]?.id === product.id) {
      setSelectedParts(prev => ({ ...prev, [activeCategory]: null }));
    } else {
      setSelectedParts(prev => ({ ...prev, [activeCategory]: product }));
      setJustSelected(product.id);
      setTimeout(() => setJustSelected(null), 600);
      const currentIndex = CATEGORIES.findIndex(c => c.id === activeCategory);
      if (currentIndex < CATEGORIES.length - 1) {
        setTimeout(() => setActiveCategory(CATEGORIES[currentIndex + 1].id), 400);
      }
    }
  };

  useEffect(() => {
    setActiveFilters({});
  }, [activeCategory]);

  const handleRemovePart = (categoryId) => {
    setSelectedParts(prev => ({ ...prev, [categoryId]: null }));
  };

  const calculateTotalPrice = () => {
    return Object.values(selectedParts).reduce((sum, part) => sum + (part ? part.price : 0), 0);
  };

  const selectedCount = Object.values(selectedParts).filter(Boolean).length;
  const progress = (selectedCount / CATEGORIES.length) * 100;
  
  const unfilteredProducts = compatibleProducts[activeCategory] || [];

  const availableFilters = useMemo(() => {
    if (!unfilteredProducts || unfilteredProducts.length === 0) return [];
    
    const allKeys = new Set();
    unfilteredProducts.forEach(p => {
      if (p.specs) Object.keys(p.specs).forEach(k => allKeys.add(k));
    });
    
    const keysArray = Array.from(allKeys).filter(k => SPEC_LABELS[k]);
    
    const filters = keysArray.map(key => {
      const values = new Set();
      unfilteredProducts.forEach(p => {
        if (p.specs && p.specs[key] != null) {
          const val = p.specs[key];
          if (Array.isArray(val)) val.forEach(v => values.add(String(v)));
          else values.add(String(val));
        }
      });
      return {
        key,
        label: SPEC_LABELS[key].label,
        s: SPEC_LABELS[key].s || '',
        options: Array.from(values).sort()
      };
    });
    
    return filters.slice(0, 3);
  }, [unfilteredProducts]);

  const currentProducts = useMemo(() => {
    return unfilteredProducts.filter(p => {
      for (const [key, selectedValue] of Object.entries(activeFilters)) {
        if (!selectedValue || selectedValue === '') continue;
        
        const productVal = p.specs[key];
        if (productVal == null) return false;
        
        if (Array.isArray(productVal)) {
          if (!productVal.some(v => String(v) === String(selectedValue))) return false;
        } else {
          if (String(productVal) !== String(selectedValue)) return false;
        }
      }
      return true;
    });
  }, [unfilteredProducts, activeFilters]);

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="builder-page">
      {/* Background decorations */}
      <div className="builder-bg-orb orb-1" />
      <div className="builder-bg-orb orb-2" />

      <div className="builder-page-header">
        <div className="builder-container">
          <div className="builder-header-inner">
            <div>
              <div className="builder-header-badge">
                <Zap size={14} />
                AI Uyumluluk Motoru Aktif
              </div>
              <h1 className="builder-page-title">Sistem <span>Sihirbazı</span></h1>
              <p className="builder-page-subtitle">
                Adım adım seçim yap, sistem uyumluluğu otomatik kontrol edilir.
              </p>
            </div>
            <div className="builder-progress-box">
              <div className="builder-progress-labels">
                <span>{selectedCount}/{CATEGORIES.length} Parça Seçildi</span>
                <span className="builder-progress-pct">{Math.round(progress)}%</span>
              </div>
              <div className="builder-progress-track">
                <div className="builder-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="builder-container">
        <div className="builder-layout">

          {/* ── LEFT: Vertical Stepper ── */}
          <aside className="builder-stepper-panel glass-panel">
            <p className="stepper-panel-title">Parçalar</p>
            <nav className="builder-stepper">
              {CATEGORIES.map((cat, i) => {
                const Icon = cat.icon;
                const isSelected = !!selectedParts[cat.id];
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    className={`stepper-item ${isActive ? 'is-active' : ''} ${isSelected ? 'is-done' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <div className="stepper-icon-wrap">
                      {isSelected ? <Check size={16} /> : <Icon size={16} />}
                    </div>
                    <div className="stepper-text">
                      <span className="stepper-label">{cat.label}</span>
                      <span className="stepper-sub">
                        {isSelected ? selectedParts[cat.id].name.substring(0, 22) + '…' : cat.sub}
                      </span>
                    </div>
                    {isActive && <ChevronRight size={14} className="stepper-arrow" />}
                    {i < CATEGORIES.length - 1 && <div className={`stepper-line ${isSelected ? 'filled' : ''}`} />}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* ── CENTER: Product List ── */}
          <main className="builder-products-area">
            <div className="builder-cat-header">
              {(() => {
                const cat = CATEGORIES.find(c => c.id === activeCategory);
                const Icon = cat.icon;
                return (
                  <>
                    <div className="builder-cat-icon-wrap">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h2 className="builder-cat-title">{cat.label}</h2>
                      <p className="builder-cat-sub">{cat.sub}</p>
                    </div>

                    {availableFilters.length > 0 && (
                      <div className="builder-cat-filters">
                        {availableFilters.map(filter => (
                          <FilterDropdown
                            key={filter.key}
                            filter={filter}
                            value={activeFilters[filter.key] || ''}
                            onChange={(val) => handleFilterChange(filter.key, val)}
                          />
                        ))}
                      </div>
                    )}

                    <span className="builder-cat-count">
                      {currentProducts.length} ürün
                    </span>
                  </>
                );
              })()}
            </div>



            {loading ? (
              <div className="builder-loading">
                <div className="builder-spinner" />
                <span>Uyumlu ürünler yükleniyor…</span>
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="builder-empty">
                <AlertCircle size={40} />
                <p>Bu kategori için uyumlu ürün bulunamadı.<br />Önceki seçimlerinizi kontrol edin.</p>
              </div>
            ) : (
              <div className="builder-product-list">
                {currentProducts.map(product => {
                  const isSelected = selectedParts[activeCategory]?.id === product.id;
                  const isFlashing = justSelected === product.id;
                  return (
                    <div
                      key={product.id}
                      className={`builder-product-row ${isSelected ? 'row-selected' : ''} ${isFlashing ? 'row-flash' : ''}`}
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="row-img-wrap">
                        <img src={product.image} alt={product.name} className="row-img" />
                      </div>
                      <div className="row-info">
                        <h3 className="row-name">{product.name}</h3>
                        <div className="row-specs">
                          {Object.entries(product.specs).map(([key, val]) => {
                            if (val === null) return null;
                            const info = SPEC_LABELS[key] || { label: key, s: '' };
                            const valueStr = Array.isArray(val) ? val.join(', ') : val;
                            return (
                              <span key={key} className="row-spec-chip">
                                <b>{info.label}:</b> {valueStr}{info.s || ''}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div className="row-price-col">
                        <div className="row-price">{product.price.toLocaleString('tr-TR')} TL</div>
                        <button className={`row-btn ${isSelected ? 'row-btn-remove' : 'row-btn-add'}`}>
                          {isSelected ? (
                            <><X size={14} /> Kaldır</>
                          ) : (
                            <><Check size={14} /> Seç</>
                          )}
                        </button>
                      </div>
                      {isSelected && <div className="row-selected-bar" />}
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          {/* ── RIGHT: Summary Panel ── */}
          <aside className="builder-summary-panel glass-panel">
            <div className="summary-header">
              <ShoppingCart size={18} />
              <span>Sistem Özeti</span>
            </div>

            <div className="summary-parts">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const part = selectedParts[cat.id];
                const isActive = activeCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    className={`summary-part ${part ? 'part-filled' : 'part-empty'} ${isActive ? 'part-active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <div className="part-icon">
                      <Icon size={14} />
                    </div>
                    <div className="part-content">
                      <span className="part-cat">{cat.label}</span>
                      {part ? (
                        <span className="part-name">{part.name.substring(0, 28)}{part.name.length > 28 ? '…' : ''}</span>
                      ) : (
                        <span className="part-empty-text">Seçilmedi</span>
                      )}
                    </div>
                    <div className="part-right">
                      {part ? (
                        <>
                          <span className="part-price">{part.price.toLocaleString('tr-TR')} TL</span>
                          <button
                            className="part-remove-btn"
                            onClick={e => { e.stopPropagation(); handleRemovePart(cat.id); }}
                            title="Kaldır"
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <span className="part-add-hint">+</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="summary-totals">
              <div className="summary-watt">
                <Power size={14} />
                Tahmini Güç Tüketimi
                <span className="watt-value">{totalTdp} W</span>
              </div>
              <div className="summary-total-row">
                <span>Toplam</span>
                <span className="summary-total-price">
                  {calculateTotalPrice().toLocaleString('tr-TR')} TL
                </span>
              </div>
            </div>

            <button
              className={`summary-cta-btn ${selectedCount === CATEGORIES.length ? 'cta-ready' : ''}`}
              disabled={selectedCount === 0}
            >
              <Zap size={16} />
              {selectedCount === CATEGORIES.length ? 'Sistemi Onayla & Sipariş Ver' : `${CATEGORIES.length - selectedCount} Parça Kaldı`}
            </button>
          </aside>

        </div>
      </div>
    </div>
  );
}

export default Builder;
