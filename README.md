# Video-upload
Video Frame Extraction Feature

Overview

This project enables video frame extraction from an uploaded video file at regular intervals. The extracted frames can be used for further analysis, such as expression tracking and facial recognition.

Features

Upload a video file and play it within the browser.

Extract frames from the video every second.

Display extracted frames as thumbnails.

Use a hidden canvas to process and convert frames to images.

How It Works

The user uploads a video file.

The video is loaded into an HTML5 <video> element.

A <canvas> element is used to capture frames at 1-second intervals.

Each captured frame is converted into an image format and displayed on the webpage.

Technologies Used

React.js for UI and state management.

HTML5 Video API for video playback.

Canvas API for frame extraction.

JavaScript (ES6+) for processing.
