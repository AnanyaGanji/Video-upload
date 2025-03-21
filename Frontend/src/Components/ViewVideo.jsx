import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Container, Card } from "react-bootstrap";

export default function ViewVideos() {
  const location = useLocation();
  const { childDetails } = location.state || {};
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (childDetails) {
      getVideos(childDetails._id);
    }
  }, [childDetails]);
  
  const getVideos = async (childId) => {
    if (!childId) return;
    try {
      const token = sessionStorage.getItem("logintoken");
      const response = await axios.get(
        `http://localhost:4001/api/caretaker/getVideos/${childId}`,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error.response ? error.response.data : error.message);
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Uploaded Videos</h1>
      {videos.length === 0 ? (
        <p className="text-center">No videos uploaded.</p>
      ) : (
        <div className="row">
            {console.log(videos)}
          {videos.map((video, index) => (
            <div key={index} className="col-md-4 mb-4">
              <Card className="shadow-sm">
                <Card.Body className="text-center">
                  <video controls className="w-100">
                    <source src={`http://localhost:4001/${video.videoPath.replace(/\\/g, "/")}`} type="video/mp4" />
                  </video>
                  {/* <p className="mt-2">{console.log(video.description)}</p> */}
                  <p className="text-muted">
                    <strong>Uploaded on: </strong>{new Date(video.uploadedAt).toLocaleString()}
                    <br></br>
                    <strong>Description:</strong> {video.description}
                  </p>
                  
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
