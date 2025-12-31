import { useState } from 'react';
import { Brain, Lock, AlertCircle, X, Zap, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { login } from "../../../api/apiCalls/Express/auth";
import '../../../style/Pages/Login.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    identifierBlank: false,
    passwordBlank: false,
    invalidCredentials: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const _errors = {
      identifierBlank: !identifier.trim(),
      passwordBlank: !password.trim(),
      invalidCredentials: false
    };

    if (!_errors.identifierBlank && !_errors.passwordBlank) {
      const result = await login(identifier, password);
      
      if (result.success) {
        setIsLoggedIn(true);
        navigate('/projeler');
      } else if (result.reason === 'invalid_credentials') {
        _errors.invalidCredentials = true;
      } else if (result.reason === 'server_error') {
        navigate('/server-error');
        return;
      }
    }

    setErrors(_errors);
    setIsLoading(false);
  };

  return (
    <div className="login-page">
      {/* Arka Plan Efektleri */}
      <div className="bg-glow blue"></div>
      <div className="bg-glow orange"></div>

      <div className="login-container">
        <div className="login-brand">
          <div className="brand-badge">
            <Zap size={14} /> <span>Proje Takip Sistemi</span>
          </div>
          <div className="brand-logo">
            <Brain size={32} />
            <h1>Giriş Yap</h1>
          </div>
          <p>Devam etmek için hesabınıza erişin</p>
        </div>

        <div className="login-card">
          <form onSubmit={handleSubmit}>
            {errors.invalidCredentials && (
              <div className="auth-error-msg">
                <AlertCircle size={18} />
                <span>Geçersiz kullanıcı adı veya şifre!</span>
                <button type="button" onClick={() => setErrors(p => ({...p, invalidCredentials: false}))}>
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="input-group">
              <label>E-posta veya Kullanıcı Adı</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Kullanıcı adınızı girin"
                />
              </div>
              {errors.identifierBlank && <p className="field-error">Bu alan boş bırakılamaz!</p>}
            </div>

            <div className="input-group">
              <label>Şifre</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrenizi girin"
                />
              </div>
              {errors.passwordBlank && <p className="field-error">Şifre boş bırakılamaz!</p>}
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                <>Giriş Yap <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Hesabınız yok mu? <button onClick={() => navigate('/kayit-ol')}>Kayıt Ol</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}