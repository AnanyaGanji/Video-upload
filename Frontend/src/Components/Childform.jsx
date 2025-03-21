import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";

export default function ChildRegister() {
  const [name, setName] = useState("");
  const [centreId, setCentreId] = useState("");
  const [age, setAge] = useState("");
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCentres = async () => {
      try {
        const res = await axios.get("https://testingapi.joywithlearning.com/api/data/allcentres", {
          headers: {
            Authorization: `${sessionStorage.getItem("logintoken")}`,
          },
        });
        setCentres(res.data);
      } catch (e) {
        toast.error("Failed to fetch centres!");
      }
    };

    fetchCentres();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "https://testingapi.joywithlearning.com/api/parent/childinfo",
        {
          name,
          centreId,
          age,
        },
        {
          headers: {
            Authorization: `${sessionStorage.getItem("logintoken")}`,
          },
        }
      );
      toast.success("Registered successfully!", { autoClose: 2000 });
      setLoading(false);

      setTimeout(() => {
        navigate("/parentdashboard");
      }, 2000);
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div
        className="card shadow"
        style={{ maxWidth: "500px", margin: "auto" }}
      >
        <div className="card-header text-center">
          <h4 className="fw-bold mt-2">Child Registration</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleRegister}>
            <div className="form-floating mb-3">
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                required
              />
              <label htmlFor="name">Name</label>
            </div>

            <div className="form-floating mb-3">
              <select
                id="centreId"
                value={centreId}
                onChange={(e) => setCentreId(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Select a centre</option>
                {centres.map((centre) => (
                  <option key={centre._id} value={centre.centreId}>
                    {centre.name}
                  </option>
                ))}
              </select>
              <label htmlFor="centreId">Centre</label>
            </div>

            <div className="form-floating mb-3">
              <input
                id="age"
                type="number"
                placeholder="Enter child age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="form-control"
                required
              />
              <label htmlFor="age">Age</label>
            </div>

            {loading ? (
              <div className="d-flex justify-content-center align-items-center">
                <Loader />
              </div>
            ) : (
              <button
                type="submit"
                className="btn btn-primary w-100 fw-bold"
              >
                Register Child
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
