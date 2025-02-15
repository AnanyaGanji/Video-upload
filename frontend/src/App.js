import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import ButtonComponent from "./Components/Home"; 
import VideoUploader from "./Components/VideoUploader"; 
import VideoList from "./Components/VideoList"; // ✅ Ensure correct import

function App() {
  return (
    <Router> 
      <Routes> 
        <Route path="/" element={<ButtonComponent />} />
        <Route path="/upload" element={<VideoUploader />} />
        <Route path="/videos" element={<VideoList />} /> {/* ✅ Fix missing route */}
      </Routes>
    </Router>
  );
}

export default App;
