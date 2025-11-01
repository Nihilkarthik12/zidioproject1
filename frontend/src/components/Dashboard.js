import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ChartComponent from './ChartComponent';
import ThreeChart from './ThreeChart';
import History from './History';
import AdminPanel from './AdminPanel';
import AIInsights from './AIInsights';

function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [isAdmin, setIsAdmin] = useState(false);
  const fileInputRef = useRef(null);
  const { API, user } = useAuth();

  // Check if user is admin
  useEffect(() => {
    if (user && user.isAdmin) {
      setIsAdmin(true);
    }
  }, [user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Temporary: Use simple route for testing
      const response = await API.post('/upload/simple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);
      
      // Transform the data to match ChartComponent expectations
      const transformedData = {
        columns: response.data.columns,
        data: response.data.data.map((row, index) => ({
          row: index + 1,
          values: row.values || row
        }))
      };

      setUploadedData(transformedData);
      setActiveTab('charts');
      alert(`File "${file.name}" uploaded successfully! Data processed: ${response.data.rowCount} rows`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    // Load selected file from history
    setUploadedData({
      columns: file.columns,
      data: file.data.map((row, index) => ({
        row: index + 1,
        values: row.values || row
      }))
    });
    setActiveTab('charts');
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadedData(null);
    setActiveTab('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Excel Data Analysis Dashboard</h1>
        <div className="dashboard-nav">
          <button 
            className={`nav-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            📁 Upload File
          </button>
          <button 
            className={`nav-btn ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => uploadedData && setActiveTab('charts')}
            disabled={!uploadedData}
          >
            📊 Charts
          </button>
          <button 
            className={`nav-btn ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => uploadedData && setActiveTab('ai')}
            disabled={!uploadedData}
          >
            🤖 AI Insights
          </button>
          <button 
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📋 History
          </button>
          {isAdmin && (
            <button 
              className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              🔧 Admin Panel
            </button>
          )}
        </div>
      </div>

      {/* Upload Section */}
      {activeTab === 'upload' && (
        <div className="upload-section">
          <h2>Upload Excel File</h2>
          <div className="upload-area">
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".xlsx,.xls" 
              onChange={handleFileUpload}
              disabled={loading}
            />
            {loading && <p>⏳ Processing file...</p>}
            {selectedFile && !loading && (
              <div className="file-info">
                <p>✅ Selected: {selectedFile.name}</p>
                <button onClick={resetUpload} className="btn-secondary">
                  Upload New File
                </button>
              </div>
            )}
          </div>
          
          <div className="upload-instructions">
            <h3>📋 Instructions:</h3>
            <ul>
              <li>Upload Excel files (.xlsx or .xls)</li>
              <li>First row should contain column headers</li>
              <li>Data will be automatically processed for chart generation</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {activeTab === 'charts' && uploadedData && (
        <div className="charts-section">
          <h2>📊 Data Visualization</h2>
          
          <div className="data-info">
            <h3>📈 Data Overview</h3>
            <p><strong>Columns:</strong> {uploadedData.columns.join(', ')}</p>
            <p><strong>Rows:</strong> {uploadedData.data.length}</p>
            <p><strong>File:</strong> {selectedFile?.name}</p>
          </div>

          <div className="charts-container">
            <div className="chart-section">
              <h3>📊 2D Charts</h3>
              <ChartComponent data={uploadedData} />
            </div>

            <div className="chart-section">
              <h3>🎯 3D Charts</h3>
              <ThreeChart data={uploadedData} />
            </div>
          </div>

          <div className="chart-actions">
            <button onClick={() => setActiveTab('upload')} className="btn-primary">
              Upload New File
            </button>
            <button onClick={() => setActiveTab('history')} className="btn-secondary">
              View History
            </button>
          </div>
        </div>
      )}

      {/* AI Insights Section */}
      {activeTab === 'ai' && uploadedData && (
        <div className="ai-section">
          <h2>🤖 AI-Powered Insights</h2>
          <AIInsights data={uploadedData} />
        </div>
      )}

      {/* History Section */}
      {activeTab === 'history' && (
        <div className="history-section">
          <h2>📋 Upload History</h2>
          <History onFileSelect={handleFileSelect} />
        </div>
      )}

      {/* Admin Panel Section */}
      {activeTab === 'admin' && isAdmin && (
        <div className="admin-section">
          <AdminPanel />
        </div>
      )}

      {/* No data message */}
      {(activeTab === 'charts' || activeTab === 'ai') && !uploadedData && (
        <div className="no-data">
          <h3>📊 No Data Available</h3>
          <p>Please upload an Excel file first to generate charts and insights.</p>
          <button onClick={() => setActiveTab('upload')} className="btn-primary">
            Upload File
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;