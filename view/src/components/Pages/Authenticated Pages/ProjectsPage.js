import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, FileText, Calendar, Users, X, Save } from 'lucide-react';
import '../../../style/Pages/ProjectPages.css';

const ProjectsPage = () => {
  const navigate = useNavigate();
  
  // State Tanımlamaları
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    year: "2025",
    responsible: [],
    projectText: {
      purpose: "",
      targetAudience: "",
      description: ""
    },
    annualPlan: null
  });

  // Örnek Sorumlu Listesi (Normalde DB'den gelecek)
  const employeeList = ["Ahmet Yılmaz", "Ayşe Demir", "Mehmet Öz", "Fatma Şahin"];
  const years = ["2024", "2025", "2026", "2027"];

  // Form Değişiklik Yönetimi
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleResponsibleChange = (person) => {
    setFormData(prev => ({
      ...prev,
      responsible: prev.responsible.includes(person)
        ? prev.responsible.filter(p => p !== person)
        : [...prev.responsible, person]
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, annualPlan: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProject = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toLocaleDateString()
    };
    setProjects([...projects, newProject]);
    setIsModalOpen(false);
    // Formu sıfırla
    setFormData({
      title: "", year: "2025", responsible: [],
      projectText: { purpose: "", targetAudience: "", description: "" },
      annualPlan: null
    });
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="projects-container">
      <div className="projects-header">
        <div className="header-content">
          <h1>Projelerim</h1>
          <p>Tüm projelerinizi ve içerisindeki etkinlikleri buradan yönetebilirsiniz.</p>
        </div>
        <button className="add-project-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Yeni Proje Oluştur
        </button>
      </div>

      <div className="search-section">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Proje ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="projects-grid">
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <p>Henüz proje eklenmemiş veya arama sonucu bulunamadı.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project.id} className="project-card" onClick={() => navigate(`/project/${project.id}`)}>
              <div className="card-header">
                <h3>{project.title}</h3>
                <span className="year-badge">{project.year}</span>
              </div>
              <div className="card-body">
                <p className="description-preview">{project.projectText.description.substring(0, 100)}...</p>
                <div className="card-meta">
                  <div className="meta-item">
                    <Users size={14} /> <span>{project.responsible.length} Sorumlu</span>
                  </div>
                  <div className="meta-item">
                    <Calendar size={14} /> <span>{project.createdAt}</span>
                  </div>
                </div>
              </div>
              <div className="card-actions">
                <button className="icon-btn edit"><Edit2 size={16} /></button>
                <button className="icon-btn delete" onClick={(e) => {
                  e.stopPropagation();
                  setProjects(projects.filter(p => p.id !== project.id));
                }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PROJE EKLEME MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Yeni Proje Kaydı</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Proje Adı</label>
                <input name="title" required value={formData.title} onChange={handleInputChange} placeholder="Proje ismini giriniz..." />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Uygulama Yılı</label>
                  <select name="year" value={formData.year} onChange={handleInputChange}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Yıllık Plan (PDF/DOCX)</label>
                  <input type="file" onChange={handleFileChange} accept=".pdf,.docx" />
                </div>
              </div>

              <div className="form-group">
                <label>Sorumlular</label>
                <div className="responsible-selection">
                  {employeeList.map(person => (
                    <label key={person} className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={formData.responsible.includes(person)}
                        onChange={() => handleResponsibleChange(person)}
                      />
                      {person}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Proje Metni</label>
                <div className="text-fields">
                  <input 
                    name="projectText.purpose" 
                    placeholder="Amaç" 
                    value={formData.projectText.purpose} 
                    onChange={handleInputChange} 
                  />
                  <input 
                    name="projectText.targetAudience" 
                    placeholder="Hedef Kitle" 
                    value={formData.projectText.targetAudience} 
                    onChange={handleInputChange} 
                  />
                  <textarea 
                    name="projectText.description" 
                    placeholder="Genel Açıklama (Maks 1000 karakter)" 
                    maxLength="1000"
                    value={formData.projectText.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>İptal</button>
                <button type="submit" className="save-btn"><Save size={18} /> Projeyi Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;