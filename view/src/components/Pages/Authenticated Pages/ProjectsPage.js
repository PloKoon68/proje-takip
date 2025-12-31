import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save, X, Search, Clock, Calendar, Users, FileText, Upload, CheckCircle, AlertCircle } from "lucide-react";
import "../../../style/Pages/ProjectsPage.css";

// API fonksiyonlarınızı import edin
// import { fetchProjects, createProject, updateProject, deleteProject, fetchEmployees } from "../../../api/apiCalls/Express/projectApi.js";
// import GlobalSpinner from "../../GlobalSpinner.js";

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear().toString(),
    responsibles: [],
    description: "",
    file: null
  });

  const [formErrors, setFormErrors] = useState({});
  const [employeeSearch, setEmployeeSearch] = useState("");

  // Mock data - gerçek uygulamada API'den gelecek
  useEffect(() => {
    // Mock employees
    const mockEmployees = [
      { _id: "1", name: "Ahmet Yılmaz" },
      { _id: "2", name: "Ayşe Demir" },
      { _id: "3", name: "Mehmet Kaya" },
      { _id: "4", name: "Fatma Şahin" },
      { _id: "5", name: "Ali Çelik" }
    ];
    setEmployees(mockEmployees);

    // Mock projects
    const mockProjects = [
      {
        _id: "1",
        name: "Dijital Dönüşüm Projesi",
        year: "2025",
        responsibles: ["Ahmet Yılmaz", "Ayşe Demir"],
        description: "Şirket genelinde dijital dönüşüm süreçlerinin yönetilmesi ve uygulanması.",
        fileName: "dijital_donusum_plan.pdf",
        status: "active",
        createdAt: "2024-01-15",
        updatedAt: "2024-12-20"
      },
      {
        _id: "2",
        name: "Müşteri Deneyimi İyileştirme",
        year: "2025",
        responsibles: ["Mehmet Kaya"],
        description: "Müşteri memnuniyetini artırmak için kapsamlı deneyim iyileştirme çalışmaları.",
        fileName: "musteri_deneyimi.docx",
        status: "planning",
        createdAt: "2024-02-10",
        updatedAt: "2024-12-25"
      }
    ];
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
    setLoading(false);
  }, []);

  // Search filtering
  useEffect(() => {
    const filtered = projects.filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.responsibles.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredProjects(filtered);
  }, [searchQuery, projects]);

  // Form handlers
  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        year: project.year,
        responsibles: project.responsibles,
        description: project.description,
        file: null
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: "",
        year: new Date().getFullYear().toString(),
        responsibles: [],
        description: "",
        file: null
      });
    }
    setFormErrors({});
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
      file: null
    });
    setFormErrors({});
    setEmployeeSearch("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (validTypes.includes(file.type)) {
        setFormData(prev => ({ ...prev, file }));
        setFormErrors(prev => ({ ...prev, file: "" }));
      } else {
        setFormErrors(prev => ({ ...prev, file: "Sadece PDF veya DOCX dosyası yükleyebilirsiniz" }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Proje adı gereklidir";
    if (!formData.year) errors.year = "Yıl seçimi gereklidir";
    if (formData.responsibles.length === 0) errors.responsibles = "En az bir sorumlu seçmelisiniz";
    if (!formData.description.trim()) errors.description = "Proje açıklaması gereklidir";
    if (formData.description.length > 1000) errors.description = "Açıklama 1000 karakteri geçemez";
    if (!editingProject && !formData.file) errors.file = "Yıllık plan dosyası gereklidir";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      if (editingProject) {
        // Güncelleme işlemi
        const updatedProject = {
          ...editingProject,
          ...formData,
          fileName: formData.file ? formData.file.name : editingProject.fileName,
          updatedAt: new Date().toISOString()
        };
        
        setProjects(prev => prev.map(p => p._id === editingProject._id ? updatedProject : p));
        // await updateProject(editingProject._id, formData);
      } else {
        // Yeni proje oluşturma
        const newProject = {
          _id: Date.now().toString(),
          ...formData,
          fileName: formData.file.name,
          status: "planning",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setProjects(prev => [...prev, newProject]);
        // await createProject(formData);
      }
      
      handleCloseModal();
    } catch (error) {
      console.error("Error saving project:", error);
      setFormErrors({ submit: "Proje kaydedilirken bir hata oluştu" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      setProjects(prev => prev.filter(p => p._id !== projectId));
      setDeleteConfirm(null);
      // await deleteProject(projectId);
    } catch (error) {
      console.error("Error deleting project:", error);
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

  // Filter employees based on search
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <div className="projects-page">
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
                      navigate(`/project/${project._id}`);
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
                        {project.responsibles.slice(0, 2).map((resp, idx) => (
                          <span key={idx} className="responsible-badge">{resp}</span>
                        ))}
                        {project.responsibles.length > 2 && (
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
                  {formData.responsibles.length > 0 && (
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

              {/* Dosya Yükleme */}
              <div className="form-group">
                <label htmlFor="file">
                  Yıllık Plan (PDF/DOCX) {!editingProject && <span className="required">*</span>}
                </label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file" className="file-upload-label">
                    <Upload className="icon" />
                    <span>
                      {formData.file 
                        ? formData.file.name 
                        : editingProject && editingProject.fileName
                        ? `Mevcut: ${editingProject.fileName}`
                        : "Dosya seçin"}
                    </span>
                  </label>
                </div>
                {formErrors.file && <span className="error-message">{formErrors.file}</span>}
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