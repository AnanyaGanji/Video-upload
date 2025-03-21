import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from './Loader.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import Calendar from './Calendar.jsx';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';


export default function Doctor() {
  const [children, setChildren] = useState({});
  const [selectedChild, setSelectedChild] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [childFeedback, setChildFeedback] = useState(null);
  const [childGames, setChildGames] = useState([]);
  const [games, setGames] = useState([]);
  const [responseText, setResponseText] = useState('');
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const [show, setShow] = useState(false);
  const [events, setEvents] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    const getChildren = async () => {
      try {
        const res = await axios.get('https://testingapi.joywithlearning.com/api/doctor/assigned', {
          headers: {
            Authorization: `${sessionStorage.getItem('logintoken')}`
          }
        });
        if (res.data.length === 0) {
          setResponseText('No Children Assigned');
          return;
        }
        setResponseText('');
        setChildren(res.data);
      } catch (error) {
        toast.error('Error fetching children');
      }
    };

    getChildren();

    const fetchAllGames = async () => {
      try {
        const response = await axios.get('https://testingapi.joywithlearning.com/api/data/allgames');
        setGames(response.data);
      } catch (error) {
        toast.error('Error fetching games');
      }
    };
    fetchAllGames();
  }, []);
  const fetchEvents = async () => {
    const events = {};
    try {
      const response = await axios.get('https://testingapi.joywithlearning.com/api/doctor/getConsultations', {
        headers: {
          Authorization: `${sessionStorage.getItem('logintoken')}`
        }
      });
      response.data.forEach((event) => {
        const date = event.slots[0].date


        if (!events[date]) {
          events[date] = [];
        }
        events[date].push({title : `Consultation : ${event.slots[0].time} ${event.childName}`});
      });
      setEvents(events);
    } catch (error) {
      toast.error('Error fetching events');
    }
  };
  const handleCardClick = async (child) => {
    setSelectedChild(child);
    setIsModalOpen(true);

    try {
      const response = await axios.get(`https://testingapi.joywithlearning.com/api/admin/gametable/${child._id}`, {
        headers: { Authorization: `${sessionStorage.getItem('logintoken')}` },
      });
      setChildGames(response.data);
    } catch (error) {
      toast.error('Error fetching child games');
      setChildGames([]);
    }
  };

  const getCentreName = (centreId) =>{
    const centres = JSON.parse(sessionStorage.getItem('centres'));
    const centre = centres.find((centre) => centre.centreId === centreId);
    return centre.name;
  }

  const handleSubmitFeedback = async () => {
    try {
      const response = await axios.put(`https://testingapi.joywithlearning.com/api/data/feedback/${selectedChild._id}`, {
        feedback: feedback
      }, {
        headers: {
          Authorization: `${sessionStorage.getItem('logintoken')}`
        }
      });
      setChildFeedback(response.data);
      setFeedback('');
    } catch (error) {
      toast.error('Error submitting feedback');
    }
  };
  const handleReports = async () => {
    sessionStorage.setItem('childId', selectedChild._id);
    navigate('/reports');
  }
  const handleIEP = async () => {
    sessionStorage.setItem('childId', selectedChild._id);
    sessionStorage.setItem('therapistName', selectedChild.caretakerName);
    navigate('/doctordashboard/iep');
  }
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedChild(null);
    setChildFeedback(null);
    setChildGames([]);
    sessionStorage.removeItem('childId');
  };

  return (
    <div>
      <div className="parent-container container">
        <div className='d-flex justify-content-between align-items-center'>
          <h1 className="my-4 text-center flex-grow-1">Doctor Dashboard</h1>
          <button
          className="btn m-2 fw-bold card shadow-lg btn-outline-info "
          style={{ backgroundColor: "rgb(100, 150, 200)" }}
          onClick={() => navigate("/viewappointmentdoctor")}
        >
          View Appointments
        </button>
          <Button variant="" onClick={()=>{handleShow(); fetchEvents(); }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-calendar-event-fill" viewBox="0 0 16 16">
              <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2m-3.5-7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5" />
            </svg>
          </Button>
          <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
              <Modal.Title>Calendar</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Calendar events={events} />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
        <div>

          <section className="my-4 row justify-content-center">

            {!children.length ? (
              responseText ? <h3>{responseText}</h3> : <Loader />
            ) : (
              children.map((child, index) => (
                <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4 text-center">
                  <div className="card h-100" style={{ cursor: 'pointer' }} onClick={() => handleCardClick(child)}>
                    <div className="card-body">
                      <h5 className="card-title">{child.name}</h5>
                      <p className="card-text">Age: {child.age}</p>
                      <p className="card-text">Parent: {child.parentDetails}</p>
                      <p className="card-text">Therapist: {child.caretakerName}</p>
                      <p className="card-text">Center Name: {getCentreName(child.centreId)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </div>

      {selectedChild && (
        <div className={`modal fade ${isModalOpen ? 'show' : ''}`} style={{ display: isModalOpen ? 'block' : 'none' }} tabIndex="-1" role="dialog" aria-labelledby="childModalLabel" aria-hidden={!isModalOpen}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-body">
                <p><strong>Age:</strong> {selectedChild.age}</p>
                <p><strong>Parent Details:</strong> {selectedChild.parentDetails}</p>
                <p><strong>Therapist:</strong> {selectedChild.caretakerName}</p>
                <p><strong>Doctor:</strong> {selectedChild.doctorName}</p>
                <p><strong>Center Name:</strong> {getCentreName(selectedChild.centreId)}</p>
                {childFeedback && (
                  <div>
                    <h5><strong>Feedback:</strong></h5>
                    <ul>
                      {childFeedback.feedback.map((fb, index) => (
                        <li key={index}>{fb}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-3">

                </div>
              </div>
              <div className="modal-footer justify-content-between">
                <button type="button" className="btn btn-primary" onClick={handleIEP}>IEP</button>
                <button type="button" className="btn btn-success" onClick={handleReports}>Reports</button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && <div className="modal-backdrop show"></div>}
    </div>
  );
}
