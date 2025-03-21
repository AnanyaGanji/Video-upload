// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const UploadVideo = ({ childDetails }) => {
//     const [video, setVideo] = useState(null);
//     const [description, setDescription] = useState('');
//     const [childDetails, setChildDetails] = useState(null);
    
//     const [videos, setVideos] = useState([]);
//     const navigate = useNavigate();

//     const handleUpload = async (file, childId) => {
//         if (!file || !childId) {
//             console.error("File or child ID is missing");
//             return;
//         }
    
//         const formData = new FormData();
//         formData.append("video", file);
//         formData.append("description", description);
    
//         try {
//           const token = sessionStorage.getItem("logintoken");
  
//             const response = await axios.post(
//                 `http://localhost:4001/api/caretaker/uploadVideo/${childId}`,
//                 formData,
//                 {
//                   headers: {
//                     Authorization: `${token}`,
//                   },
//                 }
//             );
//             console.log("Upload successful:", response.data);
//             setVideos([...videos, response.data]); // Update UI
//         } catch (error) {
//             console.error("Upload error:", error.response ? error.response.data : error.message);
//         }
//     };
    
  
//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//         setVideo(file);
//     }
//   };

//     return (
//         <div>
//             <h3>Upload Video</h3>
//                 <input type="file" accept="video/*" onChange={handleFileChange} />
//                 <input type="text" placeholder="Enter description" value={description} onChange={(e) => setDescription(e.target.value)} />
//                 <button onClick={() => handleUpload(video, childDetails._id)}>Upload</button>
     
//         </div>
//     );
// };

// export default UploadVideo;
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// toast.configure();

const UploadVideo = () => {
    const location = useLocation();
    const childDetails = location.state?.childDetails; // Extract passed data

    const [video, setVideo] = useState(null);
    const [description, setDescription] = useState('');
    const [videos, setVideos] = useState([]);
    const navigate = useNavigate();

    const handleUpload = async (file, childId) => {
        if (!file || !childId) {
            console.error("File or child ID is missing");
            return;
        }
    
        const formData = new FormData();
        formData.append("video", file);
        formData.append("description", description);
    
        try {
            const token = sessionStorage.getItem("logintoken");
            const response = await axios.post(
                `http://localhost:4001/api/caretaker/uploadVideo/${childId}`,
                formData,
                {
                    headers: { Authorization: `${token}` },
                }
            );
            console.log("Upload successful:", response.data);
            setVideos([...videos, response.data]); // Update UI

            console.log("Upload response:", response); // Debugging

        // Adjust condition based on actual API response
        if (response?.status === 200 || response?.success) {  
            alert("Video uploaded successfully!");
        } else {
            alert("Failed to upload video. Please try again.");
        }
            // toast.success("Video uploaded successfully!", {
            //     position: "top-right",
            //     autoClose: 3000, // Closes after 3 seconds
            //     hideProgressBar: false,
            //     closeOnClick: true,
            //     pauseOnHover: true,
            //     draggable: true,
            //     progress: undefined,
            //     theme: "light", // Change theme if needed
            // });

        } catch (error) {
            console.error("Upload error:", error.response ? error.response.data : error.message);
            // toast.error("Upload failed. Please try again.", {
            //     position: "top-right",
            //     autoClose: 3000,
            //     hideProgressBar: false,
            //     closeOnClick: true,
            //     pauseOnHover: true,
            //     draggable: true,
            //     progress: undefined,
            //     theme: "light",
            // });        
            }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setVideo(file);
        }
    };

    return (
        // <div>
        //     <h3>Upload Video for {childDetails?.name}</h3>
        //     <input type="file" accept="video/*" onChange={handleFileChange} />
        //     <input 
        //         type="text" 
        //         placeholder="Enter description" 
        //         value={description} 
        //         onChange={(e) => setDescription(e.target.value)} 
        //     />
        //     <button onClick={() => handleUpload(video, childDetails?._id)}>Upload</button>
        // </div>
        <div className="container mt-4 d-flex justify-content-center">
    <div className="card shadow p-4" style={{ width: "500px", borderRadius: "15px" }}>
        <h3 className="text-center mb-3">Upload Video for {childDetails?.name}</h3>

        {/* Video Upload Input */}
        <input type="file" accept="video/*" className="form-control mb-3" onChange={handleFileChange} />

        {/* Description Input */}
        <input 
            type="text" 
            className="form-control mb-3" 
            placeholder="Enter description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
        />

        {/* Upload Button */}
        <button className="btn btn-primary w-100" onClick={() => handleUpload(video, childDetails?._id)}>
            Upload
        </button>
    </div>
</div>

    );
};

export default UploadVideo;
