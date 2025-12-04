import { fileAPI } from "../apis";
import { apiConnector } from "../apiConnector";

export function getFile({ fileId, token } = {}) {
  return async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      // request as blob
      const response = await apiConnector("GET", fileAPI.GET_FILE(fileId), null, headers, null, 'blob');
      return response;
    } catch (error) {
      console.error("Error fetching file:", error);
      throw error;
    }
  };
}
