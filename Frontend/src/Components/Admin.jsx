import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./Loader";

export default function Admin() {
  const [children, setChildren] = useState([]);
  const [verified, setVerified] = useState([]);
  const [pending, setPending] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedCaretaker, setSelectedCaretaker] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [childFeedback, setChildFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReportClick = () => {
    navigate("/reports");
  };

  useEffect(() => {
    const fetchChildren = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:4001/api/data/allchildren",
          {
            headers: {
              Authorization: `${sessionStorage.getItem("logintoken")}`,
            },
          }
        );
        const allChildren = response.data;
        setChildren(allChildren);

        const verifiedChildren = allChildren.filter(
          (child) => child.adminStatus === true
        );
        const pendingChildren = allChildren.filter(
          (child) => child.adminStatus === false
        );

        setVerified(verifiedChildren);
        setPending(pendingChildren);
        setLoading(false);
      } catch (error) {
        toast.error("Error fetching children. Please try again.");
        setLoading(false);
      }
    };

    fetchChildren();
  }, []);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const response = await axios.get(
          "https://testingapi.joywithlearning.com/api/data/allcaretakers",
          {
            headers: {
              Authorization: `${sessionStorage.getItem("logintoken")}`,
            },
          }
        );
        setTherapists(response.data);
      } catch (error) {
        toast.error("Error fetching caretakers. Please try again.");
      }
    };

    fetchTherapists();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(
          "https://testingapi.joywithlearning.com/api/data/alldoctors",
          {
            headers: {
              Authorization: `${sessionStorage.getItem("logintoken")}`,
            },
          }
        );
        setDoctors(response.data);
      } catch (error) {
        toast.error("Error fetching doctors. Please try again.");
      }
    };

    fetchDoctors();
  }, []);

  const handleCardClick = async (child) => {
    setSelectedChild(child);
    setSelectedCaretaker("");
    setSelectedDoctor("");
    setIsModalOpen(true);
    sessionStorage.setItem("childId", child._id);

    try {
      const response = await axios.get(
        `https://testingapi.joywithlearning.com/api/data/feedback/${child._id}`,
        {
          headers: {
            Authorization: `${sessionStorage.getItem("logintoken")}`,
          },
        }
      );
      setChildFeedback(response.data);
    } catch (error) {
      toast.error("Error fetching feedback. Please try again.");
    }
  };

  const handleCaretakerChange = (event) => {
    setSelectedCaretaker(event.target.value);
  };

  const handleDoctorChange = (event) => {
    setSelectedDoctor(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      await axios.put(
        `https://testingapi.joywithlearning.com/api/admin/${selectedChild._id}/assign`,
        {
          caretakerId: selectedCaretaker,
          doctorId: selectedDoctor,
        },
        {
          headers: {
            Authorization: `${sessionStorage.getItem("logintoken")}`,
          },
        }
      );
      closeModal();
      const response = await axios.get(
        "https://testingapi.joywithlearning.com/api/data/allchildren",
        {
          headers: {
            Authorization: `${sessionStorage.getItem("logintoken")}`,
          },
        }
      );
      setChildren(response.data);
      toast.success("Child data updated successfully!");
    } catch (error) {
      toast.error("Error updating child data. Please try again.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedChild(null);
    sessionStorage.removeItem("childId");
  };

  return (
    <div className="container">
      <ToastContainer />

      <div className="mb-4">
        <h1 className="my-4 text-center">Admin Dashboard</h1>
      </div>
      <div className="d-flex flex-wrap justify-content-center mb-4">
        <button
          className="btn m-2 fw-bold card shadow-lg btn-outline-info"
          style={{ backgroundColor: "rgb(100, 150, 200)" }} //style={{ backgroundColor: "rgb(100, 190, 150)" }}
          onClick={() => navigate("/jwlenquiries")}
        >
          JWL Enquiries
        </button>
        <button
          className="btn m-2 fw-bold card shadow-lg btn-outline-info"
          style={{ backgroundColor: "rgb(100, 150, 200)" }} //style={{ backgroundColor: "rgb(100, 190, 150)" }}
          onClick={() => navigate("/register")}
        >
          Register Parent
        </button>
        <button
          className="btn m-2 fw-bold card shadow-lg btn-outline-info"
          style={{ backgroundColor: "rgb(100, 150, 200)" }} //style={{ backgroundColor: "rgb(100, 190, 150)" }}
          onClick={() => navigate("/admindashboard/adminregister")}
        >
          Register Doctor/Therapist
        </button>
        <button
          className="btn m-2 fw-bold card shadow-lg btn-outline-info"
          style={{ backgroundColor: "rgb(100, 150, 200)" }} //style={{ backgroundColor: "rgb(100, 190, 150)" }}
          onClick={() => navigate("/bookappointment")}
        >
          Book Appointment
        </button>
        <button
          className="btn m-2 fw-bold card shadow-lg btn-outline-info "
          style={{ backgroundColor: "rgb(100, 150, 200)" }} //style={{ backgroundColor: "rgb(100, 190, 150)" }}
          onClick={() => navigate("/viewappointment")}
        >
          View Appointments
        </button>
        <button
          className="btn m-2 fw-bold card shadow-lg btn-outline-info "
          style={{ backgroundColor: "rgb(100, 150, 200)" }} //style={{ backgroundColor: "rgb(100, 190, 150)" }}
          onClick={() => navigate("/approveappointment")}
        >
          Manage Appointments
        </button>
      </div>

      {loading ? (
        <div
          className="d-flex justify-content-center align-items-top"
          style={{ height: "80vh" }}
        >
          <Loader />
        </div>
      ) : (
        <div>
          <div className="my-5">
            {pending.length === 0 ? null : (
              <>
                <h2 className="mb-4 text-center">New Registrations</h2>
                <div className="row">
                  {pending.map((child) => (
                    <div
                      className="col-lg-3 col-md-4 col-sm-6 mb-4"
                      key={child._id}
                    >
                      <div
                        className="card h-100 shadow-sm"
                        onClick={() => handleCardClick(child)}
                      >
                        <div className="card-body">
                          <h5 className="card-title">{child.name}</h5>
                          <p className="card-text">Age: {child.age}</p>
                          {child.doctorName && child.caretakerName ? (
                            <>
                              <p className="card-text">
                                Doctor: {child.doctorName}
                              </p>
                              <p className="card-text">
                                Therapist: {child.caretakerName}
                              </p>
                            </>
                          ) :
                            (<>
                              <p><strong>Please assign Doctor and Therapist.</strong></p>
                            </>)}

                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="my-5">
            <h2 className="mb-4 text-center">Verified Users</h2>
            {verified.length === 0 ? (
              <p className="text-center">No users found</p>
            ) : (
              <div className="row">
                {verified.map((child) => (
                  <div
                    className="col-lg-3 col-md-4 col-sm-6 mb-4"
                    key={child._id}
                  >
                    <div
                      className="card h-100 shadow-sm"
                      onClick={() => handleCardClick(child)}
                    >
                      <div className="card-body">
                        <h5 className="card-title">{child.name}</h5>
                        <p className="card-text">Age: {child.age}</p>
                        <p className="card-text">Doctor: {child.doctorName}</p>
                        <p className="card-text">Therapist: {child.caretakerName}</p>
                        <span
                          className="position-absolute top-0 end-0 p-2"
                          title="More information about this child"
                          style={{ cursor: 'pointer' }}
                        >
                          <i className="bi bi-info-circle"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {selectedChild && (
        <div
          className={`modal fade ${isModalOpen ? "show" : ""}`}
          style={{ display: isModalOpen ? "block" : "none" }}
          tabIndex="-1"
          role="dialog"
          aria-labelledby="childModalLabel"
          aria-hidden={!isModalOpen}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="childModalLabel">
                  {selectedChild.name}
                </h5>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Age:</strong> {selectedChild.age}
                </p>
                <p>
                  <strong>Doctor:</strong>{" "}
                  {selectedChild.doctorName?.length === 0
                    ? "Yet to be assigned"
                    : selectedChild.doctorName}
                </p>
                <p>
                  <strong>Therapist:</strong>{" "}
                  {selectedChild.caretakerName?.length === 0
                    ? "Yet to be assigned"
                    : selectedChild.caretakerName}
                </p>

                {selectedChild.adminStatus === false && (
                  <>
                    <div className="form-group">
                      <label htmlFor="caretakerSelect">
                        <strong>Assign Therapist</strong>
                      </label>
                      <select
                        id="caretakerSelect"
                        className="form-control"
                        value={selectedCaretaker}
                        onChange={handleCaretakerChange}
                      >
                        <option value="">Select Therapist</option>
                        {therapists.map((caretaker) => (
                          <option key={caretaker._id} value={caretaker._id}>
                            {caretaker.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="doctorSelect">
                        <strong>Assign Doctor</strong>
                      </label>
                      <select
                        id="doctorSelect"
                        className="form-control"
                        value={selectedDoctor}
                        onChange={handleDoctorChange}
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor._id} value={doctor._id}>
                            {doctor.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleReportClick}
                >
                  Reports
                </button>
                {selectedChild.adminStatus === false && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleSubmit}
                  >
                    Save Changes
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && <div className="modal-backdrop show"></div>}
    </div>
  );
}
