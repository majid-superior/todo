import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TodoProvider } from "./contexts/TodoContext";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import TodoList from "./components/TodoList";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const { pathname } = location;

  // console.log("🔐 ProtectedRoute triggered");
  // console.log("📁 Current path:", pathname);
  // console.log("🔑 isAuthenticated:", isAuthenticated);
  // console.log("⏳ Loading state:", loading);

  // Don't check authentication for login and register routes
  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="">
        <div className="">
          <div className=""></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TodoProvider>
        <Router>
          <div className="">
            <Navbar />
            <main className="">
              <div className="">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <TodoList />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </main>
          </div>
        </Router>
      </TodoProvider>
    </AuthProvider>
  );
};

export default App;
