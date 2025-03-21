import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Loader from "./Loader.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const Navigate = useNavigate();
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  
  const handleLogin = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:4001/api/users/login",
        { username, password }
      );
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("logintoken", response.data.token);
      localStorage.setItem("logintoken", response.data.token);
      const decodedToken = jwtDecode(response.data.token);
      sessionStorage.setItem("role", decodedToken.role);
      if(decodedToken.role === "admin") {
        sessionStorage.setItem("centreId", response.data.centreId);
      }
      sessionStorage.setItem("centres", JSON.stringify(response.data.centres));
      sessionStorage.setItem("id", decodedToken.id);  
      setLoading(false);
      Navigate(`/${decodedToken.role}dashboard`);
    } catch (err) {
      setLoading(false);
      toast.error("Incorrect Username or Password. Please try again!");
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div
        className="card shadow"
        style={{ maxWidth: "400px", margin: "auto" }}
      >
        <div className="card-header text-center">
          <h4 className="login-title fw-bold m-1">Login</h4>
        </div>
        <div className="card-body">
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-floating mb-3">
              <input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={handleUsernameChange}
                className="form-control"
                aria-label="Username"
                required
              />
              <label htmlFor="username">Username</label>
            </div>
            <div className="form-floating mb-3">
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className="form-control"
                aria-label="Password"
                required
              />
              <label htmlFor="password">Password</label>
            </div>
            <div className="d-flex justify-content-center mb-3">
              {!loading && (
                <button type="submit" className="btn btn-primary w-100">
                  Login
                </button>
              )}
            </div>
            <div className="d-flex justify-content-center mb-2">
              {loading && <Loader />}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
