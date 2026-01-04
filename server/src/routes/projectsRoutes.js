const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authenticateUser'); // adjust path as needed
const { createProject, getAllProjectsByUserId, deleteProjectById, updateProjectById } = require('../models/projectModel.js');

router.get("/", authenticateUser, async (req, res) => {
  const userId = req.userId;
  const projects = await getAllProjectsByUserId(userId);
  res.json(projects);
});


// POST create a new project
router.post('/', authenticateUser, async (req, res) => {
  const { name, year, description, fileName, status, filePath } = req.body;
  const userId = req.userId;

  try {
    console.log(`creating: `, {name, year, userId, description, fileName, status, filePath});
    const createdRow = await createProject({name, year, userId, description, fileName, status, filePath});
    
    res.status(201).json(createdRow);
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).send('Error creating project');
  }
});


// PUT update an existing project by ID
router.put('/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { name, year, description, fileName, status, filePath } = req.body;
  try {
    const updatedProject = await updateProjectById(id, {name, year, description, fileName, status, filePath});
    if (!updatedProject) {
      return res.status(404).send('Project not found');
    }
    res.status(200).json(updatedProject);
  } catch (err) {
    res.status(500).send('Error updating project');
  }
});

// DELETE a project by ID
router.delete('/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProject = await deleteProjectById(id);
    if (!deletedProject) {
      return res.status(404).send('Project not found');
    }
    res.status(200).send(`Project with id ${id} deleted`);
  } catch (err) {
    res.status(500).send('Error deleting project');
  }
});

module.exports = router;
