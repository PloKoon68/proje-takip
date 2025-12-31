// server/src/models/employeeModel.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    unique: true, 
    sparse: true, // Eğer her çalışanın e-postası olmayacaksa
    trim: true,
    lowercase: true // E-postaları küçük harfe çevirebiliriz
  },
  department: { 
    type: String, 
    trim: true
  },
  // Bu çalışanın hangi userId'ye ait olduğunu gösterir
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users', 
    required: true 
  }
}, { 
  timestamps: true 
});

  // Çalışanları çekerken userId bilgilerini otomatik doldurmak için
employeeSchema.pre('find', function() {
  this.populate('userId', 'username email');
});

employeeSchema.pre('findOne', function() {
  this.populate('userId', 'username email');
});


const Employee = mongoose.model('employees', employeeSchema);

// CRUD fonksiyonları
const createEmployee = async (employeeData) => {
    return await Employee.create(employeeData);
};

const getAllEmployeesByUserId = async (userId) => {
    return await Employee.find({ userId: userId }).sort({ name: 1 }); // İsme göre sıralayabiliriz
};

const getEmployeeById = async (employeeId) => {
    return await Employee.findById(employeeId);
};

const updateEmployeeById = async (employeeId, updateData) => {
    return await Employee.findByIdAndUpdate(employeeId, updateData, { new: true, runValidators: true });
};

const deleteEmployeeById = async (employeeId) => {
    return await Employee.findByIdAndDelete(employeeId);
};

module.exports = {
    Employee,
    createEmployee,
    getAllEmployeesByUserId,
    getEmployeeById,
    updateEmployeeById,
    deleteEmployeeById
};