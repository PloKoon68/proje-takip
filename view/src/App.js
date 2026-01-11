import './style/App.css';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import Navbar from './components/Navbar';
import PrivateRoute from './components/Routes/PrivateRoute.js';
import NonePrivateRoute from './components/Routes/NonePrivateRoute.js';

// Yeni Sayfa Komponentleri
import ProjectsPage from './components/Pages/Authenticated Pages/ProjectsPage.js';
import ProjectDetailPage from './components/Pages/Authenticated Pages/ProjectDetailPage.js';

import LoginPage from "./components/Pages/None Authenticated Pages/LoginPage.js"
import RegisterPage from "./components/Pages/None Authenticated Pages/RegisterPage.js"

import LandingPage from './components/Pages/Public Pages/LandingPage'; 
import AboutPage from './components/Pages/Public Pages/AboutPage.js';
import ServerDownPage from "./components/Pages/ServerDownPage.js"

import { useAuth } from './components/AuthContext';
import { checkExpressHealth } from './api/axious.js';
import GlobalSpinner from "./components/GlobalSpinner.js"

function App() {
  const { isLoggedIn, waitAuthorization } = useAuth();
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    checkExpressHealth();
  }, []);

  return (
    <>
      {waitAuthorization ? (
        <GlobalSpinner />
      ) : (
        <div className='App'>
          <Navbar saved={saved} setSaved={setSaved} />

          <Routes>
            {/* Ana Sayfa: Giriş yapılmışsa projelere, yapılmamışsa tanıtıma yönlendir */}
            <Route path="/" element={
              isLoggedIn ? <Navigate to="/projeler" /> : <LoginPage />
            } />

            {/* Auth Gerekli Olmayan Sayfalar */}
            <Route path="/login" element={
              <NonePrivateRoute>
                <LoginPage />
              </NonePrivateRoute>
            } />

            <Route path="/kayit-ol" element={
              <NonePrivateRoute>
                <RegisterPage />
              </NonePrivateRoute>
            } />

            {/* Auth GEREKLİ Olan Sayfalar (PROJE TAKİP SİSTEMİ) */}
            <Route path="/projeler" element={
              <PrivateRoute>
                <ProjectsPage />
              </PrivateRoute>
            } />

            <Route path="/proje/:projectId" element={
              <PrivateRoute>
                <ProjectDetailPage />
              </PrivateRoute>
            } />

            {/* Diğer Sayfalar */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/server-error" element={<ServerDownPage />} />
            
            {/* Yanlış URL girilirse ana sayfaya at */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      )}
    </>
  );
}

export default App;