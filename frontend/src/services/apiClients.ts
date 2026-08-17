import axios, { type AxiosInstance } from "axios";

function createApiClient(baseURL: string | undefined, name: string): AxiosInstance {
  if (!baseURL) {
    throw new Error(`Missing base URL for ${name}. Check your .env file.`);
  }

  const client = axios.create({ baseURL });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
}

export const identityApi = createApiClient(import.meta.env.VITE_IDENTITY_API_URL, "IdentityService");
export const tripPlanningApi = createApiClient(import.meta.env.VITE_TRIPPLANNING_API_URL, "TripPlanningService");
export const sharingApi = createApiClient(import.meta.env.VITE_SHARING_API_URL, "SharingService");
