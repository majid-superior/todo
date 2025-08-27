import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  AuthResponse,
  TodosResponse,
  TodoResponse,
  CreateTodoData,
  UpdateTodoData,
} from "../types";

const API_BASE_URL = import.meta.env.API_URL || "http://localhost:5000/api";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors globally
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData: {
    username: string;
    password: string;
  }): Promise<AxiosResponse<AuthResponse>> => api.post("/register", userData),
  login: (credentials: {
    username: string;
    password: string;
  }): Promise<AxiosResponse<AuthResponse>> => api.post("/login", credentials),
};

export const todosAPI = {
  getTodos: (params = {}): Promise<AxiosResponse<TodosResponse>> =>
    api.get("/todos", { params }),
  createTodo: (
    todoData: CreateTodoData
  ): Promise<AxiosResponse<TodoResponse>> => api.post("/todos", todoData),
  updateTodo: (
    id: string,
    updates: UpdateTodoData
  ): Promise<AxiosResponse<TodoResponse>> => api.put(`/todos/${id}`, updates),
  deleteTodo: (
    id: string
  ): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.delete(`/todos/${id}`),
};

export default api;
