// lib/api.ts
import { API_BASE } from "@/constants/config";
import { useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

export const useApiFetch = () => {
  const { token } = useAuth();

  const apiFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const baseUrl = `${API_BASE}`;
      const headers: any = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(baseUrl + path, { ...options, headers });
      // if token revoked/expired 401 => force logout? handle outside
      return res;
    },
    [token],
  );

  return { apiFetch };
};
