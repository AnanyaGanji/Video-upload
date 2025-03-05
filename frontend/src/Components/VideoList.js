import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./VideoList.css";

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedChildren, setExpandedChildren] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/videos")
      .then((response) => {
        setVideos(response.data);
      })
      .catch((error) => {
        console.error("Error fetching videos:", error);
      });
  }, []);

  const groupedVideos = videos.reduce((acc, video) => {
    const key = `${video.adminName}-${video.childName}`;
    if (!acc[key]) {
      acc[key] = {
        adminName: video.adminName,
        adminEmail: video.adminEmail,
        childName: video.childName,
        videos: [],
      };
    }
    acc[key].videos.push(video);
    return acc;
  }, {});

  const toggleChild = (key) => {
    setExpandedChildren((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const viewVideoPage = (videoPath) => {
    navigate(`/view-video?video=${encodeURIComponent(videoPath)}`);
  };

  return (
    <div className="video-container">
      <h2>Uploaded Videos</h2>

      <input
        type="text"
        placeholder="Search by Admin Name or Email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />

      <table className="video-table">
        <thead>
          <tr>
            <th>Child</th>
            <th>Admin Email</th>
            <th>Admin Name</th>
            <th>Videos</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedVideos).length > 0 ? (
            Object.entries(groupedVideos)
              .filter(
                ([key, admin]) =>
                  admin.adminName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  admin.adminEmail
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
              )
              .map(([key, admin]) => (
                <React.Fragment key={key}>
                  <tr>
                    <td>{admin.childName}</td>
                    <td>{admin.adminEmail}</td>
                    <td>{admin.adminName}</td>
                    <td>
                      <button
                        onClick={() => toggleChild(key)}
                        className="dropdown-btn"
                      >
                        {expandedChildren[key]
                          ? "▲ Hide Videos"
                          : "▼ Show Videos"}
                      </button>
                    </td>
                  </tr>
                  {expandedChildren[key] &&
                    admin.videos.map((video) => (
                      <tr key={video._id} className="video-row">
                        <td colSpan="3">
                          Video from{" "}
                          {new Date(video.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <button
                            onClick={() => openVideoModal(video)}
                            className="view-video-btn"
                          >
                            View Video
                          </button>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))
          ) : (
            <tr>
              <td colSpan="4">No videos uploaded yet.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Video Preview Modal */}
      {selectedVideo && (
        <div className="modal-overlay" onClick={closeVideoModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={closeVideoModal}>
              &times;
            </span>
            <h3>Video Preview</h3>

            {/* Video Element for Dynamic Thumbnail */}
            <video
              src={`http://localhost:5000${selectedVideo.filepath}`}
              className="video-preview"
              preload="metadata"
              width="300"
              height="200"
              onClick={() => viewVideoPage(selectedVideo.filepath)}
            >
              Your browser does not support the video tag.
            </video>

            <p>Click the video to watch</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoList;
