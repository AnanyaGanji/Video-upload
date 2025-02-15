// import React, { useEffect, useState } from "react";

// const VideoList = () => {
//   const [videos, setVideos] = useState([]);

//   useEffect(() => {
//     fetch("http://localhost:5000/api/videos") // Backend API to get all videos
//       .then((res) => res.json())
//       .then((data) => setVideos(data))
//       .catch((err) => console.error("Error fetching videos:", err));
//   }, []);

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Uploaded Videos</h2>
//       <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "center" }}>
//         <thead>
//           <tr>
//             <th>Admin Name</th>
//             <th>Child Name</th>
//             <th>Video</th>
//             <th>Date</th>
//           </tr>
//         </thead>
//         <tbody>
//           {videos.map((video) => (
//             <tr key={video._id}>
//               <td>{video.adminName}</td>
//               <td>{video.childName}</td>
//               <td>
//                 <video width="200" controls>
//                   <source src={`http://localhost:5000${video.filepath}`} type="video/mp4" />
//                   Your browser does not support the video tag.
//                 </video>
//               </td>
//               <td>{new Date(video.createdAt).toLocaleString()}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default VideoList;
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./VideoList.css"; // ✅ Import CSS for styling

const VideoList = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/videos") // ✅ Ensure your backend route is correct
      .then((response) => {
        setVideos(response.data);
      })
      .catch((error) => {
        console.error("Error fetching videos:", error);
      });
  }, []);

  return (
    <div className="video-container">
      <h2>Uploaded Videos</h2>
      <table className="video-table">
        <thead>
          <tr>
            <th>Admin Name</th>
            <th>Child Name</th>
            <th>Video</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {videos.length > 0 ? (
            videos.map((video) => (
              <tr key={video._id}>
                <td>{video.adminName}</td>
                <td>{video.childName}</td>
                <td>
                  <video width="200" controls>
                    <source src={`http://localhost:5000${video.filepath}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </td>
                <td>{new Date(video.createdAt).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No videos uploaded yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VideoList;
