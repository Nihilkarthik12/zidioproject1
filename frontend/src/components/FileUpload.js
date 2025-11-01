import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const FileUpload = ({ onFileProcessed }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { API } = useAuth();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      console.log("Upload response:", res.data);
      onFileProcessed(res.data);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = "Upload failed: ";
      
      if (error.response) {
        // Server responded with error status
        errorMessage += error.response.data?.message || `Server error (${error.response.status})`;
      } else if (error.request) {
        // Request made but no response (network error)
        errorMessage += "Network Error - Cannot reach server. Please check if backend is running on port 5000.";
      } else {
        // Something else happened
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h3>Upload Excel File</h3>
      <form onSubmit={handleUpload}>
        <div className="form-group">
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            onChange={(e) => setFile(e.target.files[0])} 
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload & Analyze"}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;
