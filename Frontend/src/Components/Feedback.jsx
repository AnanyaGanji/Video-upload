import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Feedback() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobilenumber, setMobilenumber] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://testingapi.joywithlearning.com/api/userfeedback", {
        name,
        email,
        mobilenumber,
        feedback,
      });
      toast.success("Feedback sent successfully!", { autoClose: 2000 });
      document.getElementById("Form").reset();
    } catch (error) {
      toast.error("Feedback submission failed. Please try again.");
    }
  };

  return (
    <div className="container-fluid py-3">
      <ToastContainer />
      <div className="text-center mb-4">
        <h2 className="fw-bold">We Value Your Feedback</h2>
        <p>Help us improve our services by providing your valuable feedback.</p>
      </div>
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <div className="card shadow rounded-4">
            <div className="card-body p-4">
              <h3 className="card-title text-center fw-bold mb-4">
                Feedback Form
              </h3>
              <form onSubmit={handleSubmit} id="Form">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control rounded-3 border border-secondary"
                    id="name"
                    placeholder="Your Name"
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <label htmlFor="name">Name</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control rounded-3 border border-secondary"
                    id="email"
                    placeholder="name@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label htmlFor="email">Email</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="tel"
                    className="form-control rounded-3 border border-secondary"
                    id="phone"
                    placeholder="Phone Number"
                    onChange={(e) => setMobilenumber(e.target.value)}
                    required
                  />
                  <label htmlFor="phone">Phone Number</label>
                </div>
                <div className="form-floating mb-4">
                  <textarea
                    className="form-control rounded-3 border border-secondary"
                    id="feedback"
                    placeholder="Leave a comment here"
                    style={{ height: "120px" }}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                  ></textarea>
                  <label htmlFor="feedback">Feedback</label>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg px-5 rounded-3"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
