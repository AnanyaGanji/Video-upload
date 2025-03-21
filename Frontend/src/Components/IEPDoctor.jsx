import { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from './Loader';
import { ToastContainer, toast } from 'react-toastify';
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Progress() {
  const [responses, setResponses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitText, setSubmitText] = useState('');
  const [therapistName, setTherapistName] = useState(sessionStorage.getItem("therapistName"));
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('1');
  const currentYear = new Date().getFullYear();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonthDetails, setSelectedMonthDetails] = useState(null);
  const [doctorFeedback, setDoctorFeedback] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`https://testingapi.joywithlearning.com/api/caretaker/childIEP/${sessionStorage.getItem("childId")}`,
          { headers: { Authorization: `${sessionStorage.getItem("logintoken")}` } }
        );
        setResponses(response.data);
      } catch (error) {
        toast.error("Error fetching data : " + error, { autoClose: 2000 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleViewIEP = () => {
    const doc = new jsPDF();
    const tableData = [];

    const therapyName = responses[0]?.therapy || "N/A";
    const therapist = therapistName;
    const month = responses[0]?.startingMonth + " " + responses[0]?.startingYear || "N/A";
    responses.slice(0, 3).forEach((response) => {
      response.monthlyGoals.forEach((goalData) => {
        const numberedGoals = goalData.goals
          .map((goal, index) => `${index + 1}) ${goal}`)
          .join("\n\n");
        tableData.push([
          goalData.month,
          goalData.target,
          numberedGoals,
          goalData.performance
            ? goalData.performance.map((perf, index) => `${index + 1}) ${perf}`).join("\n") : "N/A",
          goalData.therapistFeedback || "N/A",
          goalData.doctorFeedback || "N/A",
        ]);
      });
    });

    doc.setFontSize(18);
    doc.text("Individualized Education Program (IEP)", 14, 20);

    doc.setFontSize(12);
    doc.text(`Therapy : ${therapyName}`, 14, 30);
    doc.text(`Therapist : ${therapist}`, 70, 30);
    doc.text(`Month-Year : ${month}`, 140, 30);

    doc.autoTable({
      head: [["Month", "Long-Term Goals", "Short-Term Goals", "Performance", "Therapist Feedback", "Doctor Feedback"]],
      body: tableData,
      startY: 40,
    });

    doc.output("dataurlnewwindow");
  };

  const handleInputChange = (e, monthIndex, goalIndex, field) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedData = { ...prevData };

      if (field === 'goals' && monthIndex !== undefined && goalIndex !== undefined) {
        updatedData.monthlyGoals[monthIndex].goals[goalIndex] = value;
      } else if (field === 'target' && monthIndex !== undefined && goalIndex === null) {
        updatedData.monthlyGoals[monthIndex].target = value;
      } else if (name === 'therapy') {
        updatedData.therapy = value;
      } else if (name === 'startingMonth') {
        const startMonth = parseInt(value);
        updatedData.startingMonth = new Date(0, startMonth - 1).toLocaleString('default', { month: 'long' });
        updatedData.selectedMonths = [
          startMonth,
          (startMonth % 12) + 1,
          ((startMonth + 1) % 12) + 1
        ];
        updatedData.monthlyGoals = updatedData.selectedMonths.map((month) => ({
          month: new Date(0, month - 1).toLocaleString('default', { month: 'long' }),
          target: [''],
          goals: ['']
        }));
        updatedData.selectedMonthsNames = updatedData.selectedMonths.map((month) => new Date(0, month - 1).toLocaleString('default', { month: 'long' }));
      } else if (name === 'year') {
        updatedData.startingYear = value;
      } else if (name === 'feedback') {
        updatedData.feedback = value;
      }
      return updatedData;
    });
  };

  const handleViewPerformance = (response, monthIndex) => {
    const monthDetails = {
      month: response.selectedMonthsNames[monthIndex],
      performance: response.monthlyGoals[monthIndex]?.performance,
      target: response.monthlyGoals[monthIndex]?.target,
      goals: response.monthlyGoals[monthIndex]?.goals,
      therapistFeedback: response.monthlyGoals[monthIndex]?.therapistFeedback
    };

    setDoctorFeedback(response.monthlyGoals[monthIndex].doctorFeedback || '');

    setSelectedMonthDetails(monthDetails);
    setIsModalOpen(true);
  };




  const handleModalOpen = (response, monthIndex) => {
    const isEdit = Boolean(response);
    setIsEditMode(isEdit);
    setSubmitText(isEdit ? 'Update Progress' : 'Assign');

    if (isEdit) {
      setSelectedMonth(monthIndex);
      const editData = JSON.parse(JSON.stringify(response));
      editData.iepId = response._id;
      setFormData(editData);
    } else {
      const initialSelectedMonths = [1, 2, 3];
      setFormData({
        iepId: '',
        doctorId: sessionStorage.getItem("id"),
        therapy: '',
        therapistName: therapistName,
        feedback: '',
        monthlyGoals: initialSelectedMonths.map((month) => ({
          month: new Date(0, month - 1).toLocaleString('default', { month: 'long' }),
          target: [''],
          goals: ['']
        })),
        startingYear: currentYear,
        startingMonth: 1,
        selectedMonths: initialSelectedMonths,
        selectedMonthsNames: initialSelectedMonths.map((month) => new Date(0, month - 1).toLocaleString('default', { month: 'long' }))
      });
      setSelectedMonth(null);
    }
    setShowModal(true);
  };

  const handleModalClose = () => {
    setFormData(null);
    setShowModal(false);
    setIsEditMode(false);
    setSelectedMonth(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`https://testingapi.joywithlearning.com/api/doctor/assignIEP/${sessionStorage.getItem("childId")}`, formData,
        { headers: { Authorization: `${sessionStorage.getItem("logintoken")}` } }
      );
      setShowModal(false);
      toast.success('Data saved successfully', { autoClose: 2000 });
      const response = await axios.get(`https://testingapi.joywithlearning.com/api/caretaker/childIEP/${sessionStorage.getItem("childId")}`,
        { headers: { Authorization: `${sessionStorage.getItem("logintoken")}` } }
      );
      setResponses(response.data);
    } catch (error) {
      toast.error("Error submitting form", { autoClose: 2000 });
    }
  };

  const addGoal = (monthIndex) => {
    if (isEditMode && monthIndex !== selectedMonth) return;

    setFormData((prevData) => {
      const updatedGoals = [...prevData.monthlyGoals];
      updatedGoals[monthIndex].goals.push('');
      return { ...prevData, monthlyGoals: updatedGoals };
    });
  };


  const removeGoal = (monthIndex, goalIndex) => {
    if (isEditMode && monthIndex !== selectedMonth) return;

    setFormData((prevData) => {
      const updatedGoals = [...prevData.monthlyGoals];
      updatedGoals[monthIndex].goals = updatedGoals[monthIndex].goals.filter((_, index) => index !== goalIndex);
      return { ...prevData, monthlyGoals: updatedGoals };
    });
  };

  const handleDoctorFeedback = (e) => {
    setDoctorFeedback(e.target.value);
  }

  const handleFeedback = async () => {
    try {
      const response = await axios.put(`https://testingapi.joywithlearning.com/api/doctor/IEPfeedback/${sessionStorage.getItem("childId")}`, {
        feedback: doctorFeedback,
        month: selectedMonthDetails.month
      },
        { headers: { Authorization: `${sessionStorage.getItem("logintoken")}` } }
      );
      if (response.status === 200) {
        setIsModalOpen(false);
        toast.success('Feedback submitted successfully', { autoClose: 2000 });
        const updatedResponses = await axios.get(
          `https://testingapi.joywithlearning.com/api/caretaker/childIEP/${sessionStorage.getItem("childId")}`,
          { headers: { Authorization: `${sessionStorage.getItem("logintoken")}` } }
        );
        setResponses(updatedResponses.data);
      }
    }
    catch (error) {
      toast.error("Error submitting form", { autoClose: 2000 });
    }
  }


  const renderMonthlyGoals = () => {
    return (formData.selectedMonths ? formData.monthlyGoals : []).map((monthGoal, monthIndex) => {
      if (isEditMode && monthIndex !== selectedMonth) return null;

      const isDisabled = isEditMode && monthIndex !== selectedMonth;

      return (
        <div key={monthIndex} className="card mb-3">
          <div className="card-body">
            <h5 className="mb-3">{monthGoal.month}</h5>
            <h6 className="text-primary">Long-Term Goal</h6>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder={`Long-Term Goal`}
                value={monthGoal.target}
                onChange={(e) => handleInputChange(e, monthIndex, null, 'target')}
                disabled={isDisabled}
              />
            </div>
            <h6 className="text-primary">Short-Term Goals</h6>
            {monthGoal.goals.map((goal, goalIndex) => (
              <div key={goalIndex} className="d-flex align-items-center mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Short-Term Goal ${goalIndex + 1}`}
                  value={goal}
                  onChange={(e) => handleInputChange(e, monthIndex, goalIndex, 'goals')}
                  disabled={isDisabled}
                />
                {!isDisabled && (
                  <button
                    type="button"
                    className="btn btn-outline-danger ms-2 rounded-2"
                    onClick={() => removeGoal(monthIndex, goalIndex)}
                  >
                    x
                  </button>
                )}
              </div>
            ))}

            {!isDisabled && (
              <button
                type="button"
                className="btn btn-outline-success"
                onClick={() => addGoal(monthIndex)}
              >
                Add Goal
              </button>
            )}
          </div>
        </div>
      );

    });
  };

  return (
    <div className="container py-4">
      <ToastContainer />
      <div className='mb-4 d-flex justify-content-around'>
        <div>
          <h1>Individual Education Plan (IEP)</h1>
        </div>
        <button type='button' className='btn btn-success' onClick={() => handleModalOpen(null)}>Assign IEP</button>
        {responses.length > 0 && (
          <button type='button' className="btn btn-primary" onClick={handleViewIEP}>
            IEP Report
          </button>
        )
        }
      </div>
      {loading ? <Loader /> : (
        responses.length === 0 ? <h3>No IEPs assigned</h3> :
          <div className="row g-4">
            {responses.map((response, index) =>
              response.selectedMonthsNames.map((month, idx) => (
                <div className="col-md-4 col-sm-6" key={`response-${idx}`}>
                  <div className="card h-100">
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">IEP {index + 1}</h5>
                      <ul className="d-flex justify-content-around">
                        <h3 key={`month-${index}-${idx}`}>{month}</h3>
                      </ul>
                      <h6 className="text-center">Starting Year: {response.startingYear}</h6>
                      <div className="mt-auto">
                        <div className="d-flex flex-wrap justify-content-between gap-2">
                          <button
                            className="btn btn-primary flex-grow-1"
                            onClick={() => handleModalOpen(response, idx)}
                          >
                            Edit
                          </button>
                          {response.monthlyGoals[idx]?.performance && (
                            <button
                              className="btn btn-success flex-grow-1"
                              onClick={() => handleViewPerformance(response, idx)}
                            >
                              View Performance
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

      )}

      {showModal && formData && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEditMode ? 'Edit IEP Progress' : 'Assign New IEP'}</h5>
                <button type="button" className="btn-close" onClick={handleModalClose}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Therapy Type</label>
                    <input
                      type="text"
                      className="form-control"
                      name="therapy"
                      value={formData.therapy}
                      onChange={handleInputChange}
                      placeholder="Enter therapy type"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Therapist Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="therapistName"
                      value={therapistName}
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Year</label>
                    <select
                      className="form-select"
                      name="year"
                      value={formData.startingYear}
                      onChange={handleInputChange}
                      disabled={isEditMode}
                    >
                      <option value="">Select year</option>
                      <option value={currentYear}>{currentYear}</option>
                      <option value={currentYear + 1}>{currentYear + 1}</option>
                    </select>
                  </div>

                  {!isEditMode && (
                    <div className="mb-3">
                      <label className="form-label">Select Starting Month</label>
                      <select className="form-select" name="startingMonth" value={formData.startingMonth} onChange={(e) => handleInputChange(e)}>
                        <option value="January">Select month</option>
                        {[...Array(12).keys()].map((i) => (
                          <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Long-Term and Short-Term Goals</label>
                    {renderMonthlyGoals()}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Feedback</label>
                    <textarea
                      className="form-control"
                      name="feedback"
                      value={formData.feedback}
                      onChange={handleInputChange}
                      placeholder="Feedback for the month"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">{submitText}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && selectedMonthDetails && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header" >
                <h5 className="modal-title text-truncate"  >
                  Performance for {selectedMonthDetails.month}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="card mb-3">
                  <div className="card-header" style={{ backgroundColor: "blanchedalmond" }}>
                    Long-Term Goal
                  </div>
                  <div className="card-body">
                    <h6 className="card-title text-truncate">{selectedMonthDetails.target}</h6>
                  </div>
                </div>

                <div className="card mb-3">
                  <div className="card-header" style={{ backgroundColor: "blanchedalmond" }}>
                    Short-Term Goals and Performances
                  </div>
                  <div className="card-body">
                    {selectedMonthDetails.goals &&
                      selectedMonthDetails.performance &&
                      selectedMonthDetails.goals.length > 0 ? (
                      <div className="list-group">
                        {selectedMonthDetails.goals.map((goal, index) => (
                          <div
                            key={index}
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center flex-wrap"
                          >
                            <div className="w-100 w-md-auto mb-2 mb-md-0">
                              <h6 className="my-0 text-truncate">Short-Term Goal: {goal}</h6>
                              <small className="text-muted">
                                Performance: {selectedMonthDetails.performance[index] ? (
                                  <p
                                    className={`badge bg-primary rounded-pill fs-6 mt-2`}
                                  >
                                    {selectedMonthDetails.performance[index]}%
                                  </p>
                                )
                                  : (
                                    <small>Performance not given</small>
                                  )
                                }
                              </small>
                            </div>

                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted fst-italic">
                        No goals or performance data available.
                      </p>
                    )}
                  </div>
                </div>

                <div className="card mb-3">
                  <div className="card-header" style={{ backgroundColor: "blanchedalmond" }}>
                    Therapist Feedback
                  </div>
                  <div className="card-body">
                    <p className="text-wrap">{selectedMonthDetails.therapistFeedback || "No feedback available"}</p>
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
                      value={doctorFeedback}
                      onChange={(e) => handleDoctorFeedback(e)}
                      placeholder="Enter feedback based on the child performance"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleFeedback}
                >
                  Submit Feedback
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
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