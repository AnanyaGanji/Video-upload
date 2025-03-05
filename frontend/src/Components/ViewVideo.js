import React from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./ViewVideo.css";

const ViewVideo = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const videoPath = queryParams.get("video");

  return (
    <div className="video-page">
      <h2>Video Player</h2>
      <video width="500" height="500" controls>
        <source src={`http://localhost:5000${videoPath}`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <button onClick={() => navigate("/videos")}>Back</button>
    </div>
  );
};

export default ViewVideo;
