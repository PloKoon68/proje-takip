import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit3, Plus, Trash2, Calendar, 
  MapPin, Users, Info, CheckCircle, Clock, Save, X 
} from 'lucide-react';
import '../../../style/Pages/ProjectPage.css';

const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Proje Verisi (Normalde API'den gelecek)
  const [project, setProject] = useState({
    id: projectId,
    title: "Örnek Proje Başlığı",
    year: "2025",
    responsible: ["Ahmet Yılmaz", "Ayşe Demir"],
    projectText: {
      purpose: "Eğitimde teknoloji kullanımını artırmak.",
      targetAudience: "Lise öğrencileri ve öğretmenler.",
      description: "Bu proje kapsamında okullarda kodlama atölyeleri kurulması hedeflenmektedir."
    },
    activities: [
      { id: 1, name: "Tanıtım Semineri", date: "2025-03-10", location: "Konferans Salonu", status: "Tamamlandı" },
      { id: 2, name: "Atölye Çalışması - 1", date: "2025-04-15", location: "Bilişim Laboratuvarı", status: "Beklemede" }
    ]
  });

  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({ name: "", date: "", location: "", status: "Beklemede" });

  // Etkinlik Ekleme Fonksiyonu
  const handleAddActivity = (e) => {
    e.preventDefault();
    const activity = { ...newActivity, id: Date.now() };
    setProject({ ...project, activities: [...project.activities, activity] });
    setIsAddingActivity(false);
    setNewActivity({ name: "", date: "", location: "", status: "Beklemede" });
  };

  return (
    <div className="project-detail-container">
      {/* Üst Navigasyon */}
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/projeler')}>
          <ArrowLeft size={20} /> Projelere Dön
        </button>
        <div className="header-actions">
          <button className="edit-project-btn"><Edit3 size={18} /> Projeyi Düzenle</button>
        </div>
      </div>

      {/* Proje Özet Bilgileri */}
      <section className="project-overview">
        <div className="title-section">
          <h1>{project.title}</h1>
          <span className="year-tag">{project.year} Uygulama Yılı</span>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <div className="info-label"><Users size={16} /> Sorumlular</div>
            <div className="info-value">{project.responsible.join(", ")}</div>
          </div>
          <div className="info-card">
            <div className="info-label"><Info size={16} /> Amaç ve Hedef Kitle</div>
            <div className="info-value">
              <strong>Amaç:</strong> {project.projectText.purpose} <br/>
              <strong>Kitle:</strong> {project.projectText.targetAudience}
            </div>
          </div>
          <div className="info-card full-width">
            <div className="info-label">Proje Açıklaması</div>
            <div className="info-value">{project.projectText.description}</div>
          </div>
        </div>
      </section>

      {/* Etkinlikler Bölümü */}
      <section className="activities-section">
        <div className="section-header">
          <h2>Etkinlik Takvimi</h2>
          <button className="add-activity-btn" onClick={() => setIsAddingActivity(true)}>
            <Plus size={18} /> Yeni Etkinlik Ekle
          </button>
        </div>

        <div className="activities-list">
          {project.activities.length === 0 ? (
            <div className="no-activities">Henüz bir etkinlik planlanmamış.</div>
          ) : (
            <table className="activities-table">
              <thead>
                <tr>
                  <th>Etkinlik Adı</th>
                  <th>Tarih</th>
                  <th>Yer</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {project.activities.map(activity => (
                  <tr key={activity.id}>
                    <td><strong>{activity.name}</strong></td>
                    <td><div className="cell-with-icon"><Calendar size={14} /> {activity.date}</div></td>
                    <td><div className="cell-with-icon"><MapPin size={14} /> {activity.location}</div></td>
                    <td>
                      <span className={`status-badge ${activity.status === 'Tamamlandı' ? 'done' : 'pending'}`}>
                        {activity.status === 'Tamamlandı' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {activity.status}
                      </span>
                    </td>
                    <td className="table-actions">
                      <button className="icon-btn edit"><Edit3 size={14} /></button>
                      <button className="icon-btn delete" onClick={() => {
                        setProject({...project, activities: project.activities.filter(a => a.id !== activity.id)})
                      }}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ETKİNLİK EKLEME MODAL */}
      {isAddingActivity && (
        <div className="modal-overlay">
          <div className="modal-content mini">
            <div className="modal-header">
              <h3>Yeni Etkinlik</h3>
              <button onClick={() => setIsAddingActivity(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddActivity}>
              <div className="form-group">
                <label>Etkinlik Adı</label>
                <input 
                  required 
                  value={newActivity.name} 
                  onChange={(e) => setNewActivity({...newActivity, name: e.target.value})}
                  placeholder="Örn: Veli Bilgilendirme Toplantısı"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tarih</label>
                  <input 
                    type="date" 
                    required 
                    value={newActivity.date} 
                    onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Yer</label>
                  <input 
                    required 
                    value={newActivity.location} 
                    onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                    placeholder="Örn: Okul Bahçesi"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsAddingActivity(false)}>Vazgeç</button>
                <button type="submit" className="save-btn"><Save size={16} /> Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;