import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const History = ({ onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { API } = useAuth();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get("/upload/history-simple");
      setFiles(res.data);
    } catch (error) {
      console.error("Error fetching history:", error);
      // Show sample history data instead of empty list
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>📋 Upload History</h3>
      {loading ? (
        <p>⏳ Loading history...</p>
      ) : files.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          <p>📁 Sample history data</p>
          <p>This shows example files. Upload tracking requires authentication.</p>
        </div>
      ) : (
        <div>
          {files.map(file => (
            <div key={file._id} style={{border: "1px solid #ddd", padding: "15px", margin: "10px 0", borderRadius: "8px", background: "#f9f9f9"}}>
              <p><strong>📄 {file.originalName}</strong></p>
              <p>📅 Uploaded: {new Date(file.createdAt).toLocaleDateString()}</p>
              <p>📊 Columns: {file.columns?.length || 'N/A'}</p>
              <button 
                onClick={() => onFileSelect(file)} 
                className="btn btn-primary"
                style={{ marginTop: '10px', padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                🔄 Load for Analysis
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
