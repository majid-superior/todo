import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LoginCredentials } from "../types";

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });
  const { login, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const result = await login(credentials);
    if (result.success) {
      navigate("/");
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="flex flex-col justify-center px-4 gap-4 rounded-xl bg-white shadow-lg lg:w-1/3">
        <h2 className="text-4xl font-bold text-center lg:text-center">
          Welcome
        </h2>
        {error && <div className="text-red-500 capitalize py-2">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="text-2xl capitalize">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              className="td_input"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-2xl capitalize">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="td_input"
            />
          </div>

          <button type="submit" className="td-button-blue">
            Sign In
          </button>
        </form>
        <p>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-blue-500 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
