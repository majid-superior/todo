import React, { createContext, useContext, useState, ReactNode } from "react";
import { todosAPI } from "../services/api";
import {
  Todo,
  Pagination,
  TodoFilters,
  CreateTodoData,
  UpdateTodoData,
} from "../types";

interface TodoContextType {
  todos: Todo[];
  loading: boolean;
  error: string;
  pagination: Pagination;
  getTodos: (params?: TodoFilters) => Promise<void>;
  createTodo: (
    todoData: CreateTodoData
  ) => Promise<{ success: boolean; error?: string }>;
  updateTodo: (
    id: string,
    updates: UpdateTodoData
  ) => Promise<{ success: boolean; error?: string }>;
  deleteTodo: (id: string) => Promise<{ success: boolean; error?: string }>;
  setError: (error: string) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const useTodos = (): TodoContextType => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error("useTodos must be used within a TodoProvider");
  }
  return context;
};

interface TodoProviderProps {
  children: ReactNode;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    pages: 1,
    total: 0,
  });

  const getTodos = async (params: TodoFilters = {}): Promise<void> => {
    try {
      setLoading(true);
      setError("");
      const response = await todosAPI.getTodos(params);

      if (response.data.success) {
        setTodos(response.data.data.todos);
        setPagination(response.data.data.pagination);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch todos";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (
    todoData: CreateTodoData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError("");
      const response = await todosAPI.createTodo(todoData);

      if (response.data.success) {
        setTodos((prev) => [response.data.data.todo, ...prev]);
        return { success: true };
      }
      return { success: false, error: "Failed to create todo" };
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create todo";
      setError(message);
      return { success: false, error: message };
    }
  };

  const updateTodo = async (
    id: string,
    updates: UpdateTodoData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError("");
      const response = await todosAPI.updateTodo(id, updates);

      if (response.data.success) {
        setTodos((prev) =>
          prev.map((todo) => (todo._id === id ? response.data.data.todo : todo))
        );
        return { success: true };
      }
      return { success: false, error: "Failed to update todo" };
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update todo";
      setError(message);
      return { success: false, error: message };
    }
  };

  const deleteTodo = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError("");
      const response = await todosAPI.deleteTodo(id);

      if (response.data.success) {
        setTodos((prev) => prev.filter((todo) => todo._id !== id));
        return { success: true };
      }
      return { success: false, error: "Failed to delete todo" };
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete todo";
      setError(message);
      return { success: false, error: message };
    }
  };

  const value: TodoContextType = {
    todos,
    loading,
    error,
    pagination,
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    setError,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
