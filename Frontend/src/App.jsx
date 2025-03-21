import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Components/Login.jsx";
import ParentHome from "./Components/ParentHome.jsx";
import Navbar from "./Components/Navbar.jsx";
import Register from "./Components/Register.jsx";
import Therapist from "./Components/Therapist.jsx";
import Admin from "./Components/Admin.jsx";
import Doctor from "./Components/Doctor.jsx";
import Games from "./Components/Games.jsx";
import AdminRegister from "./Components/Adminregistration.jsx";
import Reports from "./Components/Reports.jsx";
import ContactUs from "./Components/ContactUs.jsx";
import ChildRegister from "./Components/Childform.jsx";
import Feedback from "./Components/Feedback.jsx";
import AboutUs from "./Components/AboutUs.jsx";
import IEPDoctor from "./Components/IEPDoctor.jsx";
import IEPTherapist from "./Components/IEPTherapist.jsx";
import AppointmentBooking from "./Components/BookAppointment.jsx";
import Calendar from "./Components/Calendar.jsx";
import ApproveAppointments from "./Components/ApproveAppointments.jsx";
import JWLenquiries from "./Components/JWLenquiries.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import ViewAppointment from "./Components/Viewappointmentsadmin.jsx";
import Appointments from "./Components/viewappointmentsdoctor.jsx";
import ParentAppointments from "./Components/viewappointmentsparent.jsx";
import UploadVideo from "./Components/Upload_video.jsx";
import ViewVideo from "./Components/ViewVideo.jsx";
import "./App.css";

const NotFound = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center text-center">
      <h1 className="display-1 fw-bold text-dark">404</h1>
      <p className="fs-4 text-secondary">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
    </div>
  );
};

const Forbidden = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center text-center">
      <h1 className="display-1 fw-bold text-dark">403</h1>
      <p className="fs-4 text-secondary">
        You are not Authorised for this page
      </p>
    </div>
  );
};

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/parentdashboard"
            element={
              <ProtectedRoute requiredRole="parent">
                <ParentHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parentdashboard/childregister"
            element={
              <ProtectedRoute requiredRole="parent">
                <ChildRegister />
              </ProtectedRoute>
            }
          />

          <Route
            path="/caretakerdashboard"
            element={
              <ProtectedRoute requiredRole="caretaker">
                <Therapist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/caretakerdashboard/iep"
            element={
              <ProtectedRoute requiredRole="caretaker">
                <IEPTherapist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctordashboard"
            element={
              <ProtectedRoute requiredRole="doctor">
                <Doctor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctordashboard/iep"
            element={
              <ProtectedRoute requiredRole="doctor">
                <IEPDoctor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admindashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admindashboard/adminregister"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminRegister />
              </ProtectedRoute>
            }
          />

          <Route path="/reports" element={<Reports />} />
          <Route path="/games" element={<Games />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route
            path="/bookappointment"
            element={
              <ProtectedRoute requiredRole={["admin", "parent"]}>
                <AppointmentBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/viewappointment"
            element={
              <ProtectedRoute requiredRole="admin">
                <ViewAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/viewappointmentdoctor"
            element={
              <ProtectedRoute requiredRole="doctor">
                <Appointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/viewappointmentparent"
            element={
              <ProtectedRoute requiredRole="parent">
                <ParentAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approveappointment"
            element={
              <ProtectedRoute requiredRole="admin">
                <ApproveAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jwlenquiries"
            element={
              <ProtectedRoute requiredRole="admin">
                <JWLenquiries />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/about" element={<AboutUs />} />
          <Route
            path="/"
            element={
              <div className="container mt-5">
                <div className="fw-bolder fs-1 text-center">
                  Welcome to the Joy With Learning Portal
                </div>
              </div>
            }
          />

          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/upload-video" element={<UploadVideo/>}></Route>
          <Route path="/view-video" element={<ViewVideo/>}></Route>
        </Routes>

      </Router>

    </>
  );
}

export default App;
