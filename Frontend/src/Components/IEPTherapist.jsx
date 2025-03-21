import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "./Loader";
import { ToastContainer, toast } from "react-toastify";

export default function IEPTherapist() {
  const [responses, setResponses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentGoalData, setCurrentGoalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [performanceInputs, setPerformanceInputs] = useState([]);
  const [currentMonth, setCurrentMonth] = useState("");
  const [doctorFeedback, setDoctorFeedback] = useState("");
  const [therapistFeedback, setTherapistFeedback] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://testingapi.joywithlearning.com/api/caretaker/childIEP/${sessionStorage.getItem(
            "childId"
          )}`,
          {
            headers: {
              Authorization: `${sessionStorage.getItem("logintoken")}`,
            },
          }
        );
        setResponses(response.data);
      } catch (error) {
        toast.error("Error fetching data", { autoClose: 2000 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleModalOpen = (goalData, responseIndex, monthIndex) => {
    setCurrentGoalData({ ...goalData, responseIndex, monthIndex });
    setCurrentMonth(goalData.month);
    setPerformanceInputs(
      goalData.performance && goalData.performance.length
        ? [...goalData.performance]
        : goalData.goals.map(() => "")
    );
    setTherapistFeedback(
      responses[responseIndex].monthlyGoals[monthIndex].therapistFeedback || ""
    );
    setDoctorFeedback(
      responses[responseIndex].monthlyGoals[monthIndex].doctorFeedback || ""
    );
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setCurrentGoalData(null);
    setPerformanceInputs([]);
  };

  const handlePerformanceChange = (goalIndex, value) => {
    setPerformanceInputs((prevInputs) => {
      const updatedInputs = [...prevInputs];
      updatedInputs[goalIndex] = value;
      return updatedInputs;
    });
  };

  const handleSavePerformance = async () => {
    if (!performanceInputs.length) return;

    try {
      const childId = sessionStorage.getItem("childId");
      await axios.put(
        `https://testingapi.joywithlearning.com/api/doctor/updateperformance/${childId}`,
        {
          performance: performanceInputs,
          month: currentMonth,
          therapistFeedback: therapistFeedback,
        },
        {
          headers: { Authorization: `${sessionStorage.getItem("logintoken")}` },
        }
      );

      setResponses((prevResponses) => {
        const updatedResponses = [...prevResponses];
        const { responseIndex, monthIndex } = currentGoalData;
        updatedResponses[responseIndex].monthlyGoals[monthIndex].performance = [
          ...performanceInputs,
        ];
        updatedResponses[responseIndex].monthlyGoals[
          monthIndex
        ].therapistFeedback = therapistFeedback;
        return updatedResponses;
      });

      toast.success("Performance updated successfully!", { autoClose: 2000 });
    } catch (error) {
      toast.error("Error updating performance", { autoClose: 2000 });
    } finally {
      handleModalClose();
    }
  };

  const handleTherapistFeedback = (event) => {
    setTherapistFeedback(event.target.value);
  };

  return (
    <div className="container py-4">
      <ToastContainer />
      <h1 className="mb-4">IEP Progress Tracking</h1>
      {loading ? (
        <Loader />
      ) : responses.length > 0 ? (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
          {responses.map((response, responseIndex) =>
            response.monthlyGoals.map((goalData, monthIndex) => (
              <div className="col" key={`${responseIndex}-${monthIndex}`}>
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{goalData.month}</h5>
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        handleModalOpen(goalData, responseIndex, monthIndex)
                      }
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <h4>No IEP data available!</h4>
      )}

{showModal && currentGoalData && (
  <div
    className="modal fade show"
    style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    tabIndex="-1"
    role="dialog"
  >
    <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title text-truncate">
            IEP Details - {currentGoalData.month}
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={handleModalClose}
            aria-label="Close"
          ></button>
        </div>
        <div className="modal-body">
          <div className="card mb-3">
            <div className="card-header" style={{ backgroundColor: "blanchedalmond" }}>
              Target
            </div>
            <div className="card-body">
                <h4>{currentGoalData.target}</h4>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header" style={{ backgroundColor: "blanchedalmond" }}>
              Goals
            </div>
            <div className="card-body">
              <ul>
                {currentGoalData.goals.map((goal, goalIndex) => (
                  <li key={goalIndex}>
                    {goal}
                    <div className="mt-2">
                      <input
                        type="number"
                        className="form-control"
                        value={performanceInputs[goalIndex] || ""}
                        onChange={(e) =>
                          handlePerformanceChange(goalIndex, e.target.value)
                        }
                        placeholder="Enter performance (0-100 %)"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header" style={{ backgroundColor: "blanchedalmond" }}>
              Feedback
            </div>
            <div className="card-body">
              <input
                type="text"
                className="form-control border border-4"
                value={therapistFeedback}
                onChange={(e) => handleTherapistFeedback(e)}
                placeholder="Enter feedback based on the child performance"
              />
            </div>
          </div>

          {doctorFeedback && (
            <div className="card mb-3">
              <div className="card-header" style={{ backgroundColor: "blanchedalmond" }}>
                Doctor&apos;s Feedback
              </div>
              <div className="card-body">
                <p>{doctorFeedback}</p>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSavePerformance}
          >
            Save Performance
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleModalClose}
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
}
