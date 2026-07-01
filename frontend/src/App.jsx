import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Cpu, Zap, Mail, Phone } from 'lucide-react';
import Home from './pages/Home';
import Builder from './pages/Builder';
import ProductDetail from './pages/ProductDetail';
import AIBuilder from './pages/AIBuilder';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'is-scrolled' : 'transparent-header'}`}>
      <div className="container-fluid flex justify-between items-center">
        <Link to="/" className="logo">
          <Cpu color="#00f0ff" size={32} />
          <span>NEON</span> BUILDER
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">Ana Sayfa</Link>
          <Link to="/builder" className="nav-link">Sistemi Topla</Link>
          <Link to="/ai-builder" className="nav-link" style={{ color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '5px' }}><Zap size={16} /> PC Asistan</Link>
        </nav>
        <Link to="/builder" className="btn btn-primary">
          <Zap size={18} /> ŞİMDİ BAŞLA
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer relative mt-32">
      <div className="footer-top-border"></div>
      <div className="footer-glow"></div>
      <div className="footer-glow-right"></div>

      <div className="container-fluid relative z-10">
        <div className="footer-grid">
          
          {/* Brand & Newsletter Section */}
          <div className="footer-brand">
            <Link to="/" className="logo flex items-center gap-2 mb-6" style={{ fontSize: '1.8rem' }}>
              <Cpu color="var(--primary-color)" size={32} />
              <span style={{ color: '#fff' }}>NEON</span> BUILDER
            </Link>
            <p className="footer-desc mb-6 text-muted">
              Profesyonel oyuncular ve donanım tutkunları için geliştirilmiş akıllı sistem asistanı. Hayalinizdeki bilgisayarı bugün inşa edin.
            </p>
            <div className="newsletter-box">
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} color="var(--primary-color)" />
                <h4 style={{ color: '#fff', fontWeight: 600 }}>Bültene Katıl</h4>
              </div>
              <div className="newsletter-input-group">
                <input type="email" placeholder="E-posta adresiniz..." />
                <button type="button">Kaydol</button>
              </div>
            </div>
          </div>

          {/* Hızlı Bağlantılar */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Hızlı Bağlantılar</h4>
            <ul>
              <li><Link to="/">Ana Sayfa</Link></li>
              <li><Link to="/builder">Sistem Topla</Link></li>
              <li><a href="#">Popüler Ürünler</a></li>
              <li><a href="#">Yenilikler</a></li>
              <li><a href="#">Sipariş Takibi</a></li>
            </ul>
          </div>

          {/* Kategoriler */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Kategoriler</h4>
            <ul>
              <li><a href="#">Performans İşlemcileri</a></li>
              <li><a href="#">RTX Ekran Kartları</a></li>
              <li><a href="#">Oyuncu Anakartları</a></li>
              <li><a href="#">Extreme Soğutmalar</a></li>
              <li><a href="#">Modüler Kasalar</a></li>
            </ul>
          </div>

          {/* İletişim */}
          <div className="footer-links-col">
            <h4 className="footer-heading">İletişim</h4>
            <ul>
              <li>
                <div className="flex items-center gap-3" style={{ paddingRight: "10px" }}>
                  <Phone size={18} color="var(--primary-color)" style={{ flexShrink: 0 }} />
                  <span style={{ paddingLeft: "10px" }}>+90 (555) 555 55 55</span>
                </div>
              </li>
              <li>
                <div className="flex items-center gap-3">
                  <Mail size={18} color="var(--primary-color)" style={{ flexShrink: 0 }} />
                  <span style={{ paddingLeft: "10px" }}>destek@neonbuilder.com</span>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-3">
                  <Zap size={18} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '4px' }} />
                  <span style={{ paddingLeft: "10px" }}>Teknoloji Vadisi, Oyuncu Sk. No:42<br/>Silikon Vadisi, TR</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            &copy; {new Date().getFullYear()} Neon Builder. Tüm hakları saklıdır.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook">FB</a>
            <a href="#" aria-label="X (Twitter)">X</a>
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Discord">DC</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app-layout">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/ai-builder" element={<AIBuilder />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
