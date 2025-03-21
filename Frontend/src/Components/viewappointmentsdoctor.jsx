import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "./Loader";
import {toast, ToastContainer} from "react-toastify";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoSrc, setVideoSrc] = useState(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const id = sessionStorage.getItem("id");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://testingapi.joywithlearning.com/api/admin/getAppointments/${id}`,
          {
            headers: {
              Authorization: `${sessionStorage.getItem("logintoken")}`,
            },
          }
        );
        setAppointments(response.data);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch appointments!");
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleShowVideoModal = async (appointment) => {
    setSelectedAppointment(appointment);
    setShowVideoModal(true);
    setVideoSrc(null);
    setIsVideoLoading(true);

    try {
      const response = await axios.get(
        `https://testingapi.joywithlearning.com/api/admin/get-jwluser-video/${appointment.email}`,
        {
          responseType: "blob",
          headers: { Authorization: sessionStorage.getItem("logintoken") },
        }
      );
      const videoURL = URL.createObjectURL(response.data);
      setVideoSrc(videoURL);
    } catch (error) {
      toast.error("There was an error fetching the video!");
    } finally {
      setIsVideoLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
  <h1 className="text-center mb-4">Appointments</h1>
  {loading ? (
    <div className="d-flex justify-content-center">
      <Loader />
    </div>
  ) : (
    <div className="table-responsive">
      <table className="table table-bordered table-hover align-middle shadow rounded">
        <thead className="thead-dark">
          <tr>
            <th scope="col">S.No</th>
            <th scope="col">Parent Name</th>
            <th scope="col">Child Name</th>
            <th scope="col">Prescription</th>
            <th scope="col">Video</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment, index) => (
            <tr key={appointment._id} className="table-light">
              <td>{index + 1}</td>
              <td>{appointment.parentName}</td>
              <td>{appointment.childName}</td>
              <td>
                <div
                  className="card rounded-0 p-2"
                  onClick={() =>
                    window.open(
                      `https://testingapi.joywithlearning.com/${appointment.prescription}`,
                      "_blank"
                    )
                  }
                >
                  View Prescription
                </div>
              </td>
              <td>
                <button
                  className="card rounded-0 p-2"
                  onClick={() => handleShowVideoModal(appointment)}
                >
                  View Video
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}

  {/* Modal for Video */}
  {showVideoModal && (
    <div
      className="modal show fade d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            {/* <h5 className="modal-title"> */}
              {/* Video for {selectedAppointment?.parentName} */}
            {/* </h5> */}
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowVideoModal(false)}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {isVideoLoading ? (
              <div className="d-flex justify-content-center">
                <Loader />
              </div>
            ) : videoSrc ? (
              <video controls src={videoSrc} style={{ width: "100%" }} />
            ) : (
              <p className="text-danger">Unable to load the video.</p>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowVideoModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
</div>

  );
};

export default Appointments;
