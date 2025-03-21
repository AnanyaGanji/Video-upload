import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "./Loader";
import Calendar from "./Calendar";
import { Button, Modal } from "react-bootstrap";
export default function Therapist() {
  const [data, setData] = useState([]);
  const [childDetails, setChildDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  

  const [video, setVideo] = useState(null);
    const [description, setDescription] = useState('');
    const [videos, setVideos] = useState([]);

    // Fetch all uploaded videos on component mount
  //   useEffect(() => {
  //     if (childDetails) {
  //         getVideos(childDetails._id);
  //         console.log("working");
  //     }

  // }, [childDetails]);
  

    const handleUpload = async (file, childId) => {
      if (!file || !childId) {
          console.error("File or child ID is missing");
          return;
      }
  
      const formData = new FormData();
      formData.append("video", file);
      formData.append("description", description);
  
      try {
        const token = sessionStorage.getItem("logintoken");

          const response = await axios.post(
              `http://localhost:4001/api/caretaker/uploadVideo/${childId}`,
              formData,
              {
                headers: {
                  Authorization: `${token}`,
                },
              }
          );
          console.log("Upload successful:", response.data);
          setVideos([...videos, response.data]); // Update UI
      } catch (error) {
          console.error("Upload error:", error.response ? error.response.data : error.message);
      }
  };
  

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
      setVideo(file);
  }
};
const getVideos = async (childId) => {
  if (!childId) return;
  
  try {
    const token = sessionStorage.getItem("logintoken");

      const response = await axios.get(
          `http://localhost:4001/api/caretaker/getVideos/${childId}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
      );
      console.log("Videos fetched:", response.data);
      setVideos(response.data);
  } catch (error) {
      console.error("Error fetching videos:", error.response ? error.response.data : error.message);
  }
};


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("logintoken");
        const response = await axios.get(
          "https://testingapi.joywithlearning.com/api/caretaker/assigned",
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        if (response.data.length === 0) {
          setResponseText("No Children Assigned");
          setLoading(false);
          return;
        }
        setResponseText("");
        setData(response.data);
      } catch (err) {
        toast.error("Error fetching children");
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleCardClick = (child) => {
    setIsModalOpen(true);
    setChildDetails(child);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setChildDetails(null);
    sessionStorage.removeItem("childId");
  };
  const navigate = useNavigate();
  const gotoGames = () => {
    sessionStorage.setItem("childId", childDetails._id);
    navigate("/games");
  };
  const gotoReports = () => {
    sessionStorage.setItem("childId", childDetails._id);
    navigate("/reports");
  };
  const gotoIEP = () => {
    sessionStorage.setItem("childId", childDetails._id);
    navigate("/caretakerdashboard/iep");
  };
  
  const gotoUploadVideo = () => {
    navigate("/upload-video", { state: { childDetails } });
  };

  const gotoViewUploadedVideos = () => {
    navigate("/view-video",{state:{childDetails}});
  };
  const events = {};

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="text-center flex-grow-1 ">Therapist Dashboard</h1>

        <Button variant="" onClick={handleShow}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            fill="currentColor"
            className="bi bi-calendar-event-fill"
            viewBox="0 0 16 16"
          >
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
        </Modal>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <Loader />
        </div>
      ) : responseText ? (
        <h3 className="text-center text-muted">{responseText}</h3>
      ) : null}
      <div className="row">
        {data.map((item) => (
          <div key={item._id} className="col-md-4 mb-4">
            <div
              className="card h-100 shadow-sm"
              onClick={() => handleCardClick(item)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-body text-center">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text text-muted">Age: {item.age}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {childDetails && (
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
                  {childDetails.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Age:</strong> {childDetails.age}
                </p>
                <p>
                  <strong>Doctor:</strong> {childDetails.doctorName}
                </p>
                <p>
                  <strong>Therapist:</strong> {childDetails.caretakerName}
                </p>
                <p>
                  <strong>Parent:</strong> {childDetails.parentDetails}
                </p>
                <p>
                  <strong>Upload Video:</strong>
                  <span 
                    onClick={gotoUploadVideo} 
                    style={{ marginLeft: "10px", color: "blue", textDecoration: "underline", cursor: "pointer" }}
                  >
                    Upload video
                  </span>
                </p>
                <p>
                  <strong>View Uploaded Videos:</strong>
                  <span 
                  onClick={gotoViewUploadedVideos}
                  style={{ marginLeft: "10px", color: "blue", textDecoration: "underline", cursor: "pointer" }}
                  >
                    View uploaded videos
                  </span>
                </p>
                  </div>
              {/* <h3>Uploaded Videos</h3>
                {videos.length === 0 ? <p>No videos uploaded</p> : (
                    <ul>
                        {videos.map((video, index) => (
    <li key={index}>
        <video controls>
            <source src={`http://localhost:4001/${video.videoPath.replace(/\\/g, "/")}`} type="video/mp4" />
            {console.log(`http://localhost:4001/${video.videoPath.replace(/\\/g, "/")}`)}
        </video>
        <p>{video.description}</p>
        <p><b>Uploaded on:</b> {new Date(video.timestamp).toLocaleString()}</p>
    </li>
))}

                    </ul>
                )} */}
              <div className="modal-footer justify-content-between">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={gotoIEP}
                >
                  IEP
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={gotoGames}
                >
                  Play Games
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={gotoReports}
                >
                  Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-backdrop fade show" onClick={closeModal}></div>
      )}
    </div>
  );
}
