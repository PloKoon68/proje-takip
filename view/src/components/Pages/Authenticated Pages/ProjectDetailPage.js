import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  ArrowLeft, Plus, Edit2, Trash2, Eye, Save, X, Upload, 
  Calendar, User, FileText, Image, File, Download 
} from "lucide-react";
import "../../../style/Pages/ProjectDetailPage.css";

// API fonksiyonlarınızı import edin
// import { fetchProjectById, fetchActivities, createActivity, updateActivity, deleteActivity } from "../../../api/apiCalls/Express/projectApi.js";

export default function ProjectDetailPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  console.log("rendered project: ", projectId)

  const [project, setProject] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    organizer: "",
    description: "",
    files: []
  });

  const [formErrors, setFormErrors] = useState({});

  // Mock data - gerçek uygulamada API'den gelecek
  useEffect(() => {
    // Mock project
    const mockProject = {
      _id: projectId,
      name: "Dijital Dönüşüm Projesi",
      year: "2026",
      responsibles: ["Ahmet Yılmaz", "Ayşe Demir", "Mehmet Kaya"],
      description: "Şirket genelinde dijital dönüşüm süreçlerinin yönetilmesi ve uygulanması. Bu proje kapsamında tüm departmanların dijital altyapısı modernize edilecek, çalışanlara gerekli eğitimler verilecek ve yeni teknolojilere geçiş sağlanacaktır.",
      fileName: "dijital_donusum_plan.pdf",
      status: "active",
      createdAt: "2024-01-15",
      updatedAt: "2024-12-20"
    };
    setProject(mockProject);

    // Mock activities
    const mockActivities = [
      {
        _id: "1",
        name: "Proje Açılış Toplantısı",
        date: "2025-01-15",
        organizer: "Ahmet Yılmaz",
        description: "Proje ekibi ile ilk toplantı yapıldı. Hedefler belirlendi ve iş dağılımı yapıldı.",
        files: [
          { name: "toplanti_notlari.pdf", type: "application/pdf", size: "245 KB" },
          { name: "sunum.pptx", type: "application/vnd.ms-powerpoint", size: "1.2 MB" }
        ],
        createdAt: "2025-01-10"
      },
      {
        _id: "2",
        name: "Mevcut Durum Analizi",
        date: "2025-01-22",
        organizer: "Ayşe Demir",
        description: "Şirketin mevcut dijital altyapısı ve süreçleri detaylı olarak incelendi.",
        files: [
          { name: "analiz_raporu.pdf", type: "application/pdf", size: "890 KB" },
          { name: "grafik1.jpg", type: "image/jpeg", size: "156 KB" },
          { name: "grafik2.png", type: "image/png", size: "234 KB" }
        ],
        createdAt: "2025-01-18"
      },
      {
        _id: "3",
        name: "Tedarikçi Görüşmeleri",
        date: "2025-02-05",
        organizer: "Mehmet Kaya",
        description: "Potansiyel yazılım ve donanım tedarikçileriyle görüşmeler yapıldı.",
        files: [
          { name: "tedarikci_teklifleri.xlsx", type: "application/vnd.ms-excel", size: "67 KB" }
        ],
        createdAt: "2025-02-01"
      }
    ];
    setActivities(mockActivities);
    setLoading(false);
  }, [projectId]);

  // Form handlers
  const handleOpenActivityModal = (activity = null) => {
    if (activity) {
      setEditingActivity(activity);
      setFormData({
        name: activity.name,
        date: activity.date,
        organizer: activity.organizer,
        description: activity.description,
        files: []
      });
    } else {
      setEditingActivity(null);
      setFormData({
        name: "",
        date: "",
        organizer: "",
        description: "",
        files: []
      });
    }
    setFormErrors({});
    setShowActivityModal(true);
  };

  const handleCloseActivityModal = () => {
    setShowActivityModal(false);
    setEditingActivity(null);
    setFormData({
      name: "",
      date: "",
      organizer: "",
      description: "",
      files: []
    });
    setFormErrors({});
  };

  const handleOpenDetailModal = (activity) => {
    setSelectedActivity(activity);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedActivity(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      const newFiles = selectedFiles.map(file => ({
        file: file,
        name: file.name,
        type: file.type,
        size: formatFileSize(file.size)
      }));
      setFormData(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
    }
  };

  const handleRemoveFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Etkinlik adı gereklidir";
    if (!formData.date) errors.date = "Tarih seçimi gereklidir";
    if (!formData.organizer.trim()) errors.organizer = "Düzenleyen kişi gereklidir";
    if (!formData.description.trim()) errors.description = "Açıklama gereklidir";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      if (editingActivity) {
        // Güncelleme işlemi
        const updatedActivity = {
          ...editingActivity,
          ...formData,
          files: formData.files.length > 0 ? formData.files : editingActivity.files
        };
        
        setActivities(prev => prev.map(a => a._id === editingActivity._id ? updatedActivity : a));
        // await updateActivity(editingActivity._id, formData);
      } else {
        // Yeni etkinlik oluşturma
        const newActivity = {
          _id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString()
        };
        
        setActivities(prev => [...prev, newActivity]);
        // await createActivity(projectId, formData);
      }
      
      handleCloseActivityModal();
    } catch (error) {
      console.error("Error saving activity:", error);
      setFormErrors({ submit: "Etkinlik kaydedilirken bir hata oluştu" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      setActivities(prev => prev.filter(a => a._id !== activityId));
      setDeleteConfirm(null);
      // await deleteActivity(activityId);
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.includes('pdf')) return FileText;
    return File;
  };

  if (loading) {
    return (
      <div className="project-detail-page">
        <div className="loading-state">Yükleniyor...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail-page">
        <div className="error-state">Proje bulunamadı</div>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      <div className="project-detail-container">
        {/* Header */}
        <div className="detail-header">
          <button className="back-button" onClick={() => navigate('/projects')}>
            <ArrowLeft className="icon" />
            Projelere Dön
          </button>
        </div>

        {/* Project Info Section */}
        <div className="project-info-card">
          <div className="project-title-section">
            <h1>{project.name}</h1>
            <span className="project-year-badge">{project.year}</span>
          </div>

          <div className="project-info-grid">
            <div className="info-section">
              <h3>Sorumlular</h3>
              <div className="responsibles-tags">
                {project.responsibles.map((resp, idx) => (
                  <span key={idx} className="responsible-tag">
                    <User className="tag-icon" />
                    {resp}
                  </span>
                ))}
              </div>
            </div>

            <div className="info-section full-width">
              <h3>Proje Açıklaması</h3>
              <p className="project-description">{project.description}</p>
            </div>
          </div>
        </div>

        {/* Activities Section */}
        <div className="activities-section">
          <div className="activities-header">
            <h2>Etkinlikler</h2>
            <button className="btn btn-primary" onClick={() => handleOpenActivityModal()}>
              <Plus className="icon" />
              Yeni Etkinlik
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="empty-activities">
              <Calendar className="empty-icon" />
              <h3>Henüz etkinlik yok</h3>
              <p>Bu proje için ilk etkinliği oluşturun</p>
              <button className="btn btn-primary" onClick={() => handleOpenActivityModal()}>
                <Plus className="icon" />
                Etkinlik Oluştur
              </button>
            </div>
          ) : (
            <div className="activities-table-wrapper">
              <table className="activities-table">
                <thead>
                  <tr>
                    <th>Etkinlik Adı</th>
                    <th>Tarih</th>
                    <th>Düzenleyen</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr key={activity._id}>
                      <td className="activity-name">{activity.name}</td>
                      <td>{formatDate(activity.date)}</td>
                      <td>{activity.organizer}</td>
                      <td className="actions-cell">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleOpenDetailModal(activity)}
                          title="Detayları Görüntüle"
                        >
                          <Eye className="action-icon" />
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleOpenActivityModal(activity)}
                          title="Düzenle"
                        >
                          <Edit2 className="action-icon" />
                        </button>
                        {deleteConfirm === activity._id ? (
                          <button
                            className="action-btn delete-btn confirm"
                            onClick={() => handleDeleteActivity(activity._id)}
                            title="Silmeyi Onayla"
                          >
                            ✓
                          </button>
                        ) : (
                          <button
                            className="action-btn delete-btn"
                            onClick={() => setDeleteConfirm(activity._id)}
                            title="Sil"
                          >
                            <Trash2 className="action-icon" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Activity Form Modal */}
      {showActivityModal && (
        <div className="modal-overlay" onClick={handleCloseActivityModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingActivity ? "Etkinliği Düzenle" : "Yeni Etkinlik Oluştur"}</h2>
              <button className="modal-close" onClick={handleCloseActivityModal}>
                <X className="icon" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Etkinlik Adı */}
              <div className="form-group">
                <label htmlFor="name">
                  Etkinlik Adı <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? "error" : ""}
                  placeholder="Etkinlik adını girin"
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>

              {/* Tarih */}
              <div className="form-group">
                <label htmlFor="date">
                  Tarih <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={formErrors.date ? "error" : ""}
                />
                {formErrors.date && <span className="error-message">{formErrors.date}</span>}
              </div>

              {/* Düzenleyen */}
              <div className="form-group">
                <label htmlFor="organizer">
                  Düzenleyen <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="organizer"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleInputChange}
                  className={formErrors.organizer ? "error" : ""}
                  placeholder="Düzenleyen kişinin adı"
                />
                {formErrors.organizer && <span className="error-message">{formErrors.organizer}</span>}
              </div>

              {/* Açıklama */}
              <div className="form-group">
                <label htmlFor="description">
                  Açıklama <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={formErrors.description ? "error" : ""}
                  placeholder="Etkinlik detayları..."
                  rows="6"
                />
                {formErrors.description && <span className="error-message">{formErrors.description}</span>}
              </div>

              {/* Dosya Yükleme */}
              <div className="form-group">
                <label htmlFor="files">Dosyalar & Fotoğraflar</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="files"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="files" className="file-upload-label">
                    <Upload className="icon" />
                    <span>Dosya seçin (PDF, DOC, XLS, JPG, PNG)</span>
                  </label>
                </div>

                {/* Uploaded Files List */}
                {formData.files.length > 0 && (
                  <div className="uploaded-files">
                    {formData.files.map((file, index) => {
                      const FileIcon = getFileIcon(file.type);
                      return (
                        <div key={index} className="file-item">
                          <FileIcon className="file-icon" />
                          <div className="file-info">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{file.size}</span>
                          </div>
                          <button
                            type="button"
                            className="remove-file"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <X className="icon-small" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Error */}
              {formErrors.submit && (
                <div className="form-error">{formErrors.submit}</div>
              )}

              {/* Modal Footer */}
              <div className="modal-footer">
                <button type="button" className="btn btn-cancel" onClick={handleCloseActivityModal}>
                  İptal
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Save className="icon" />
                  {loading ? "Kaydediliyor..." : editingActivity ? "Güncelle" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Detail Modal */}
      {showDetailModal && selectedActivity && (
        <div className="modal-overlay" onClick={handleCloseDetailModal}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedActivity.name}</h2>
              <button className="modal-close" onClick={handleCloseDetailModal}>
                <X className="icon" />
              </button>
            </div>

            <div className="detail-modal-body">
              {/* Meta Info */}
              <div className="detail-meta">
                <div className="meta-item">
                  <Calendar className="meta-icon" />
                  <div>
                    <span className="meta-label">Tarih</span>
                    <span className="meta-value">{formatDate(selectedActivity.date)}</span>
                  </div>
                </div>
                <div className="meta-item">
                  <User className="meta-icon" />
                  <div>
                    <span className="meta-label">Düzenleyen</span>
                    <span className="meta-value">{selectedActivity.organizer}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="detail-section">
                <h3>Açıklama</h3>
                <p className="detail-description">{selectedActivity.description}</p>
              </div>

              {/* Files */}
              {selectedActivity.files && selectedActivity.files.length > 0 && (
                <div className="detail-section">
                  <h3>Dosyalar ({selectedActivity.files.length})</h3>
                  <div className="detail-files">
                    {selectedActivity.files.map((file, index) => {
                      const FileIcon = getFileIcon(file.type);
                      return (
                        <div key={index} className="detail-file-item">
                          <FileIcon className="file-icon" />
                          <div className="file-info">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{file.size}</span>
                          </div>
                          <button className="download-btn" title="İndir">
                            <Download className="icon-small" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}