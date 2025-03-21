import  { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./Loader";

export default function AdminRegister() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobilenumber, setMobilenumber] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e) => setName(e.target.value);
  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleMobileNumberChange = (e) => setMobilenumber(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleRoleChange = (e) => setRole(e.target.value);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const endpoint =
      role === "caretaker" ? "careTakerRegister" : "doctorRegister";
    setLoading(true);
    try {
      const res = await axios.post(
        `https://testingapi.joywithlearning.com/api/admin/${endpoint}`,
        { name, username, email, mobilenumber, password },
        {
          headers: { Authorization: `${sessionStorage.getItem("logintoken")}` },
        }
      );
      toast.success("Registered successfully!", { autoClose: 2000 });

      setLoading(false);
      setTimeout(() => {
        navigate("/admindashboard");
      }, 3000);
    } catch (e) {
      toast.error("Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          <div className="card shadow-lg rounded-3">
            <div className="card-header text-center">
              <h2 className="mt-2">Register Doctor / Therapist</h2>
            </div>
            <div className="card-body">
              <form className="p-2 mb-3" onSubmit={handleRegister}>
                <div className="form-floating mb-3">
                  <input
                    id="name"
                    type="text"
                    placeholder="Name"
                    onChange={handleNameChange}
                    className="form-control"
                    required
                  />
                  <label htmlFor="name">Name</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    id="username"
                    type="text"
                    placeholder="Username"
                    onChange={handleUsernameChange}
                    className="form-control"
                    required
                  />
                  <label htmlFor="username">Username</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    onChange={handleEmailChange}
                    className="form-control"
                    required
                  />
                  <label htmlFor="email">Email</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    id="mobileno"
                    type="number"
                    placeholder="Mobile Number"
                    onChange={handleMobileNumberChange}
                    className="form-control"
                    required
                  />
                  <label htmlFor="mobileno">Mobile Number</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    onChange={handlePasswordChange}
                    className="form-control"
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <div className="form-floating mb-3">
                  <select
                    id="role"
                    value={role}
                    onChange={handleRoleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="caretaker">Therapist</option>
                    <option value="doctor">Doctor</option>
                  </select>
                  <label htmlFor="role">Role</label>
                </div>
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center">
                    <Loader />
                  </div>
                ) : (
                  <div className="d-grid">
                    <button type="submit" className="btn btn-primary">
                      Register
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}