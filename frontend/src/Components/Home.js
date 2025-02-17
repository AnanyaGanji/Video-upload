import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; 

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to Video Uploader</h1>
      <p className="home-description">
        Upload and manage videos easily with our platform.
      </p>
      <button className="home-button" onClick={() => navigate("/videos")}>
        View Uploaded Videos
      </button>
      <button className="home-button upload" onClick={() => navigate("/upload")}>
        Upload New Video
      </button>
    </div>
  );
};

export default Home;
