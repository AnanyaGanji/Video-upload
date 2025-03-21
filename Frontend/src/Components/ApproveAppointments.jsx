import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./Loader";

export default function ApproveAppointments() {
  const [appointment, setAppointment] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSlotBooked, setIsSlotBooked] = useState(null); // null = unchecked, true = booked, false = available

  useEffect(() => {
    getAppointments();
  }, []);

  async function getAppointments() {
    try {
      setIsLoading(true);
      const res = await axios.get("https://testingapi.joywithlearning.com/api/admin/getAppointments", {
        headers: { Authorization: localStorage.getItem("logintoken") },
      });

      const pendingAppointments = res.data.filter((item) => item.status !== "confirmed" && item.status !== "rejected");

      setAppointment(pendingAppointments);
    } catch (e) {
      toast.error("Failed to fetch appointments!");
    } finally {
      setIsLoading(false);
    }
  }

  const handleClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setIsSlotBooked(null); // Reset status when opening modal
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setIsSlotBooked(null);
  };

  async function checkAvailability(appointmentID) {
    try {
      setIsLoading(true);
      const res = await axios.put(
        `https://testingapi.joywithlearning.com/api/admin/verifyAppointment/${appointmentID}`,
        {},
        {
          headers: { Authorization: `${localStorage.getItem("logintoken")}` },
        }
      );

      setIsSlotBooked(res.data.booked);
      if (res.data.booked) {
        toast.error("Slot already booked!");
      } else {
        toast.success("Slot is available!");
      }
    } catch (e) {
      toast.error("Failed to check availability.");
    } finally {
      setIsLoading(false);
    }
  }

  async function approveIt(appointmentID) {
    try {
      setIsLoading(true);
      await axios.put(
        `https://testingapi.joywithlearning.com/api/admin/verifyAppointment/${appointmentID}`,
        { status: "confirmed" },
        {
          headers: { Authorization: `${localStorage.getItem("logintoken")}` },
        }
      );
      toast.success("Appointment approved successfully!");
      getAppointments();
      closeModal();
    } catch (e) {
      toast.error("Failed to approve appointment.");
    } finally {
      setIsLoading(false);
    }
  }

  async function rejectIt(appointmentID) {
    try {
      setIsLoading(true);
      await axios.put(
        `https://testingapi.joywithlearning.com/api/admin/verifyAppointment/${appointmentID}`,
        { status: "rejected" },
        {
          headers: { Authorization: `${localStorage.getItem("logintoken")}` },
        }
      );
      toast.success("Appointment rejected successfully!");
      getAppointments();
      closeModal();
    } catch (e) {
      toast.error("Failed to reject appointment.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="parent-container container">
      <ToastContainer />
      {isLoading && (
        <div className="d-flex justify-content-center align-items-top" style={{ height: "80vh" }}>
          <Loader />
        </div>
      )}
      {!isLoading && appointment.length === 0 && (
        <h3 className="text-center">No Appointments Pending</h3>
      )}
      {!isLoading && appointment.length > 0 && (
        <section className="card-container row">
          {appointment.map((item) => (
            <div className="col-md-3 mb-4" key={item._id} onClick={() => handleClick(item)}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Appointment Request by {item.parentName}</h5>
                  <p className="card-text mt-1">Child Name: {item.childName}</p>
                  <p className="card-text mt-1">Phone No: {item.parentPhoneNo}</p>
                  <p className="card-text mt-1">Address: {item.address}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {selectedItem && (
        <div className={`modal fade ${isModalOpen ? "show" : ""}`} style={{ display: isModalOpen ? "block" : "none" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Appointment Details</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>Parent Name:</strong> {selectedItem.parentName}</p>
                <p><strong>Child Name:</strong> {selectedItem.childName}</p>
                <p><strong>Appointment Date:</strong> {selectedItem.appointmentDate}</p>
                <p><strong>Time:</strong> {selectedItem.time}</p>

                <button className="btn btn-info mb-2" onClick={() => checkAvailability(selectedItem._id)}>
                  Check Availability
                </button>

                {isSlotBooked !== null && (
                  <p className={`mt-2 ${isSlotBooked ? "text-danger" : "text-success"}`}>
                    {isSlotBooked ? "This slot is already booked!" : "This slot is available."}
                  </p>
                )}

                <div className="d-flex justify-content-between">
                  <button className="btn btn-danger" onClick={() => rejectIt(selectedItem._id)}>Reject</button>
                  <button
                    className="btn btn-success"
                    onClick={() => approveIt(selectedItem._id)}
                    disabled={isSlotBooked} // Disable button if slot is booked
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
