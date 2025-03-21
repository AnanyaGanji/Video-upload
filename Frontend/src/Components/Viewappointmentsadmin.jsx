import  { useState, useEffect } from "react";
import axios from "axios";
import { toast ,ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Loader from "./Loader";

export default function ViewAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const logintoken = sessionStorage.getItem("logintoken");

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get("https://testingapi.joywithlearning.com/api/data/alldoctors", {
          headers: {
            Authorization: `${logintoken}`,
          },
        });
        setDoctors(response.data);
      } catch (error) {
        toast.error("Failed to fetch doctors!");
      }
    };

    fetchDoctors();
  }, [logintoken]);

  const handleDoctorChange = async (event) => {
    const doctorId = event.target.value;
    setSelectedDoctor(doctorId);
    setSelectedDate("");

    if (!doctorId) {
      setAppointments([]);
      setFilteredAppointments([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `https://testingapi.joywithlearning.com/api/admin/getappointments/${doctorId}`,
        {
          headers: {
            Authorization: `${logintoken}`,
          },
        }
      );
      setAppointments(response.data);
      setFilteredAppointments(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch appointments!");
      setLoading(false);
    }
  };

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);

    if (date) {
      const filtered = appointments.filter(
        (appointment) => appointment.appointmentDate === date
      );
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments(appointments);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handlePrescriptionUpload = async (appointmentID) => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      const response = await axios.put(
        `https://testingapi.joywithlearning.com/api/admin/uploadPrescription/${appointmentID}`,
        formData,
        {
          headers: {
            Authorization: `${logintoken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert(response.data.message);
    } catch (error) {
      toast.error("Error uploading prescription!");
    }
  };

  const handleViewPrescription = (prescriptionPath) => {
    if (prescriptionPath) {
      window.open(`https://testingapi.joywithlearning.com/${prescriptionPath}`, "_blank");
    } else {
      alert("No prescription found.");
    }
  };

  return (
    <div className="container mt-4">
      <ToastContainer />
      <h2>View Appointments</h2>

      <div className="form-group">
        <label htmlFor="doctor-select">Select a Doctor:</label>
        <select
          id="doctor-select"
          className="form-control"
          value={selectedDoctor}
          onChange={handleDoctorChange}
        >
          <option value="">-- Select Doctor --</option>
          {doctors.map((doctor) => (
            <option key={doctor._id} value={doctor._id}>
              {doctor.name}
            </option>
          ))}
        </select>
      </div>

      {appointments.length > 0 && (
        <div className="form-group mt-3">
          <label htmlFor="date-select">Filter by Date:</label>
          <input
            type="date"
            id="date-select"
            className="form-control"
            value={selectedDate}
            onChange={handleDateChange}
          />
        </div>
      )}

      {loading ? 
        <div className="d-flex justify-content-center">
      <Loader /> 
        </div>
      : (
        <>
      {filteredAppointments.length > 0 && (
        <div className="mt-4">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Parent Name</th>
                <th>Child Name</th>
                <th>Appointment Date</th>
                <th>Time</th>
                <th>Contact</th>
                <th>Branch</th>
                <th>Upload Prescription</th>
                <th>View Prescription</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment, index) => (
                <tr key={appointment._id}>
                  <td>{index + 1}</td>
                  <td>{appointment.parentName || "N/A"}</td>
                  <td>{appointment.childName}</td>
                  <td>{appointment.appointmentDate}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.parentPhoneNo}</td>
                  <td>{appointment.branch}</td>
                  <td>
                    <input type="file" onChange={handleFileChange} />
                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => handlePrescriptionUpload(appointment._id)}
                    >
                      Upload
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-info"
                      onClick={() => handleViewPrescription(appointment.prescription)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </>
      )}
    </div>
  );
}
