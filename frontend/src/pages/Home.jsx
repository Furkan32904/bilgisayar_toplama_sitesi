import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu, Box, Monitor, HardDrive, Gamepad2, Wifi,
  Printer, Wrench, PackageOpen, Zap, ChevronLeft,
  ChevronRight, ArrowRight, TrendingUp, Sparkles
} from 'lucide-react';

const CATEGORIES = [
  { id: 'parts',       label: 'Bilgisayar Parçaları', icon: Cpu },
  { id: 'oem',         label: 'OEM Paketler',          icon: PackageOpen },
  { id: 'pc',          label: 'Bilgisayar',            icon: Monitor },
  { id: 'peripherals', label: 'Çevre Birimleri',       icon: Box },
  { id: 'storage',     label: 'Depolama',              icon: HardDrive },
  { id: 'gaming',      label: 'Oyun ve Hobi',          icon: Gamepad2 },
  { id: 'network',     label: 'Network',               icon: Wifi },
  { id: 'office',      label: 'Ofis Ürünleri',         icon: Printer },
  { id: 'software',    label: 'Yazılım',               icon: Wrench },
];

const FILTER_TABS = [
  { value: 'all',         label: 'Tümü' },
  { value: 'cpu',         label: 'İşlemciler' },
  { value: 'gpu',         label: 'Ekran Kartları' },
  { value: 'motherboard', label: 'Anakartlar' },
  { value: 'ram',         label: 'RAM' },
  { value: 'storage',     label: 'Depolama' },
  { value: 'case',        label: 'Kasalar' },
  { value: 'psu',         label: 'Güç Kaynakları' },
];

function Home() {
  const [products, setProducts] = useState([]);
  const [randomProducts, setRandomProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeSidebar, setActiveSidebar] = useState(null);

  const randomSliderRef = useRef(null);
  const categorySliderRef = useRef(null);

  const scroll = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === 'left' ? -360 : 360, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setRandomProducts(shuffled.slice(0, 10));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, []);

  const specLabels = {
    socket: { label: 'Soket', s: '' }, tdp: { label: 'TDP', s: 'W' },
    formFactor: { label: 'Boyut', s: '' }, memoryType: { label: 'Tip', s: '' },
    m2Slots: { label: 'M.2', s: ' Yuva' }, length: { label: 'Boy', s: 'mm' },
    maxGpuLength: { label: 'Max GPU', s: 'mm' }, wattage: { label: 'Güç', s: 'W' },
    supportedFormFactors: { label: 'Destek', s: '' }, interface: { label: 'Arayüz', s: '' },
    capacity: { label: 'Kapasite', s: '' }, speed: { label: 'Frekans', s: 'MHz' },
    readSpeed: { label: 'Okuma Hızı', s: 'MB/s' }, writeSpeed: { label: 'Yazma Hızı', s: 'MB/s' }
  };

  /* ── Product Card (slider) ── */
  const ProductCard = ({ product }) => (
    <div className="store-card">
      <Link to={`/product/${product.id}`} className="store-card-inner glass">
        {/* Fiyat rozeti */}
        <div className="store-card-price-badge">
          {product.price.toLocaleString('tr-TR')} TL
        </div>

        <div className="store-card-img-wrap">
          <img src={product.image} alt={product.name} className="store-card-img" />
        </div>

        <div className="store-card-body">
          <div className="store-card-specs">
            {Object.entries(product.specs).slice(0, 2).map(([key, val]) => {
              const info = specLabels[key] || { label: key, s: '' };
              const valueStr = Array.isArray(val) ? val[0] + '…' : val;
              return (
                <span key={key} className="store-spec-chip">
                  <b>{info.label}:</b> {valueStr}{info.s}
                </span>
              );
            })}
          </div>

          <h3 className="store-card-name">{product.name}</h3>

          <div className="store-card-footer">
            <span className="store-card-price-text">
              {product.price.toLocaleString('tr-TR')} TL
            </span>
            <span className="store-card-cta">
              Detay <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );

  return (
    <div className="store-page">
      {/* subtle bg orbs */}
      <div className="store-orb orb-a" />
      <div className="store-orb orb-b" />

      <div className="store-wrapper">

        {/* ════ TOP SECTION: Sidebar + Banners ════ */}
        <div className="container-fluid store-top">

          {/* ── Sidebar ── */}
          <aside className="store-sidebar glass-panel">
            <p className="sidebar-section-title">Kategoriler</p>
            <nav className="sidebar-nav">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <a
                    href="#"
                    key={cat.id}
                    className={`store-sidebar-item ${activeSidebar === cat.id ? 'is-active' : ''}`}
                    onClick={e => { e.preventDefault(); setActiveSidebar(cat.id); }}
                  >
                    <span className="sidebar-item-icon">
                      <Icon size={16} />
                    </span>
                    <span className="sidebar-item-label">{cat.label}</span>
                    <ChevronRight size={13} className="sidebar-item-arrow" />
                  </a>
                );
              })}
            </nav>
          </aside>

          {/* ── Banners ── */}
          <div className="store-banners">
            {/* Main banner */}
            <div className="store-main-banner glass">
              <div className="main-banner-overlay" />
              <div className="main-banner-content">
                <span className="main-banner-badge">
                  <Zap size={12} /> Fırsatlar
                </span>
                <h2 className="main-banner-title">
                  Seçili Bileşenlerde<br />
                  <span>Süper İndirimler!</span>
                </h2>
                <p className="main-banner-sub">Yeni Nesil Donanımlarla Sınırları Zorla</p>
                <button className="main-banner-btn">
                  İncele <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Side banners */}
            <div className="store-side-banners">
              <div className="store-side-banner banner-rose glass">
                <span className="side-banner-label">Sınırlı Süre!</span>
                <p className="side-banner-desc">Seçili ekran kartlarında %30 indirim</p>
                <div className="side-banner-glow" />
              </div>
              <div className="store-side-banner banner-sky glass">
                <span className="side-banner-label">En İyi Kampanyalar</span>
                <p className="side-banner-desc">Teknolojiyi yaşamak için doğru yerdesin.</p>
                <div className="side-banner-glow" />
              </div>
            </div>
          </div>
        </div>

        {/* ════ BOTTOM SECTION: Sliders ════ */}
        <div className="container-fluid store-sliders">

          {loading ? (
            <div className="store-loading">
              <div className="store-spinner" />
              <span>Ürünler yükleniyor…</span>
            </div>
          ) : (
            <>
              {/* ── Picks Slider ── */}
              <section className="picks-section">
                <div className="picks-section-header">
                  <div className="picks-section-title">
                    <div className="picks-title-icon">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <h2 className="picks-title-text">Sizin İçin Seçtiklerimiz</h2>
                      <p className="picks-title-sub">Her ziyarette yeni keşifler seni bekliyor</p>
                    </div>
                  </div>
                  <a href="#" className="picks-see-all">
                    Tümünü Gör <ArrowRight size={14} />
                  </a>
                </div>

                <div className="store-slider-wrap">
                  <button className="store-arrow left" onClick={() => scroll(randomSliderRef, 'left')}>
                    <ChevronLeft size={18} />
                  </button>
                  <div className="store-slider" ref={randomSliderRef}>
                    {randomProducts.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                  <button className="store-arrow right" onClick={() => scroll(randomSliderRef, 'right')}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </section>

              {/* ── Category Slider ── */}
              <section className="cat-section glass-panel">
                <div className="cat-section-header">
                  <div className="cat-section-title-wrap">
                    <Sparkles size={18} className="cat-section-icon" />
                    <h2 className="cat-section-title">Kategoriler</h2>
                  </div>
                  <div className="cat-tabs">
                    {FILTER_TABS.map(tab => (
                      <button
                        key={tab.value}
                        className={`cat-tab ${selectedCategory === tab.value ? 'cat-tab-active' : ''}`}
                        onClick={() => setSelectedCategory(tab.value)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="store-slider-wrap">
                  <button className="store-arrow left" onClick={() => scroll(categorySliderRef, 'left')}>
                    <ChevronLeft size={18} />
                  </button>
                  <div className="store-slider" ref={categorySliderRef}>
                    {products
                      .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
                      .map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                  <button className="store-arrow right" onClick={() => scroll(categorySliderRef, 'right')}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
