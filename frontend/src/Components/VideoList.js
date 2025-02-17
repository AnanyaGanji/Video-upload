// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./VideoList.css"; // Import CSS for styling

// const VideoList = () => {
//   const [videos, setVideos] = useState([]);
//   const [searchQuery, setSearchQuery] = useState(""); // State for search input

//   useEffect(() => {
//     axios
//       .get("http://localhost:5000/api/videos")
//       .then((response) => {
//         setVideos(response.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching videos:", error);
//       });
//   }, []);

//   // Function to filter videos based on search query
//   const filteredVideos = videos.filter(
//     (video) =>
//       video.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       video.adminName.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="video-container">
//       <h2>Uploaded Videos</h2>

//       {/* Search Bar */}
//       <input
//         type="text"
//         placeholder="Search by Child Name or Admin Name..."
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         className="search-bar"
//       />

//       <table className="video-table">
//         <thead>
//           <tr>
//             <th>Admin Name</th>
//             <th>Admin Email</th>
//             <th>Child Name</th>
//             <th>Video</th>
//             <th>Date</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredVideos.length > 0 ? (
//             filteredVideos.map((video) => (
//               <tr key={video._id}>
//                 <td>{video.adminName}</td>
//                 <td>{video.adminEmail}</td>
//                 <td>{video.childName}</td>
//                 <td>
//                   <video width="200" controls>
//                     <source
//                       src={`http://localhost:5000${video.filepath}`}
//                       type="video/mp4"
//                     />
//                     Your browser does not support the video tag.
//                   </video>
//                 </td>
//                 <td>{new Date(video.createdAt).toLocaleString()}</td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="5">No videos uploaded yet.</td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default VideoList;
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom"; // For navigation
// import "./VideoList.css"; // Import CSS for styling
// const VideoList = () => {
//   const [videos, setVideos] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [expandedAdmins, setExpandedAdmins] = useState({}); // Track expanded admins
//   const [expandedChildren, setExpandedChildren] = useState({}); // Track expanded children

//   const navigate = useNavigate(); // For navigation

//   useEffect(() => {
//     axios
//       .get("http://localhost:5000/api/videos")
//       .then((response) => {
//         setVideos(response.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching videos:", error);
//       });
//   }, []);

//   // Group videos by adminEmail
//   const groupedVideos = videos.reduce((acc, video) => {
//     if (!acc[video.adminEmail]) {
//       acc[video.adminEmail] = {
//         adminName: video.adminName,
//         email: video.adminEmail,
//         children: {},
//       };
//     }

//     if (!acc[video.adminEmail].children[video.childName]) {
//       acc[video.adminEmail].children[video.childName] = [];
//     }

//     acc[video.adminEmail].children[video.childName].push(video);

//     return acc;
//   }, {});

//   // Function to toggle admin dropdown
//   const toggleAdmin = (email) => {
//     setExpandedAdmins((prev) => ({
//       ...prev,
//       [email]: !prev[email],
//     }));
//   };

//   // Function to toggle child dropdown
//   const toggleChild = (email, child) => {
//     setExpandedChildren((prev) => ({
//       ...prev,
//       [`${email}-${child}`]: !prev[`${email}-${child}`],
//     }));
//   };

//   // Function to handle video navigation
//   const viewVideo = (videoPath) => {
//     navigate(`/view-video?video=${encodeURIComponent(videoPath)}`);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("authToken"); // Remove stored token (if using JWT)
//     sessionStorage.clear(); // Clears session data
//     navigate("/"); // Redirect to login page
//   };

//   return (
//     <div className="video-container">
//       <h2>Uploaded Videos</h2>

//       {/* Search Bar */}
//       <input
//         type="text"
//         placeholder="Search by Admin email or Admin Name..."
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         className="search-bar"
//       />

//       <table className="video-table">
//         <thead>
//           <tr>
//             <th>Admin Name</th>
//             <th>Admin Email</th>
//             <th>Children</th>
//           </tr>
//         </thead>
//         <tbody>
//           {Object.keys(groupedVideos).length > 0 ? (
//             Object.entries(groupedVideos)
//               .filter(([email, admin]) =>
//                 admin.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                 email.toLowerCase().includes(searchQuery.toLowerCase())
//               )
//               .map(([email, admin]) => (
//                 <React.Fragment key={email}>
//                   <tr>
//                     <td>{admin.adminName}</td>
//                     <td>{admin.email}</td>
//                     <td>
//                       <button onClick={() => toggleAdmin(email)} className="dropdown-btn">
//                         {expandedAdmins[email] ? "▲ Hide Children" : "▼ Show Children"}
//                       </button>
//                     </td>
//                   </tr>
//                   {expandedAdmins[email] &&
//                     Object.entries(admin.children).map(([child, videos]) => (
//                       <React.Fragment key={child}>
//                         <tr className="child-row">
//                           <td colSpan="2">{child}</td>
//                           <td>
//                             <button
//                               onClick={() => toggleChild(email, child)}
//                               className="dropdown-btn"
//                             >
//                               {expandedChildren[`${email}-${child}`] ? "▲ Hide Videos" : "▼ Show Videos"}
//                             </button>
//                           </td>
//                         </tr>
//                         {expandedChildren[`${email}-${child}`] &&
//                           videos.map((video) => (
//                             <tr key={video._id} className="video-row">
//                               <td colSpan="2">Video from {new Date(video.createdAt).toLocaleString()}</td>
//                               <td>
//                                 <button
//                                   onClick={() => viewVideo(video.filepath)}
//                                   className="view-video-btn"
//                                 >
//                                   View Video
//                                 </button>
//                               </td>
//                             </tr>
//                           ))}
//                       </React.Fragment>
//                     ))}
//                 </React.Fragment>
//               ))
//           ) : (
//             <tr>
//               <td colSpan="3">No videos uploaded yet.</td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//       <button onClick={handleLogout} className="logout-btn">Logout</button>

//     </div>
//   );
// };

// export default VideoList;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // For navigation
import "./VideoList.css"; // Import CSS for styling

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAdmins, setExpandedAdmins] = useState({});
  const [expandedChildren, setExpandedChildren] = useState({});

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

  // Group videos by adminName & childName
  const groupedVideos = videos.reduce((acc, video) => {
    const key = `${video.adminName}-${video.childName}`;

    if (!acc[key]) {
      acc[key] = {
        adminName: video.adminName,
        adminEmail: video.adminEmail,
        childName: video.childName,
        students: new Set(), // Store unique students
        videos: [],
      };
    }

    acc[key].videos.push(video);
    acc[key].students.add(video.studentName); // Assuming `studentName` exists in video object

    return acc;
  }, {});

  // Convert students Set to an array
  Object.keys(groupedVideos).forEach((key) => {
    groupedVideos[key].students = Array.from(groupedVideos[key].students);
  });

  // Function to toggle admin dropdown
  const toggleAdmin = (key) => {
    setExpandedAdmins((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Function to toggle child dropdown
  const toggleChild = (key) => {
    setExpandedChildren((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Function to handle video navigation
  const viewVideo = (videoPath) => {
    navigate(`/view-video?video=${encodeURIComponent(videoPath)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Remove stored token (if using JWT)
    sessionStorage.clear(); // Clears session data
    navigate("/"); // Redirect to login page
  };

  return (
    <div className="video-container">
      <h2>Uploaded Videos</h2>

      {/* Search Bar */}
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
            <th>Admin Name</th>
            <th>Admin Email</th>
            <th>Child</th>
            <th>Videos</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedVideos).length > 0 ? (
            Object.entries(groupedVideos)
              .filter(([key, admin]) =>
                admin.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                admin.adminEmail.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(([key, admin]) => (
                <React.Fragment key={key}>
                  <tr>
                    <td>{admin.adminName}</td>
                    <td>{admin.adminEmail}</td>
                    <td>{admin.childName}</td>
                    <td>
                      <button onClick={() => toggleChild(key)} className="dropdown-btn">
                        {expandedChildren[key] ? "▲ Hide Videos" : "▼ Show Videos"}
                      </button>
                    </td>
                  </tr>
                  {expandedChildren[key] &&
                    admin.videos.map((video) => (
                      <tr key={video._id} className="video-row">
                        <td colSpan="3">Video from {new Date(video.createdAt).toLocaleString()}</td>
                        <td>
                          <button
                            onClick={() => viewVideo(video.filepath)}
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

      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </div>
  );
};

export default VideoList;
