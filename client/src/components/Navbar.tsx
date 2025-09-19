import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = (): void => {
    logout();
  };

  return (
    <div className="flex w-full py-2 shadow-md">
      <div className="w-1/2 flex justify-start items-center pl-4 gap-2">
        <Link to="/" className="capitalize text-2xl font-bold text-blue-500">
          Todo App
        </Link>
      </div>
      <div className="w-1/2 flex justify-end items-center pr-4 gap-2">
        {isAuthenticated ? (
          <>
            <span className="capitalize hidden">
              Welcome, {user?.username} |
            </span>
            <button onClick={handleLogout} className="cursor-pointer">
              Logout
            </button>
          </>
        ) : (
          <>
            {/* <Link to="/register" className="capitalize">
              Register
            </Link> */}
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
