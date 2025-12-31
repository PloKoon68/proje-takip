import { useState } from 'react';
import { Brain, Mail, Lock, AlertCircle, X, Zap, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { register } from "../../../api/apiCalls/Express/auth";
import '../../../style/Pages/Register.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    usernameBlank: false,
    usernameHasSpaces: false,
    passwordBlank: false,
    confirmPasswordNotMatch: false,
    emailBlank: false,
    userExists: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const _errors = {
      usernameBlank: !username.trim(),
      usernameHasSpaces: username.includes(" "),
      passwordBlank: !password.trim(),
      confirmPasswordNotMatch: password !== confirmPassword,
      emailBlank: !email.trim(),
      userExists: false
    };

    if (
      !_errors.usernameBlank &&
      !_errors.usernameHasSpaces &&
      !_errors.passwordBlank &&
      !_errors.confirmPasswordNotMatch &&
      !_errors.emailBlank
    ) {
      const result = await register(username, password, email);

      if (result.success) {
        setIsLoggedIn(true);
        navigate('/projeler'); // Başarılı kayıt sonrası projeler sayfasına yönlendirme
      } else if (result.reason === 'user_exists') {
        _errors.userExists = true;
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
            <h1>Hesap Oluştur</h1>
          </div>
          <p>Projelerinizi yönetmeye başlamak için aramıza katılın</p>
        </div>

        <div className="login-card">
          <form onSubmit={handleSubmit}>
            {errors.userExists && (
              <div className="auth-error-msg">
                <AlertCircle size={18} />
                <span>Bu kullanıcı adı veya e-posta zaten kullanımda!</span>
                <button type="button" onClick={() => setErrors(p => ({...p, userExists: false}))}>
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="input-group">
              <label>Kullanıcı Adı</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Kullanıcı adınızı belirleyin"
                />
              </div>
              {errors.usernameBlank && <p className="field-error">Kullanıcı adı boş bırakılamaz!</p>}
              {errors.usernameHasSpaces && <p className="field-error">Kullanıcı adı boşluk içeremez!</p>}
            </div>

            <div className="input-group">
              <label>E-posta Adresi</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@mail.com"
                />
              </div>
              {errors.emailBlank && <p className="field-error">E-posta alanı boş bırakılamaz!</p>}
            </div>

            <div className="input-group">
              <label>Şifre</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Güçlü bir şifre girin"
                />
              </div>
              {errors.passwordBlank && <p className="field-error">Şifre alanı boş bırakılamaz!</p>}
            </div>

            <div className="input-group">
              <label>Şifre Tekrar</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Şifrenizi tekrar girin"
                />
              </div>
              {errors.confirmPasswordNotMatch && <p className="field-error">Şifreler birbiriyle eşleşmiyor!</p>}
            </div>

            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                <>Kayıt Ol <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Zaten hesabınız var mı? <button onClick={() => navigate('/login')}>Giriş Yap</button></p>
          </div>
        </div>
      </div>
    </div>
  );
}