import React from "react";
import { useLocation } from "react-router-dom";

const ViewVideo = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const videoPath = queryParams.get("video");

  return (
    <div className="video-page">
      <h2>Video Player</h2>
      <video width="600" controls>
        <source src={`http://localhost:5000${videoPath}`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default ViewVideo;
