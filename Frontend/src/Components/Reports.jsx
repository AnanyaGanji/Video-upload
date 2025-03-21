import axios from "axios";
import { useState, useEffect } from "react";
import { Row, Col, Card, Table, Form, Button, Modal } from "react-bootstrap";
import Loader from "./Loader";
import { toast } from "react-toastify";

const Reports = () => {
  const [child, setChild] = useState(sessionStorage.getItem("childId"));
  const [data, setData] = useState([]);
  const [childData, setChildData] = useState({});
  const [games, setGames] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [childFeedback, setChildFeedback] = useState("");
  const [show, setShow] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    if (child) {
      getData();
    }
  }, [child]);

  const getData = async () => {
    try {
      setIsLoading1(true);
      setIsLoading2(true);
      const token = sessionStorage.getItem("logintoken");
      const response = await axios.get(
        `https://testingapi.joywithlearning.com/api/data/${child}/gamesplayed`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setData(response.data);

      const res = await axios.get(`https://testingapi.joywithlearning.com/api/data/${child}`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setChildData(res.data);
      setIsLoading1(false);

      const gamesRes = await axios.get(
        "https://testingapi.joywithlearning.com/api/data/allgames"
      );
      const gameresdata = gamesRes.data;
      setGames(gameresdata);
      setIsLoading2(false);
    } catch (err) {
      setIsLoading1(false);
      setIsLoading2(false);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      const response = await axios.put(
        `https://testingapi.joywithlearning.com/api/data/feedback/${child}`,
        {
          feedback: feedback,
        },
        {
          headers: {
            Authorization: `${sessionStorage.getItem("logintoken")}`,
          },
        }
      );
      setChildFeedback(response.data);
      setFeedback("");
    } catch (error) {
      toast.error("Error submitting feedback!");
    }
  };

  const getGameName = (gameId) => {
    const game = games.find((game) => game.gameId === gameId);
    return game ? game.gamename : "";
  };

  return (
    <div className="p-2" style={{ overflowX: "hidden" }}>
      <Row className="justify-content-center mt-5">
        <Col md={3}>
          <Card className="d-block">
            <Card.Body className="text-center d-flex flex-column justify-content-center align-items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100"
                height="100"
                fill="currentColor"
                className="bi bi-person-circle"
                viewBox="0 0 16 16"
              >
                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                <path
                  fillRule="evenodd"
                  d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                />
              </svg>
              {isLoading1 && (
                <div className="mt-3">
                  {" "}
                  <Loader />
                </div>
              )}
              {!isLoading1 && (
                <div>
                  <Card.Title className="mt-2">{childData.name}</Card.Title>
                  <Card.Text>
                    <strong>Therapist:</strong> {childData.caretakerName}
                    <br />
                    <strong>Parent:</strong> {childData.parentDetails}
                    <br />
                    <strong>Doctor:</strong> {childData.doctorName}
                    <br />
                  </Card.Text>
                </div>
              )}
            </Card.Body>
            <Card.Footer className="text-center">
              <Button variant="primary" onClick={handleShow}>
                Give Feedback
              </Button>

              <Modal
                show={show}
                onHide={handleClose}
                aria-labelledby="contained-modal-title-vcenter"
                keyboard={false}
                backdrop="static"
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title id="contained-modal-title-vcenter">
                    Feedback
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form onSubmit={handleSubmitFeedback}>
                    <Form.Group>
                      <Form.Control
                        as="textarea"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Enter your feedback"
                        required
                        rows={3}
                      />
                    </Form.Group>
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>
                    Close
                  </Button>
                  <Button variant="success">Submit</Button>
                </Modal.Footer>
              </Modal>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={7}>
          <Card className="d-block">
            <Card.Header className="fw-bold">Recent Actions</Card.Header>
            <Table hover>
              <thead>
                <tr className="text-center">
                  <th>Game Name</th>
                  <th>Tries</th>
                  <th>Timer(Seconds)</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <div className="d-flex justify-content-center align-items-center">
                {isLoading2 && (
                  <div className="mt-3">
                    {" "}
                    <Loader />
                  </div>
                )}
              </div>
              {!isLoading2 && (
                <tbody>
                  {data.length > 0 ? (
                    data.map((action, index) => (
                      <tr className="text-center" key={index}>
                        <td>{getGameName(action.gameId)}</td>
                        <td>{action.tries}</td>
                        <td>{action.timer}</td>
                        <td>{action.status ? "Yes" : "No"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No games played
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </Table>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;
