import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save, X, Search, Clock, Calendar, Users, FileText, Upload, CheckCircle, AlertCircle } from "lucide-react";
import "../../../style/Pages/ProjectsPage.css";

// API fonksiyonlarınızı import edin (gerçek API hazır olduğunda bu satırları etkinleştirin)
import { fetchProjects, createProject, updateProject, deleteProject } from "../../../api/apiCalls/Express/projectsApi.js";
// import { fetchEmployees } from "../../../api/apiCalls/Express/employeeApi.js"; // Employee API'nız olduğunda bunu da import edin
import GlobalSpinner from "../../GlobalSpinner.js"; // GlobalSpinner'ı import et

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true); // Başlangıçta loading true olacak
  const [employees, setEmployees] = useState([]); // Çalışan listesi
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear().toString(),
    responsibles: [],
    description: "",
    file: null // Dosya yükleme için
  });

  const [formErrors, setFormErrors] = useState({});
  const [employeeSearch, setEmployeeSearch] = useState(""); // Çalışan arama inputu için state

  // Veri yükleme (projeler ve çalışanlar)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true); // Yüklemeye başlarken spinner'ı göster
        
        // Mock employees verisi (Gerçek Employee API'nız hazır olana kadar)
        const mockEmployees = [
          { _id: "1", name: "Ahmet Yılmaz" },
          { _id: "2", name: "Ayşe Demir" },
          { _id: "3", name: "Mehmet Kaya" },
          { _id: "4", name: "Fatma Şahin" },
          { _id: "5", name: "Ali Çelik" }
        ];
        setEmployees(mockEmployees);
        // Eğer gerçek Employee API'nız varsa:
        // const fetchedEmployees = await fetchEmployees(); 
        // setEmployees(fetchedEmployees);

        // Gerçek API çağrısı: Projeleri backend'den çek
        const fetchedProjects = await fetchProjects(); 
        setProjects(fetchedProjects);
        setFilteredProjects(fetchedProjects); // Başlangıçta filtrelenmiş liste de tüm projeler olacak

      } catch (error) {
        console.error("Veri yüklenirken hata oluştu:", error);
        // Hata durumunda kullanıcıya bilgi gösterme veya başka bir aksiyon alma
      } finally {
        setLoading(false); // Yükleme bittiğinde spinner'ı gizle
      }
    };

    loadData();
  }, []); // Boş bağımlılık dizisi, component mount edildiğinde bir kere çalışmasını sağlar

  // Arama filtreleme
    useEffect(() => {
      const filtered = projects.filter(project => {
        // project'in undefined veya null olup olmadığını kontrol et
        if (!project) {
          return false; // Undefined veya null olan elemanları filtrele
        }
        return (
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (project.responsibles && project.responsibles.some(r => r.toLowerCase().includes(searchQuery.toLowerCase())))
        );
      });
      setFilteredProjects(filtered);
    }, [searchQuery, projects]);
    
  // Modal açma/kapama ve form durumunu yönetme
  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        year: project.year,
        responsibles: project.responsibles,
        description: project.description,
        file: null // Dosya düzenlemede yeniden seçilmesi gerekebilir
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
    setFormErrors({}); // Form açıldığında hata mesajlarını temizle
    setEmployeeSearch(""); // Çalışan arama inputunu temizle
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({ // Formu sıfırla
      name: "",
      year: new Date().getFullYear().toString(),
      responsibles: [],
      description: "",
      file: null
    });
    setFormErrors({});
    setEmployeeSearch(""); // Çalışan arama inputunu temizle
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Kullanıcı yazmaya başladığında ilgili hata mesajını temizle
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Sorumlu çalışan seçimi
  const handleResponsibleToggle = (employeeName) => {
    setFormData(prev => ({
      ...prev,
      responsibles: prev.responsibles.includes(employeeName)
        ? prev.responsibles.filter(r => r !== employeeName) // Zaten seçiliyse çıkar
        : [...prev.responsibles, employeeName] // Seçili değilse ekle
    }));
    if (formErrors.responsibles) {
      setFormErrors(prev => ({ ...prev, responsibles: "" }));
    }
  };

  // Dosya seçimi
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

  // Form doğrulama (validation)
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Proje adı gereklidir";
    if (!formData.year) errors.year = "Yıl seçimi gereklidir";
    if (formData.responsibles.length === 0) errors.responsibles = "En az bir sorumlu seçmelisiniz";
    if (!formData.description.trim()) errors.description = "Proje açıklaması gereklidir";
    if (formData.description.length > 1000) errors.description = `Açıklama ${1000 - formData.description.length} karakter daha az olmalı`;
    // Yeni proje oluşturuluyorsa ve dosya seçilmemişse dosya zorunlu
    if (!editingProject && !formData.file) errors.file = "Yıllık plan dosyası gereklidir";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Hata yoksa true döner
  };

  // Form gönderimi (yeni proje oluşturma/düzenleme)
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(`handleSubmit: `, formData);
    if (!validateForm()) return; // Form doğrulamadan geçmezse dur
    console.log(`handleSubmit: after validateForm`);

    try {
      setLoading(true); // Yüklemeye başlarken spinner'ı göster
      
      const projectData = new FormData(); // Dosya yüklemek için FormData kullanmalıyız
      projectData.append('name', formData.name);
      projectData.append('year', formData.year);
      projectData.append('description', formData.description);
      projectData.append('responsibles', JSON.stringify(formData.responsibles)); // Array'i string olarak gönder

      if (formData.file) {
        projectData.append('file', formData.file);
      }

      if (editingProject) {
        // Mevcut projeyi güncelleme işlemi
        // const response = await updateProject(editingProject._id, projectData); // Gerçek API çağrısı
        // setProjects(prev => prev.map(p => p._id === editingProject._id ? response.project : p));
        // Mock güncelleme:
        const updatedProject = {
          ...editingProject,
          ...formData,
          fileName: formData.file ? formData.file.name : editingProject.fileName,
          updatedAt: new Date().toISOString()
        };
        setProjects(prev => prev.map(p => p._id === editingProject._id ? updatedProject : p));
      } else {
        // Yeni proje oluşturma işlemi
         const response = await createProject(projectData); // Gerçek API çağrısı
         setProjects(prev => [...prev, response.project]);
        // Mock oluşturma:
        const newProject = {
          _id: Date.now().toString(),
          ...formData,
          fileName: formData.file ? formData.file.name : null, // Yeni projede dosya varsa adını ekle
          status: "planning",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProjects(prev => [...prev, newProject]);
      }
      
      handleCloseModal(); // Modal'ı kapat
    } catch (error) {
      console.error("Proje kaydedilirken hata oluştu:", error);
      setFormErrors({ submit: "Proje kaydedilirken bir hata oluştu" });
    } finally {
      setLoading(false); // Yükleme bittiğinde spinner'ı gizle
    }
  };

  // Proje silme işlemi
  const handleDeleteProject = async (projectId) => {
    try {
      // await deleteProject(projectId); // Gerçek API çağrısı
      setProjects(prev => prev.filter(p => p._id !== projectId)); // UI'dan kaldır
      setDeleteConfirm(null); // Onay durumunu sıfırla
    } catch (error) {
      console.error("Proje silinirken hata oluştu:", error);
      // Hata mesajı gösterilebilir
    }
  };

  // Tarih formatlama yardımcı fonksiyonu
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Durum bilgisi yardımcı fonksiyonu
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

  // Yıl seçenekleri
  const yearOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

  // Çalışan arama inputuna göre çalışanları filtrele
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  return (
    <div className="projects-page">
      {loading && <GlobalSpinner />} {/* Eğer loading true ise GlobalSpinner'ı göster */}
      {!loading && ( // Eğer loading false ise sayfa içeriğini göster
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
                      // Butonlara tıklanınca navigate etme, sadece kartın boş alanına tıklanınca et
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
