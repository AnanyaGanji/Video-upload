import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

export default function BookAppointment() {
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    childName: "",
    childAge: "",
    parentName: "",
    parentId: null,
    email: "",
    dob: "",
    parentPhoneNo: "",
    appointmentDate: "",
    time: "",
    doctorId: "",
    schoolName: "",
    classGrade: "",
    schoolBoard: "",
    childConcerns: "",
    branch: "",
    gender: "",
    alternativeNumber: "",
    address: "",
    consultationType: "",
    referredBy: "",
  });
  const [branches,setBranches] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([
    "10:30 AM",
    "11:30 AM",
    "12:30 PM",
    "2:00 PM",
    "3:00 PM",
    "3:30 PM",
    "4:30 PM",
    "5:30 PM",
  ]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [pdf, setPDF] = useState(null);

  const updateFormState = (key, value) => {
    setFormState((prevState) => ({ ...prevState, [key]: value }));
  };
  const initializeParent = () => {
    const parentId = sessionStorage.getItem("id");
    if (sessionStorage.getItem("role") === "parent" && parentId) {
      updateFormState("parentId", parentId); // Set the valid parentId
    } else {
      updateFormState("parentId", null); // Explicitly set null
    }
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(
          "https://testingapi.joywithlearning.com/api/data/alldoctors",
          {
            headers: { Authorization: sessionStorage.getItem("logintoken") },
          }
        );
        setDoctors(response.data);
      } catch (error) {
        toast.error("Error fetching doctors");
      }
    };

    const initializeParent = () => {
      if (sessionStorage.getItem("role") === "parent") {
        updateFormState("parentId", sessionStorage.getItem("id"));
      }
    };

    const fetchBranches = async () => {
      try {
        const response = await axios.get(
          "https://testingapi.joywithlearning.com/api/data/allcentres",
          {
            headers: { Authorization: localStorage.getItem("logintoken") },
          }
        );
        setBranches(response.data);
      } catch (error) {
        toast.error("Error fetching branches");
      }
    };

    fetchBranches();
    fetchDoctors();
    initializeParent();
  }, []);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (formState.doctorId && formState.appointmentDate) {
        try {
          const response = await axios.get(
            `https://testingapi.joywithlearning.com/api/admin/getConsultations/${formState.doctorId}/${formState.appointmentDate}`,
            { headers: { Authorization: localStorage.getItem("logintoken") } }
          );
          const booked = response.data.flatMap((consultation) =>
            consultation.slots
              .filter((slot) => slot.booked)
              .map((slot) => slot.time)
          );
          setBookedSlots(booked);
        } catch (error) {
          toast.error("Error fetching booked slots");
        }
      } else {
        setBookedSlots([]);
      }
    };

    fetchBookedSlots();
  }, [formState.doctorId, formState.appointmentDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    initializeParent();
    try {
      const formData = new FormData();
      Object.entries(formState).forEach(([key, value]) =>
        formData.append(key, value)
      );
      if (pdf) {
        formData.append("pdf", pdf);
      }

      await axios.post(
        "https://testingapi.joywithlearning.com/api/admin/bookAppointment",
        formData,
        {
          headers: {
            "Authorization": sessionStorage.getItem('logintoken'),
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success("Appointment booked successfully!");
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      toast.error(error);
    }
  };

  const handleTimeSelect = (selectedTime) => {
    if (!bookedSlots.includes(selectedTime)) {
      updateFormState("time", selectedTime);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "childName",
      "childAge",
      "parentName",
      "email",
      "parentPhoneNo",
      "appointmentDate",
      "time",
      "doctorId",
    ];
    return requiredFields.every((field) => formState[field]);
  };

  const getAvailableTimes = () => {
    const availableSlots = timeSlots.filter(
      (time) => !bookedSlots.includes(time)
    );
    return availableSlots.slice(0, 4);
  };

  return (
    <div className="container-lg py-5">
      <ToastContainer />
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-header text-center py-3">
              <h2 className="mb-0">Book Appointment</h2>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Child Name<span style={{color:"red"}}>*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={formState.childName}
                      onChange={(e) =>
                        updateFormState("childName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Child Age<span style={{color:"red"}}>*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      value={formState.childAge}
                      onChange={(e) =>
                        updateFormState("childAge", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  {/* Date of Birth Field */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date of Birth<span style={{color:"red"}}>*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      value={formState.dob}
                      onChange={(e) => updateFormState("dob", e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  {/* Gender Field */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Gender<span style={{color:"red"}}>*</span></label>
                    <select
                      className="form-select"
                      value={formState.gender}
                      onChange={(e) =>
                        updateFormState("gender", e.target.value)
                      }
                      required
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Others">Other</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Parent Name<span style={{color:"red"}}>*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={formState.parentName}
                      onChange={(e) =>
                        updateFormState("parentName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Parent Email<span style={{color:"red"}}>*</span></label>
                    <input
                      type="email"
                      className="form-control"
                      value={formState.email}
                      onChange={(e) => updateFormState("email", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Parent Phone Number<span style={{color:"red"}}>*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      value={formState.parentPhoneNo}
                      onChange={(e) =>
                        updateFormState("parentPhoneNo", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Alternate Number</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formState.alternativeNumber}
                      onChange={(e) =>
                        updateFormState("alternativeNumber", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="childConcerns" className="form-label">
                      Concerns:
                      <span style={{color:"red"}}>*</span>
                    </label>
                    <textarea
                      id="childConcerns"
                      className="form-control"
                      rows="3"
                      value={formState.childConcerns}
                      onChange={(e) =>
                        updateFormState("childConcerns", e.target.value)
                      }
                      required
                    ></textarea>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="address" className="form-label">
                      Address:<span style={{color:"red"}}>*</span>
                    </label>
                    <textarea
                      id="address"
                      className="form-control"
                      rows="3"
                      value={formState.address}
                      onChange={(e) =>
                        updateFormState("address", e.target.value)
                      }
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">School Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formState.schoolName}
                      onChange={(e) =>
                        updateFormState("schoolName", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Class/Grade</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formState.classGrade}
                      onChange={(e) =>
                        updateFormState("classGrade", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="schoolBoard">School Board:</label>
                    <select
                      id="schoolBoard"
                      className="form-select"
                      value={formState.schoolBoard}
                      onChange={(e) =>
                        updateFormState("schoolBoard", e.target.value)
                      }
                    >
                      {" "}
                      <option value="">Select School Board</option>
                      <option value="CBSE">CBSE</option>
                      <option value="SSC">SSC</option>
                      <option value="ICSE">ICSE</option>
                      <option value="Camebridge (IB)">Cambridge (IB)</option>
                      <option value="NIOS">NIOS</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Referred By</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formState.referredBy}
                      onChange={(e) =>
                        updateFormState("referredBy", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Appointment Date<span style={{color:"red"}}>*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      value={formState.appointmentDate}
                      onChange={(e) =>
                        updateFormState("appointmentDate", e.target.value)
                      }
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Select Branch<span style={{color:"red"}}>*</span></label>
                    <select
                      className="form-select"
                      value={formState.branch}
                      onChange={(e) =>
                        updateFormState("branch", e.target.value)
                      }
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch._id} value={branch.name}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Select Consultation type<span style={{color:"red"}}>*</span></label>
                  <select
                    className="form-select"
                    value={formState.consultationType}
                    onChange={(e) =>
                      updateFormState("consultationType", e.target.value)
                    }
                    required
                  >
                    <option value="">Select Consultation Type</option>
                    <option value="New Consultation">
                      New Consultation Rs.700/-
                    </option>
                    <option value="Assessment(IQ)">
                      Assessment (IQ) Rs.6000/-
                    </option>
                    <option value="For IB board Assessment(IQ)">
                      For IB board Assessment (IQ) Rs.12000/-
                    </option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Select Doctor<span style={{color:"red"}}>*</span></label>
                  <select
                    className="form-select"
                    value={formState.doctorId}
                    onChange={(e) =>
                      updateFormState("doctorId", e.target.value)
                    }
                    required
                  >
                    <option value="">-- Select a Doctor --</option>
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                  <label className="form-label">Time<span style={{color:"red"}}>*</span></label>
                  {getAvailableTimes().map((time) => (
                    <button
                      type="button"
                      className={`btn ${
                        formState.time === time
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="uploadFile" className="form-label">
                      Upload previous reports (if any):
                    </label>
                    <input
                      type="file"
                      id="uploadFile"
                      className="form-control"
                      onChange={(e) => setPDF(e.target.files[0])}
                      accept=".pdf"
                      color="blue"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary mt-3"
                  disabled={!validateForm()}
                >
                  Book Appointment
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
