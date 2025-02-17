// // // import React, { useState, useRef } from "react";
// // // import axios from "axios";

// // // const VideoUploader = () => {
// // //   const [selectedFile, setSelectedFile] = useState(null);
// // //   const [videoURL, setVideoURL] = useState("");
// // //   const [analysisResults, setAnalysisResults] = useState([]);
// // //   const [childName, setChildName] = useState(""); // ✅ New state for child name
// // //   const [adminName, setAdminName] = useState(""); // ✅ New state for admin name
// // //   const videoRef = useRef(null);

// // //   const handleFileChange = (event) => {
// // //     const file = event.target.files[0];
// // //     setSelectedFile(file);
// // //     setVideoURL(URL.createObjectURL(file)); // Create a preview URL
// // //   };

// // //   const handleUpload = async () => {
// // //     if (!selectedFile || !childName || !adminName) {
// // //       return alert("Please select a file and enter both names.");
// // //     }

// // //     const formData = new FormData();
// // //     formData.append("video", selectedFile);
// // //     formData.append("childName", childName); // ✅ Send child name
// // //     formData.append("adminName", adminName); // ✅ Send admin name
// // //     const username = localStorage.getItem("username");
// // //     formData.append("email", username); // ✅ Required for admin email

// // //     try {
// // //       const response = await axios.post("http://localhost:5000/api/upload", formData, {
// // //         headers: { "Content-Type": "multipart/form-data" },
// // //       });
// // //       alert("Uploaded to uploads folder successfully");
// // //       console.log("Upload successful:", response.data);
// // //     } catch (error) {
// // //       console.error("Upload failed:", error);
// // //     }
// // //   };



  

// // //   return (
// // //     <div>
// // //       <h2>Upload and Analyze Video</h2>

// // //       <label>Child's Name:</label>
// // //       <input
// // //         type="text"
// // //         value={childName}
// // //         onChange={(e) => setChildName(e.target.value)}
// // //         placeholder="Enter child's name"
// // //       />

// // //       <label>Admin Name:</label>
// // //       <input
// // //         type="text"
// // //         value={adminName}
// // //         onChange={(e) => setAdminName(e.target.value)}
// // //         placeholder="Enter admin name"
// // //       />

// // //       <input type="file" onChange={handleFileChange} accept="video/*" />
// // //       <button onClick={handleUpload}>Upload Video</button>

      

      
// // //     </div>
// // //   );
// // // };

// // // export default VideoUploader;
// // import React, { useState, useRef } from "react";
// // import axios from "axios";
// // import "./VideoUploader.css"; // ✅ Import the CSS file

// // const VideoUploader = () => {
// //   const [selectedFile, setSelectedFile] = useState(null);
// //   const [videoURL, setVideoURL] = useState("");
// //   const [analysisResults, setAnalysisResults] = useState([]);
// //   const [childName, setChildName] = useState("");
// //   const [adminName, setAdminName] = useState("");
// //   const videoRef = useRef(null);

// //   const handleFileChange = (event) => {
// //     const file = event.target.files[0];
// //     setSelectedFile(file);
// //     setVideoURL(URL.createObjectURL(file));
// //   };

// //   const handleUpload = async () => {
// //     if (!selectedFile || !childName || !adminName) {
// //       return alert("Please enter both names and select a file.");
// //     }

// //     const formData = new FormData();
// //     formData.append("video", selectedFile);
// //     formData.append("childName", childName);
// //     formData.append("adminName", adminName);
// //     const username = localStorage.getItem("username");
// //     formData.append("email", username);

// //     try {
// //       const response = await axios.post("http://localhost:5000/api/upload", formData, {
// //         headers: { "Content-Type": "multipart/form-data" },
// //       });
// //       alert("Uploaded successfully!");
// //       console.log("Upload successful:", response.data);
// //     } catch (error) {
// //       console.error("Upload failed:", error);
// //     }
// //   };

  
// //   return (
// //     <div className="video-uploader-container">
// //       <h2>Upload video</h2>

// //       <label className="label">Admin Name:</label>
// //       <input
// //         type="text"
// //         className="input-field"
// //         value={adminName}
// //         onChange={(e) => setAdminName(e.target.value)}
// //         placeholder="Enter admin name"
// //       />

// //       <label className="label">Child's Name:</label>
// //       <input
// //         type="text"
// //         className="input-field"
// //         value={childName}
// //         onChange={(e) => setChildName(e.target.value)}
// //         placeholder="Enter child's name"
// //       />

// //       <input type="file" onChange={handleFileChange} accept="video/*" className="input-field" />
// //       <button onClick={handleUpload} className="upload-btn">Upload Video</button>

// //       {videoURL && (
// //         <div className="video-preview">
// //           <video ref={videoRef} src={videoURL} controls></video>
// //         </div>
// //       )}

      
// //     </div>
// //   );
// // };

// // export default VideoUploader;
// import React, { useState, useRef } from "react";
// import axios from "axios";
// import "./VideoUploader.css";

// const VideoUploader = () => {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [videoURL, setVideoURL] = useState("");
//   const [childName, setChildName] = useState("");
//   const [adminName, setAdminName] = useState("");
//   const videoRef = useRef(null);

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     setSelectedFile(file);
//     setVideoURL(URL.createObjectURL(file));
//   };

//   const handleUpload = async () => {
//     if (!selectedFile || !childName || !adminName) {
//       return alert("Please enter both names and select a file.");
//     }

//     const formData = new FormData();
//     formData.append("video", selectedFile);
//     formData.append("childName", childName);
//     formData.append("adminName", adminName);
//     const username = localStorage.getItem("username");
//     formData.append("email", username);

//     try {
//       const response = await axios.post("http://localhost:5000/api/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       alert("Uploaded successfully!");
//       console.log("Upload successful:", response.data);
//     } catch (error) {
//       console.error("Upload failed:", error);
//     }
//   };

//   return (
//     <div className="video-uploader-container">
//       <h2>Upload video</h2>

//       <label className="label">Admin Name:</label>
//       <input
//         type="text"
//         className="input-field"
//         value={adminName}
//         onChange={(e) => setAdminName(e.target.value)}
//         placeholder="Enter admin name"
//       />

//       <label className="label">Child's Name:</label>
//       <input
//         type="text"
//         className="input-field"
//         value={childName}
//         onChange={(e) => setChildName(e.target.value)}
//         placeholder="Enter child's name"
//       />

//       <input type="file" onChange={handleFileChange} accept="video/*" className="input-field" />
//       <button onClick={handleUpload} className="upload-btn">Upload Video</button>

//       {videoURL && (
//         <div className="video-preview">
//           <video ref={videoRef} src={videoURL} controls></video>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoUploader;
import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // For navigation

import "./VideoUploader.css"; // Import CSS file

const VideoUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoURL, setVideoURL] = useState("");
  const [childName, setChildName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const videoRef = useRef(null);
  const navigate = useNavigate(); // For navigation

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setVideoURL(URL.createObjectURL(file)); // Preview video
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile || !childName || !adminName || !adminEmail) {
      return alert("Please enter both names and select a file.");
    }

    const formData = new FormData();
    formData.append("video", selectedFile);
    formData.append("childName", childName);
    formData.append("adminName", adminName);
    formData.append("adminEmail", adminEmail);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("Uploaded successfully!");
      console.log("Upload successful:", response.data);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Remove stored token (if using JWT)
    sessionStorage.clear(); // Clears session data
    navigate("/"); // Redirect to login page
  };

  return (
    <div className="video-uploader-container">
      <h2>Upload Video</h2>

      {/* Admin Name Input */}
      <label className="label">Admin Name:</label>
      <input
        type="text"
        className="input-field"
        value={adminName}
        onChange={(e) => setAdminName(e.target.value)}
        placeholder="Enter admin name"
      />

      {/* Admin Email Input */}
      <label className="label">Admin Email:</label>
      <input
        type="text"
        className="input-field"
        value={adminEmail}
        onChange={(e) => setAdminEmail(e.target.value)}
        placeholder="Enter admin email"
      />

      {/* Child Name Input */}
      <label className="label">Child's Name:</label>
      <input
        type="text"
        className="input-field"
        value={childName}
        onChange={(e) => setChildName(e.target.value)}
        placeholder="Enter child's name"
      />

      {/* File Input */}
      <input
        type="file"
        onChange={handleFileChange}
        accept="video/*"
        className="input-field"
      />
      <button onClick={handleUpload} className="upload-btn">
        Upload Video
      </button>

      {/* Video Preview */}
      {videoURL && (
        <div className="video-preview">
          <video ref={videoRef} src={videoURL} controls></video>
        </div>
      )}
      <button onClick={handleLogout} className="logout-btn">Logout</button>

    </div>
  );
};

export default VideoUploader;
