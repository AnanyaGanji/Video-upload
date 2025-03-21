import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "./Loader.jsx";
import Calendar from "./Calendar.jsx";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";

export default function ParentHome() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childFeedback, setChildFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackLoader, setFeedbackLoader] = useState(false);
  const [events, setEvents] = useState({});
  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "https://testingapi.joywithlearning.com/api/parent/children",
          {
            headers: {
              Authorization: `${sessionStorage.getItem("logintoken")}`,
            },
          }
        );
        setChildren(response.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error("Error fetching children");
      }
    };

    fetchChildren();
  }, []);

  const handleClick = (child) => {
    setSelectedChild(child);
    setIsModalOpen(true);
    sessionStorage.setItem("childId", child._id);
    fetchChildFeedback(child._id);
  };

  const getCentreName = (centreId) =>{
    const centres = JSON.parse(sessionStorage.getItem("centres"));
    const centre = centres.find((centre) => centre.centreId === centreId);
    return centre.name;
}

  const fetchEvents = async () => {
    const events = {};
    try {
      const response = await axios.get(
        "https://testingapi.joywithlearning.com/api/parent/getConsultations",
        {
          headers: { Authorization: `${sessionStorage.getItem("logintoken")}` },
        }
      );
      response.data.forEach((event) => {
        const date = event.slots[0].date;
        if (!events[date]) {
          events[date] = [];
        }
        events[date].push({ title: `Consultation : ${event.slots[0].time}` });
      });
      setEvents(events);
    } catch (error) {
      toast.error("Error fetching events");
    }
  };

  const fetchChildFeedback = async (childId) => {
    try {
      setFeedbackLoader(true);
      const response = await axios.get(
        `https://testingapi.joywithlearning.com/api/data/feedback/${childId}`,
        {
          headers: { Authorization: `${sessionStorage.getItem("logintoken")}` },
        }
      );
      setFeedbackLoader(false);
      setChildFeedback(response.data);
    } catch (error) {
      setFeedbackLoader(false);
      toast.error("Error fetching feedback");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedChild(null);
    sessionStorage.removeItem("childId");
    setChildFeedback(null);
  };

  const gotoGames = (childId) => {
    sessionStorage.setItem("childId", childId);
    navigate("/games");
  };

  return (
    <div className="container my-4">
      <div className="text-center mb-4">
        <h1 className="mb-3">Parent Dashboard</h1>
      </div>

      <div className="d-flex justify-content-center gap-2 mb-4">
        <button
          className="btn fw-bold card shadow-lg btn-outline-info"
          onClick={() => navigate("/bookappointment")}
          style={{ backgroundColor: "rgb(100,150,200)" }}
        >
          Book Appointment
        </button>
        <button
          className="btn fw-bold card shadow-lg btn-outline-info"
          style={{ backgroundColor: "rgb(100, 150, 200)" }} 
          onClick={() => navigate("/viewappointmentparent")}
        >
          View Appointments
        </button>
        <button
          className="btn  fw-bold card shadow-lg btn-outline-info"
          onClick={() => navigate("/parentdashboard/childregister")}
          style={{ backgroundColor: "rgb(100,150,200)" }}
        >
          Add Child
        </button>
        <button
          className="btn fw-bold card shadow-lg btn-outline-info"
          style={{ backgroundColor: "rgb(100,150,200)" }}
          onClick={() => {
            handleShow();
            fetchEvents();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="currentColor"
            className="bi bi-calendar-event-fill"
            viewBox="0 0 16 16"
          >
            <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2m-3.5-7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5" />
          </svg>
        </button>
      </div>

      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Calendar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Calendar events={events} />
        </Modal.Body>
      </Modal>

      <div className="mt-4">
        <section className="row">
          {isLoading && <Loader />}
          {!isLoading && children.length === 0 && (
            <h3 className="text-center">Please register your child</h3>
          )}
          {!isLoading &&
            children.map((child, index) => (
              <div key={index} className="col-md-6 col-lg-4 mb-4">
                <div
                  className="card rounded-4 shadow h-100"
                  onClick={() => handleClick(child)}
                >
                  <div className="card-body">
                    <h3 className="card-title">{child.name}</h3>
                    <p className="card-text">
                      <strong>Age :</strong> {child.age}
                    </p>
                    <p className="card-text">
                      <strong>Parent Details :</strong> {child.parentDetails}
                    </p>
                    {child.caretakerName && child.doctorName ? (
                      <>
                      <p className="card-text">
                      <strong>Therapist:</strong> {child.caretakerName}
                    </p>
                    <p className="card-text">
                      <strong>Doctor:</strong> {child.doctorName}
                    </p>
                    </>
                    ):(
                        <>
                          <p><strong>Our admin will get in touch shortly</strong></p>
                        </>
                    )}
                    
                  </div>
                </div>
              </div>
            ))}
        </section>  
      </div>

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
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Age :</strong> {selectedChild.age}
                </p>
                <p>
                  <strong>Parent Details :</strong>{" "}
                  {selectedChild.parentDetails}
                </p>
                <p>
                  <strong>Therapist Name :</strong>{" "}
                  {selectedChild.caretakerName}
                </p>
                <p>
                  <strong>Doctor Name :</strong> {selectedChild.doctorName}
                </p>
                <p>
                  <strong>Center Id :</strong> {getCentreName(selectedChild.centreId)}
                </p>
                {feedbackLoader && <Loader />}
                {childFeedback && (
                  <div>
                    <h5 className="mt-4">
                      <strong>Feedback:</strong>
                    </h5>
                    <ul className="list-unstyled">
                      {childFeedback.feedback.map((fb, index) => (
                        <li key={index}>{fb}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => gotoGames(selectedChild._id)}
                >
                  Games
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate("/reports")}
                >
                  Reports
                </button>
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
