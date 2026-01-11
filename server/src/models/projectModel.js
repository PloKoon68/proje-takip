// server/src/models/projectModel.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true, // Başındaki ve sonundaki boşlukları kaldırır
    unique: true // Proje adları tekil olabilir
  },
  year: { 
    type: String, // Yıl bilgisi string olarak tutulabilir ('2023', '2024' gibi)
    required: true 
  },
  // Projenin sahibi olan kullanıcıya referans
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users', // 'User' modeline referans veriyoruz
    required: true 
  },
  responsibles: [{ 
    type: String
//    ref: 'employees' // Artık employees modeline referans veriyor
  }],
  description: {
    type: String, 
    required: true,
    maxlength: 1000 
  },
  fileName: { // Yüklenen dosyanın adı
    type: String
  },
  status: { // Proje durumu (örneğin 'planning', 'active', 'completed')
    type: String,
    enum: ['planning', 'active', 'completed', 'archived'], // Olası durumlar
    default: 'planning'
  },
  filePath: { // Yüklenen dosyanın sunucudaki yolu veya bulut depolama URL'si
    type: String,
    // required: true // Dosya upload edildikten sonra backendde set edilecek
  }
}, { 
  timestamps: true // createdAt ve updatedAt alanlarını otomatik ekler
});

// Projeleri listeleyip sorgularken userId bilgilerini de çekmek için (populate)
projectSchema.pre('find', function() {
  this.populate('userId', 'username email'); // Sadece username ve email fieldlarını getir
});

projectSchema.pre('findOne', function() {
    this.populate('userId', 'username email');
});


const Project = mongoose.model('projects', projectSchema);

// CRUD fonksiyonları (şimdilik basit halleri)
const createProject = async (projectData) => {
  return await Project.create(projectData);
};

const getAllProjectsByUserId = async (userId) => {
  return await Project.find({ userId: userId }).sort({ createdAt: -1 });
};

const getProjectByUserId = async (projectId) => {
  return await Project.findById(projectId);
};

const updateProjectById = async (projectId, updateData) => {
  return await Project.findByIdAndUpdate(projectId, updateData, { new: true, runValidators: true });
};

const deleteProjectById = async (projectId) => {
  return await Project.findByIdAndDelete(projectId);
};

module.exports = {
  Project, // Şemayı diğer modellerde kullanmak için dışa aktarıyoruz
  createProject,
  getAllProjectsByUserId,
  getProjectByUserId,
  updateProjectById,
  deleteProjectById
};

