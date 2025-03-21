import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "./Loader";
import { toast } from "react-toastify";

const JWLenquiries = () => {
  const [data, setData] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [videoSrc, setVideoSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [checklist, setChecklist] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      setIsLoading(true);
      const centreId = sessionStorage.getItem("centreId");
      const response = await axios.get(
        `https://testingapi.joywithlearning.com/api/admin/get-jwl-enquiries/${centreId}`,
        {
          headers: { Authorization: sessionStorage.getItem("logintoken") },
        }
      );
      setData(response.data);
    } catch (error) {
      toast.error("There was an error fetching the data!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowCardModal = async (card) => {
    setSelectedCard(card);
    setShowCardModal(true);
    setChecklist(card.checklist);
    setVideoSrc(null);
    setIsVideoLoading(true);

    try {
      const response = await axios.get(
        `https://testingapi.joywithlearning.com/api/admin/get-jwluser-video/${card.parentEmail}`,
        {
          responseType: "blob",
          headers: { Authorization: localStorage.getItem("logintoken") },
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

  const handleCloseCardModal = () => {
    setShowCardModal(false);
    setSelectedCard(null);
    setVideoSrc(null);
    setChecklist(null);
  };

  const handleDelete = async (parentEmail) => {
    try {
      handleCloseCardModal();
      setIsLoading(true);
      setShowDeleteModal(false);
      await axios.put(
        `https://testingapi.joywithlearning.com/api/admin/archive-jwl-enquiry`,
        {
          parentEmail,
        },
        {
          headers: {
            Authorization: `${sessionStorage.getItem("logintoken")}`,
          },
        }
      );

      toast.success("Record archived successfully!");
      fetchEnquiries();
    } catch (error) {
      toast.error("There was an error archiving the record!");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Enquiries</h1>
      {isLoading && (
        <div
          className="d-flex justify-content-center align-items-top"
          style={{ height: "80vh" }}
        >
          <Loader />
        </div>
      )}
      {!isLoading && (
        <div className="row">
          {data.length === 0 && (
            <div className="col-12">
              <h3 className="text-center">No new enquiries found . . .</h3>
            </div>
          )}
          {data.map((row, index) => (
            <div
              key={index}
              className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4"
              style={{ cursor: "pointer" }}
              onClick={() => handleShowCardModal(row)}
            >
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5>Parent Details : </h5>
                  <h5 className="card-title">{row.parentName}</h5>
                  <p className="card-text mb-1">{row.parentEmail}</p>
                  <p className="card-text">{row.parentPhoneNo}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCardModal && selectedCard && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={handleCloseCardModal}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title">Enquiry Information</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseCardModal}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Email:</strong> {selectedCard.parentEmail}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedCard.parentPhoneNo}
                </p>
                <p>
                  <strong>Child Name:</strong> {selectedCard.childName}
                </p>
                <p>
                  <strong>Child Age:</strong> {selectedCard.childAge}
                </p>
                <p>
                  <strong>Gender:</strong> {selectedCard.childGender}
                </p>
                <p>
                  <strong>Preferred Center:</strong>{" "}
                  {selectedCard.preferredCenter}
                </p>
                <p>
                  <strong>Video Call:</strong>{" "}
                  {selectedCard.videoCall ? "Yes" : "No"}
                </p>
                {isVideoLoading ? (
                  <div className="d-flex justify-content-center align-items-center">
                    <Loader />
                  </div>
                ) : videoSrc ? (
                  <div>
                    <p>
                      <strong>Uploaded Video :</strong>
                    </p>
                    <video
                      controls
                      src={videoSrc}
                      style={{ width: "100%" }}
                    ></video>
                  </div>
                ) : (
                  <p>No video available.</p>
                )}
                {/* {checklist && (
                  <div className="mt-3">
                    <p>
                      <strong>Checklist :</strong>
                    </p>
                    {Object.keys(checklist).map((key, index) => (
                      <p key={index}>
                        {key.toUpperCase()}: {checklist[key]}
                      </p>
                    ))}
                  </div>
                )} */}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Archive Enquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Archive Confirmation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to archive this enquiry?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDelete(selectedCard.parentEmail)}
                >
                  Confirm Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JWLenquiries;
