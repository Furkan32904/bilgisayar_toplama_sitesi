import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Zap, ShoppingCart, Cpu, LayoutGrid } from 'lucide-react';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex justify-center items-center min-h-300 mt-12">
        <Zap className="spin" color="var(--primary-color)" size={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mt-12 text-center">
        <h2 className="section-title">Ürün Bulunamadı!</h2>
        <Link to="/" className="btn btn-secondary mt-8"><ArrowLeft size={18}/> Ana Sayfaya Dön</Link>
      </div>
    );
  }

  return (
    <div style={{position: 'relative', overflow: 'hidden' }}>
      {/* Background Ambience specific to detail page */}
      <div className="neon-blob cyan" style={{ top: '10%', left: '5%' }}></div>
      <div className="neon-blob magenta" style={{ bottom: '10%', right: '5%', opacity: 0.3 }}></div>

      <div className="container" style={{ padding: '150px 4% 150px', position: 'relative', zIndex: 10 }}>
        <Link to="/" className="back-link mb-8">
          <ArrowLeft size={18} /> Geri Dön
        </Link>

        <div className="product-detail-layout">
          {/* Sol Görsel Alanı */}
          <div className="glass-panel p-5 flex justify-center items-center" style={{ minHeight: '500px', position: 'relative' }}>
            {/* Arka plan parlama efekti */}
            <div style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              background: 'var(--primary-color)',
              filter: 'blur(80px)',
              opacity: 0.2,
              borderRadius: '50%'
            }}></div>
            
            <img 
              src={product.image} 
              alt={product.name} 
              className="hero-float-img" /* Reuse animation */
              style={{ maxWidth: '80%', zIndex: 2 }} 
            />
          </div>

          {/* Sağ İçerik Alanı */}
          <div className="product-details flex flex-col justify-center">
            
            <div className="flex items-center gap-4 mb-4">
              <span className="feature-badge" style={{ padding: '6px 16px', fontSize: '0.9rem' }}>
                <LayoutGrid size={16} />
                {product.category.toUpperCase()}
              </span>
              <span className="flex items-center gap-2 text-muted opacity-80" style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                <Check color="#00ff00" size={18} /> Stokta Var - Hemen Teslim
              </span>
            </div>

            <h1 className="gradient-text" style={{ fontSize: '3rem', lineHeight: '1.2', marginBottom: '24px' }}>
              {product.name}
            </h1>
            
            <div className="cart-total-price mb-8" style={{ fontSize: '3.5rem' }}>
              {product.price.toLocaleString('tr-TR')} TL
            </div>

            <div className="glass p-5 mb-8" style={{ borderLeft: '4px solid var(--primary-color)' }}>
              <h3 className="mb-6 flex items-center gap-2">
                <Cpu size={20} color="var(--primary-color)" /> Teknik Özellikler
              </h3>
              
              <div className="flex flex-col">
                {Object.entries(product.specs).map(([key, val]) => {
                  const specLabels = {
                    socket: { label: 'Soket', s: '' }, tdp: { label: 'TDP', s: 'W' },
                    formFactor: { label: 'Boyut', s: '' }, memoryType: { label: 'Bellek Tipi', s: '' },
                    m2Slots: { label: 'M.2 Yuva', s: '' }, length: { label: 'Boy', s: 'mm' },
                    maxGpuLength: { label: 'Max GPU', s: 'mm' }, wattage: { label: 'Güç', s: 'W' },
                    supportedFormFactors: { label: 'Destek', s: '' }, interface: { label: 'Arayüz', s: '' },
                    capacity: { label: 'Kapasite', s: '' }, speed: { label: 'Frekans', s: 'MHz' },
                    readSpeed: { label: 'Okuma Hızı', s: 'MB/s' }, writeSpeed: { label: 'Yazma Hızı', s: 'MB/s' }
                  };
                  const info = specLabels[key] || { label: key, s: '' };
                  return (
                    <div key={key} className="spec-row">
                      <span className="text-muted">{info.label}</span>
                      <span style={{ fontWeight: '600', color: '#fff' }}>
                        {Array.isArray(val) ? val.join(', ') : val} {info.s}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <Link to="/builder" className="btn btn-primary w-full" style={{ padding: '20px', fontSize: '1.2rem', flex: 2 }}>
                <Zap size={24} /> SİHİRBAZ İLE TOPLA
              </Link>
              <button className="btn btn-secondary" style={{ padding: '0 32px', flex: 1 }} title="Tekil Sepete Ekle">
                <ShoppingCart size={24} /> SEPETE AT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
