const base_url = "https://localhost:7228/api";
 
export const registerUserAPI = {
    REGISTER_USER: base_url+"/auth/register",  
    GET_OTP: base_url+"/auth/get-otp",
    VERIFY_EMAIL: base_url+"/auth/verify-email",
    LOG_IN: base_url+"/auth/login",
    FORGOT_PASSWORD: base_url+"/auth/forgot-password",
    RESET_PASSWORD: base_url+"/auth/reset-password",
    GET_ALL_USERS: base_url+"/auth/GetAllUsers"  
}

export const projectAPI = {
    CREATE_PROJECT: base_url+"/projects/create-project",
    GET_ALL_PROJECTS: base_url+"/projects/get-all-projects",
    CREATE_PROJECT: base_url+"/project",
    GET_PROJECT_BY_ID: (id) => `${base_url}/Project/${id}`,
    UPDATE_PROJECT: (id) => `${base_url}/Project/${id}`,
    DELETE_PROJECT: (id) => `${base_url}/Project/${id}`,
    ATTACH_FILE_TO_PROJECT: (projectId, fileId) => `${base_url}/project/${projectId}/attach-file/${fileId}`,
    DETACH_FILE_FROM_PROJECT: (projectId, fileId) => `${base_url}/project/${projectId}/detach-file/${fileId}`,
    ADD_USER_TO_PROJECT: (userId, projectId) => `${base_url}/project/addUserToProject?userId=${userId}&projectId=${projectId}`,
    REMOVE_USER_FROM_PROJECT: (userId, projectId) => `${base_url}/project/removeUserFromProject?userId=${userId}&projectId=${projectId}`,
    GET_ALL_USERS_IN_PROJECT: (projectId) => `${base_url}/project/${projectId}/GetAllusers`,
    GET_ALL_PROJECTS_FOR_USER: (userId) => `${base_url}/project/project/${userId}/GetAllProjects`
} 

export const fileAPI = {
    GET_FILE: (id) => `${base_url}/file/${id}`
}

export const taskAPI = {
    CREATE_TASK: base_url+"/ProjectTask",
    GET_TASK_BY_ID: (id) => `${base_url}/ProjectTask/${id}`,
    UPDATE_TASK: (id) => `${base_url}/ProjectTask/${id}`,
    DELETE_TASK: (id) => `${base_url}/ProjectTask/${id}`,
    GET_ALL_TASKS_FOR_PROJECT: (projectId) => `${base_url}/ProjectTask/getAll`,
    UPDATE_TASK_STATUS: (id, status) => `${base_url}/ProjectTask/${id}/update-status?status=${status}`,
    ATTACH_USER_TO_TASK: (taskId, userId) => `${base_url}/ProjectTask/${taskId}/attach-user/${userId}`,
    DETACH_USER_FROM_TASK: (taskId) => `${base_url}/ProjectTask/${taskId}/detach-user`,
    ATTACH_FILE_TO_TASK: (taskId, fileId) => `${base_url}/ProjectTask/${taskId}/attach-file/${fileId}`,
    DETACH_FILE_FROM_TASK: (taskId) => `${base_url}/ProjectTask/${taskId}/detach-file`,
    GET_ALL_TASKS_ASSIGNED_TO_USER: (userId) => `${base_url}/ProjectTask/getAllTask/${userId}`,
    UPDATE_TASKS_STATUS: base_url+"/ProjectTask/update-tasks-status"
}
