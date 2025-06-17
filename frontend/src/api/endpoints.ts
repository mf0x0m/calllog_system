const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const ENDPOINTS = {
  auth: {
    login: `${BASE_URL}/api/auth/login`,
  },
  trainingSearch: {
    csv: `${BASE_URL}/api/training-search/csv`,
    detail: (web_id: string) => `${BASE_URL}/api/training-detail/${web_id}`,
  },
  traineeSearch: {
    detail: (applicationId: string) => `${BASE_URL}/api/trainee/detail/${applicationId}`,
  },
  callLog: {
    save: `${BASE_URL}/api/call-log/save`,
    list: `${BASE_URL}/api/call-log/list`,
  },
};

// import { ENDPOINTS } from "@/api/endpoints"