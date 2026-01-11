import { expressAPI } from "../../axious"; // Import the axios instance


const fetchProjects = async () => {
  try{
    return (await expressAPI.get('/projects', { withCredentials: true })).data
  } catch(err) {
    console.log("fetch error is:", err)
  }
}

// Proje oluşturma - newProjectData artık JSON objesi
const createProject = async (newProjectData) => {
  try {
    console.log(`creating project: `, newProjectData);
    const response = await expressAPI.post('/projects/', newProjectData, { 
      withCredentials: true,
      // headers: { // FormData olmadığı için bu headera gerek yok, Axios otomatik JSON ayarlar
      //   'Content-Type': 'application/json' 
      // }
    });
    console.log(`created project: `, response.data);
    return { success: true, project: response.data };
  } catch (err) {
    console.error(`createProject error: `, err);
    if (err.response && err.response.status === 409 && err.response.data.field === "name") {
      return { success: false, reason: "duplicate_name", message: err.response.data.message };
    } else if (err.response && err.response.data && err.response.data.message) {
      return { success: false, reason: "server_error", message: err.response.data.message };
    } else {
      return { success: false, reason: "server_error", message: "Proje oluşturulurken bir hata oluştu." };
    }
  }
};



// Proje güncelleme - updateData da artık JSON objesi olacak
const updateProjects = async (id, updateData) => {
  try {
    console.log(`updating project ${id}: `, updateData);
    const response = await expressAPI.put(`/projects/${id}`, updateData, { 
      withCredentials: true,
      // headers: { 
      //   'Content-Type': 'application/json' 
      // }
    });
    console.log(`updated project: `, response.data);
    return { success: true, project: response.data };
  } catch (err) {
    console.error(`updateProject error: `, err);
    if (err.response && err.response.status === 409 && err.response.data.field === "name") {
      return { success: false, reason: "duplicate_name", message: err.response.data.message };
    } else if (err.response && err.response.data && err.response.data.message) {
      return { success: false, reason: "server_error", message: err.response.data.message };
    } else {
      return { success: false, reason: "server_error", message: "Proje güncellenirken bir hata oluştu." };
    }
  }
};
const updateProject = async (projectId, updatedData) => {
  //console.log("mid:", modelId, "updaedDate:", updatedData)
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