import { useState } from 'react';
import { Menu, X, Brain, FolderOpen, LogOut, LogIn, UserPlus, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; 
import { logout } from "../api/apiCalls/Express/auth";
import '../style/Navbar.css';

function Navbar({ saved = true, setSaved = () => {} }) {
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (targetPath) => {
    if (!saved) {
      const shouldLeave = window.confirm("Kaydedilmemiş değişiklikleriniz var. Ayrılmak istediğinize emin misiniz?");
      if (!shouldLeave) return false;
    }
    setSaved(true);
    navigate(targetPath);
    setMobileMenuOpen(false);
    return true;
  };

  const handleLogout = async () => {
    const proceed = handleNavigation('/login');
    if (proceed) {
      await logout();
      setIsLoggedIn(false);
    }
  };

  return (
    <nav className="main-navbar">
      <div className="navbar-container">
        {/* Sol Kısım: Logo ve Linkler */}
        <div className="nav-left">
          <button onClick={() => handleNavigation('/')} className="nav-logo">
            <Brain className="logo-icon" />
            <span className="logo-text">Proje Takip</span>
          </button>

          <div className="nav-links desktop-only">
            <button onClick={() => handleNavigation('/about')} className="nav-item">
              <Info size={18} /> Hakkında
            </button>
            {isLoggedIn && (
              <button onClick={() => handleNavigation('/projeler')} className="nav-item">
                <FolderOpen size={18} /> Projelerim
              </button>
            )}
          </div>
        </div>

        {/* Sağ Kısım: Auth Butonları */}
        <div className="nav-right desktop-only">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="auth-btn logout-btn">
              <LogOut size={18} /> Çıkış Yap
            </button>
          ) : (
            <>
              <button onClick={() => handleNavigation('/login')} className="auth-btn login-link">
                <LogIn size={18} /> Giriş
              </button>
              <button onClick={() => handleNavigation('/kayit-ol')} className="auth-btn register-btn">
                <UserPlus size={18} /> Kayıt Ol
              </button>
            </>
          )}
        </div>

        {/* Mobil Menü Butonu */}
        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobil Menü İçeriği */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <button onClick={() => handleNavigation('/about')} className="mobile-item">Hakkında</button>
          {isLoggedIn && (
            <button onClick={() => handleNavigation('/projeler')} className="mobile-item">Projelerim</button>
          )}
          <div className="mobile-auth">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="mobile-auth-btn logout">Çıkış Yap</button>
            ) : (
              <>
                <button onClick={() => handleNavigation('/login')} className="mobile-auth-btn">Giriş</button>
                <button onClick={() => handleNavigation('/kayit-ol')} className="mobile-auth-btn register">Kayıt Ol</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;