import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import ButtonComponent from "./Components/Home"; 
import VideoUploader from "./Components/VideoUploader"; 
import VideoList from "./Components/VideoList"; 
import ViewVideo from "./Components/ViewVideo";

function App() {
  return (
    <Router> 
      <Routes> 
        <Route path="/" element={<ButtonComponent />} />
        <Route path="/upload" element={<VideoUploader />} />
        <Route path="/videos" element={<VideoList />} /> 
        <Route path="/view-video" element={<ViewVideo/>} />
      </Routes>
    </Router>
  );
}

export default App;
