// view/src/components/Pages/Authenticated Pages/ProjectsPage.js
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save, X, Search, Clock, Calendar, Users, FileText, Upload, CheckCircle, AlertCircle } from "lucide-react";
import "../../../style/Pages/ProjectsPage.css";

// API fonksiyonlarınızı import edin
import { fetchProjects, createProject, updateProject, deleteProject } from "../../../api/apiCalls/Express/projectsApi.js";
// import { fetchEmployees } from "../../../api/apiCalls/Express/employeeApi.js"; 
import GlobalSpinner from "../../GlobalSpinner.js"; 

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [employees, setEmployees] = useState([]); 
  
  // Form state - 'file' artık File objesi değil, dosya adı (string) tutacak
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear().toString(),
    responsibles: [],
    description: "",
    fileName: null // Yüklenen dosyanın adı (string), File objesi değil
  });

  const [formErrors, setFormErrors] = useState({});
  const [employeeSearch, setEmployeeSearch] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true); 
        
        const mockEmployees = [
          { _id: "1", name: "Ahmet Yılmaz" },
          { _id: "2", name: "Ayşe Demir" },
          { _id: "3", name: "Mehmet Kaya" },
          { _id: "4", name: "Fatma Şahin" },
          { _id: "5", name: "Ali Çelik" }
        ];
        setEmployees(mockEmployees);

        const fetchedProjects = await fetchProjects(); 
        setProjects(fetchedProjects);
        setFilteredProjects(fetchedProjects);

      } catch (error) {
        console.error("Veri yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false); 
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const filtered = projects.filter(project => {
      if (!project) {
        return false; 
      }
      return (
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.responsibles && project.responsibles.some(r => r.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    });
    setFilteredProjects(filtered);
  }, [searchQuery, projects]);

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        year: project.year,
        responsibles: project.responsibles,
        description: project.description,
        fileName: project.fileName || null // Mevcut dosya adını al
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: "",
        year: new Date().getFullYear().toString(),
        responsibles: [],
        description: "",
        fileName: null
      });
    }
    setFormErrors({}); 
    setEmployeeSearch(""); 
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({ 
      name: "",
      year: new Date().getFullYear().toString(),
      responsibles: [],
      description: "",
      fileName: null
    });
    setFormErrors({});
    setEmployeeSearch(""); 
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleResponsibleToggle = (employeeName) => {
    setFormData(prev => ({
      ...prev,
      responsibles: prev.responsibles.includes(employeeName)
        ? prev.responsibles.filter(r => r !== employeeName) 
        : [...prev.responsibles, employeeName] 
    }));
    if (formErrors.responsibles) {
      setFormErrors(prev => ({ ...prev, responsibles: "" }));
    }
  };

  // Dosya seçimi artık sadece dosya adını state'e kaydedecek
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (validTypes.includes(file.type)) {
        setFormData(prev => ({ ...prev, fileName: file.name })); // Sadece dosya adını kaydet
        setFormErrors(prev => ({ ...prev, fileName: "" }));
      } else {
        setFormErrors(prev => ({ ...prev, fileName: "Sadece PDF veya DOCX dosyası yükleyebilirsiniz" }));
      }
    } else {
        setFormData(prev => ({ ...prev, fileName: null })); // Dosya seçimi iptal edilirse
        setFormErrors(prev => ({ ...prev, fileName: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Proje adı gereklidir";
    if (!formData.year) errors.year = "Yıl seçimi gereklidir";
    if (formData.responsibles.length === 0) errors.responsibles = "En az bir sorumlu seçmelisiniz";
    if (!formData.description.trim()) errors.description = "Proje açıklaması gereklidir";
    if (formData.description.length > 1000) errors.description = `Açıklama ${1000 - formData.description.length} karakter daha az olmalı`;
    // Dosya adı (fileName) zorunlu mu? Evet, yeni projede.
    if (!editingProject && !formData.fileName) errors.fileName = "Yıllık plan dosyası adı gereklidir"; 
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return; 

    try {
      setLoading(true); 
      
      // FormData yerine JSON objesi oluşturuyoruz
      const projectData = {
        name: formData.name,
        year: formData.year,
        description: formData.description,
        responsibles: formData.responsibles, // Array olarak doğrudan gönder
        fileName: formData.fileName, // Sadece dosya adını gönder
        filePath: null // S3 entegrasyonuna kadar null veya undefined
      };

      let result;
      if (editingProject) {
        // Mevcut projeyi güncelleme işlemi
        result = await updateProject(editingProject._id, projectData); 
      } else {
        result = await createProject(projectData); 
      }
      
      if (result.success) {
        if (editingProject) {
          setProjects(prev => prev.map(p => p._id === editingProject._id ? result.project : p));
        } else {
          setProjects(prev => [...prev, result.project]);
        }
        handleCloseModal(); 
      } else if (result.reason === "duplicate_name") {
        setFormErrors(prev => ({ ...prev, name: result.message })); 
      } else {
        setFormErrors(prev => ({ ...prev, submit: result.message || "Proje kaydedilirken bir hata oluştu" }));
      }
    } catch (error) {
      console.error("Proje kaydedilirken bilinmeyen hata:", error);
      setFormErrors({ submit: "Proje kaydedilirken beklenmeyen bir hata oluştu." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId); 
      setProjects(prev => prev.filter(p => p._id !== projectId)); 
      setDeleteConfirm(null); 
    } catch (error) {
      console.error("Proje silinirken hata oluştu:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "active":
        return { label: "Aktif", className: "status-active", icon: CheckCircle };
      case "completed":
        return { label: "Tamamlandı", className: "status-completed", icon: CheckCircle };
      case "planning":
        return { label: "Planlamada", className: "status-planning", icon: AlertCircle };
      default:
        return { label: "Taslak", className: "status-draft", icon: FileText };
    }
  };

  const yearOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <div className="projects-page">
      {loading && <GlobalSpinner />} 
      {!loading && ( 
        <div className="projects-container">
          {/* Header */}
          <div className="projects-header">
            <div className="header-content">
              <div className="header-text">
                <h1>Projelerim</h1>
                <p>Projelerinizi yönetin ve etkinliklerinizi takip edin</p>
              </div>
              <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                <Plus className="icon" />
                Yeni Proje
              </button>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Projelerde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="empty-state">
              <FileText className="empty-icon" />
              <h3>{searchQuery ? "Proje bulunamadı" : "Henüz proje yok"}</h3>
              <p>
                {searchQuery 
                  ? "Arama kriterlerinizi değiştirerek tekrar deneyin" 
                  : "İlk projenizi oluşturarak başlayın"
                }
              </p>
              {!searchQuery && (
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                  <Plus className="icon" />
                  Proje Oluştur
                </button>
              )}
            </div>
          ) : (
            <div className="projects-grid">
              {filteredProjects.map((project) => {
                const statusInfo = getStatusInfo(project.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={project._id}
                    className="project-card"
                    onClick={(e) => {
                      if (!e.target.closest("button")) {
                        navigate(`/proje/${project._id}`);
                      }
                    }}
                  >
                    {/* Card Header */}
                    <div className="card-header">
                      <div className="card-title-section">
                        <h3>{project.name}</h3>
                        <span className={`status-badge ${statusInfo.className}`}>
                          <StatusIcon className="status-icon" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="card-year">{project.year}</div>
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                      <p className="card-description">{project.description}</p>
                      
                      {/* Responsibles */}
                      <div className="card-info">
                        <Users className="info-icon" />
                        <div className="responsibles">
                          {project.responsibles && project.responsibles.slice(0, 2).map((resp, idx) => ( 
                            <span key={idx} className="responsible-badge">{resp}</span>
                          ))}
                          {project.responsibles && project.responsibles.length > 2 && ( 
                            <span className="responsible-badge">+{project.responsibles.length - 2}</span>
                          )}
                        </div>
                      </div>

                      {/* File Info */}
                      {project.fileName && (
                        <div className="card-info">
                          <FileText className="info-icon" />
                          <span className="file-name">{project.fileName}</span>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="card-metadata">
                        <div className="metadata-item">
                          <Calendar className="metadata-icon" />
                          <span>Oluşturulma: {formatDate(project.createdAt)}</span>
                        </div>
                        <div className="metadata-item">
                          <Clock className="metadata-icon" />
                          <span>Güncelleme: {formatDate(project.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="card-footer">
                      <button
                        className="btn btn-edit"
                        onClick={() => handleOpenModal(project)}
                      >
                        <Edit2 className="icon" />
                        Düzenle
                      </button>
                      {deleteConfirm === project._id ? (
                        <button
                          className="btn btn-delete-confirm"
                          onClick={() => handleDeleteProject(project._id)}
                        >
                          Emin misiniz?
                        </button>
                      ) : (
                        <button
                          className="btn btn-delete"
                          onClick={() => setDeleteConfirm(project._id)}
                        >
                          <Trash2 className="icon" />
                          Sil
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProject ? "Projeyi Düzenle" : "Yeni Proje Oluştur"}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <X className="icon" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Proje Adı */}
              <div className="form-group">
                <label htmlFor="name">
                  Proje Adı <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? "error" : ""}
                  placeholder="Proje adını girin"
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>

              {/* Yıl Seçimi */}
              <div className="form-group">
                <label htmlFor="year">
                  Yıl <span className="required">*</span>
                </label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className={formErrors.year ? "error" : ""}
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {formErrors.year && <span className="error-message">{formErrors.year}</span>}
              </div>

              {/* Sorumlular */}
              <div className="form-group">
                <label>
                  Sorumlular <span className="required">*</span>
                  {formData.responsibles && formData.responsibles.length > 0 && ( 
                    <span className="selected-count">({formData.responsibles.length} seçildi)</span>
                  )}
                </label>
                
                {/* Arama inputu */}
                <div className="employee-search">
                  <input
                    type="text"
                    placeholder="Çalışan ara..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className="employee-search-input"
                  />
                  {employeeSearch && (
                    <button
                      type="button"
                      className="clear-search"  
                      onClick={() => setEmployeeSearch("")}
                    >
                      <X className="icon-small" />
                    </button>
                  )}
                </div>

                <div className="responsibles-list">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map(employee => (
                      <label key={employee._id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.responsibles.includes(employee.name)}
                          onChange={() => handleResponsibleToggle(employee.name)}
                        />
                        <span>{employee.name}</span>
                      </label>
                    ))
                  ) : (
                    <div className="no-results">
                      Aramanızla eşleşen çalışan bulunamadı
                    </div>
                  )}
                </div>
                {formErrors.responsibles && <span className="error-message">{formErrors.responsibles}</span>}
              </div>

              {/* Proje Metni */}
              <div className="form-group">
                <label htmlFor="description">
                  Proje Metni <span className="required">*</span>
                  <span className="char-count">({formData.description.length}/1000)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={formErrors.description ? "error" : ""}
                  placeholder="Projenin amacı, hedef kitle ve açıklama..."
                  rows="6"
                  maxLength="1000"
                />
                {formErrors.description && <span className="error-message">{formErrors.description}</span>}
              </div>

              {/* Dosya Yükleme - Artık sadece dosya adı için */}
              <div className="form-group">
                <label htmlFor="file">
                  Yıllık Plan Dosya Adı {!editingProject && <span className="required">*</span>}
                </label>
                <div className="file-upload">
                  <input
                    type="file" // Input tipi hala 'file' olmalı ki kullanıcı seçebilsin
                    id="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file" className="file-upload-label">
                    <Upload className="icon" />
                    <span>
                      {formData.fileName // fileName state'inden oku
                        ? formData.fileName 
                        : editingProject && editingProject.fileName
                        ? `Mevcut: ${editingProject.fileName}`
                        : "Dosya seçin"}
                    </span>
                  </label>
                </div>
                {formErrors.fileName && <span className="error-message">{formErrors.fileName}</span>}
              </div>

              {/* Submit Error */}
              {formErrors.submit && (
                <div className="form-error">{formErrors.submit}</div>
              )}
              
              {/* Modal Footer */}
              <div className="modal-footer">
                <button type="button" className="btn btn-cancel" onClick={handleCloseModal}>
                  İptal
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Save className="icon" />
                  {loading ? "Kaydediliyor..." : editingProject ? "Güncelle" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}