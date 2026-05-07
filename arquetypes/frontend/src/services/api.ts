import axios, { AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(", ") : data.message;
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}
