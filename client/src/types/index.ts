export interface User {
  id: string;
  username: string;
}

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface TodosResponse {
  success: boolean;
  data: {
    todos: Todo[];
    pagination: Pagination;
  };
}

export interface TodoResponse {
  success: boolean;
  message: string;
  data: {
    todo: Todo;
  };
}

export interface Pagination {
  current: number;
  pages: number;
  total: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  confirmPassword?: string;
}

export interface TodoFilters {
  completed?: string;
  priority?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

export interface UpdateTodoData extends Partial<CreateTodoData> {
  completed?: boolean;
}
