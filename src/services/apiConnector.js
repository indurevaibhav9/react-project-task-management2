import axios from "axios";

export const axiosInstance = axios.create({});

export const apiConnector = (method, url, bodyData, headers, params, responseType) => {
  // Check if bodyData is FormData
  const isFormData = bodyData instanceof FormData;
  
  // If it's FormData, don't set Content-Type (let browser set it with boundary)
  const finalHeaders = isFormData 
    ? { ...headers }
    : { 'Content-Type': 'application/json', ...headers };

  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: finalHeaders,
    params: params ? params : null,
    responseType: responseType ? responseType : undefined,
  });
};