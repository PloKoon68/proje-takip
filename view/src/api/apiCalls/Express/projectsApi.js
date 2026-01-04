import { expressAPI } from "../../axious"; // Import the axios instance


const fetchProjects = async () => {
  try{
    return (await expressAPI.get('/projects/', { withCredentials: true })).data
  } catch(err) {
    console.log("fetch error is:", err)
  }
}

const createProject = async (newProjectData) => {
  try{
    console.log(`creating project: `, newProjectData);
    let createdProject = (await expressAPI.post('/projects/', newProjectData, { withCredentials: true })).data;
    console.log(`created project: `, createdProject);
    return createdProject;
  } catch(err) {
    return err
  }
};

const updateProject = async (projectId, updatedData) => {
  return (await expressAPI.put(`/projects/${projectId}`, updatedData, { withCredentials: true })).data;
};

const deleteProject = async (projectId) => {
  return (await expressAPI.delete(`/projects/${projectId}`, { withCredentials: true })).data;
};


export {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject
};