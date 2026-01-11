// server/src/routes/projectsRoutes.js
const express = require('express');
const router = express.Router();

const { createProject, updateProjectById, deleteProjectById, getAllProjectsByUserId, getProjectById } = require('../models/projectModel');
const authenticateUser = require('../middleware/authenticateUser'); 


let createprojectHandler = async (req, res) => {
  try {
    console.log("req.body is: ", req.body); 

    const { name, year, description, responsibles, fileName, filePath } = req.body; 
    const userId = req.userId; 
    console.log("id is: ", userId); 


    const projectData = {
      name,
      year,
      description,
      userId,  
      responsibles: responsibles,
      fileName: fileName, 
      filePath: filePath, 
    };

    const newProject = await createProject(projectData);
    res.status(201).json(newProject);
  } catch (err) {
    console.error('Proje oluşturma hatası:', err);
    if (err.code === 11000 && err.keyPattern && err.keyPattern.name) {
      return res.status(409).json({ message: "Bu isimde bir proje zaten mevcut.", field: "name" });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: "Sunucu hatası, proje oluşturulamadı." });
  }
}

let updateProjectHandler = async (req, res) => {
  const { projectId } = req.params;
  const updateData = req.body; 
  console.log("istek ulaştı: ", projectId, updateData)
  try {
    console.log("buraya girdi")
    const updatedCase = await updateProjectById(projectId, updateData);
    console.log("sıkıntısız çıktı")
    if (!updatedCase) {
      return res.status(404).send('Case not found');
    }
    res.status(200).json(updatedCase);
  } catch (err) {
    res.status(500).send(`Error updating case: ${err}`);
  }
}

let deleteProjectHandler = async (req, res) => {
  const { projectId } = req.params;
  try {
    const deletedModel = await deleteProjectById(projectId);
    if (!deletedModel) {
      return res.status(404).send('Model not found');
    }
    res.status(200).send(`Model with id ${projectId} deleted`);
  } catch (err) {
    res.status(500).send('Error deleting case');
  }
}


// Kullanıcının tüm projelerini getir
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId; 
    const projects = await getAllProjectsByUserId(userId);
    res.json(projects);
  } catch (err) {
    console.error('Tüm projeleri getirme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası, projeler getirilemedi.' });
  }
});

// Yeni proje oluşturma
router.post('/', authenticateUser, createprojectHandler);

// Proje güncelleme
router.put('/:projectId', authenticateUser, updateProjectHandler);

// Proje silme
router.delete('/:projectId', authenticateUser, deleteProjectHandler);





/*
// ID'ye göre proje getir
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getProjectById(id);
    if (!project || project.owner._id.toString() !== req.userId) { 
      return res.status(404).json({ message: 'Proje bulunamadı veya yetkiniz yok.' });
    }
    res.json(project);
  } catch (err) {
    console.error('Proje getirme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası, proje getirilemedi.' });
  }
});



// Projeyi güncelle
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, year, description, responsibles, status, fileName, filePath } = req.body; 
    const ownerId = req.userId; 

    // ÖNEMLİ DÜZELTME: responsibles zaten array olarak geldiği için JSON.parse'a GEREK YOK!
    let parsedResponsibles = responsibles || []; 
    // Aynı mantık, eğer front-end hala stringify yapıyorsa eski hali kalmalıydı.
    // Ama artık JSON gönderdiğimiz için bu sade hali yeterli.

    const updateData = {
      name,
      year,
      description,
      responsibles: parsedResponsibles,
      status,
      fileName: fileName, 
      filePath: filePath, 
    };

    const existingProject = await getProjectById(id);
    if (!existingProject || existingProject.owner._id.toString() !== ownerId) { 
      return res.status(403).json({ message: "Bu projeyi güncellemeye yetkiniz yok." });
    }

    const updatedProject = await updateProjectById(id, updateData);
    if (!updatedProject) {
      return res.status(404).json({ message: "Güncellenecek proje bulunamadı." });
    }
    res.json(updatedProject);
  } catch (err) {
    console.error('Proje güncelleme hatası:', err);
    if (err.code === 11000 && err.keyPattern && err.keyPattern.name) {
      return res.status(409).json({ message: "Bu isimde bir proje zaten mevcut.", field: "name" });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: "Sunucu hatası, proje güncellenemedi." });
  }
});

// Projeyi sil
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; 
    const existingProject = await getProjectById(id);

    if (!existingProject || existingProject.userId._id.toString() !== userId) { 
      return res.status(403).json({ message: "Bu projeyi silmeye yetkiniz yok." });
    }

    await deleteProjectById(id);
    res.status(204).send(); 
  } catch (err) {
    console.error('Proje silme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası, proje silinemedi.' });
  }
});
*/

module.exports = router;