import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const { API } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, filesRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/files')
      ]);
      setUsers(usersRes.data);
      setFiles(filesRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, isActive) => {
    try {
      await API.put(`/admin/users/${userId}`, { isActive: !isActive });
      fetchData();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await API.delete(`/admin/users/${userId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const deleteFile = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await API.delete(`/admin/files/${fileId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="loading">⏳ Loading admin data...</div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🔧 Admin Management Panel</h1>
        <div className="admin-nav">
          <button 
            className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users ({users.length})
          </button>
          <button 
            className={`nav-btn ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            📁 Files ({files.length})
          </button>
          <button 
            className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-section">
          <h2>👥 User Management</h2>
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p>{users.length}</p>
            </div>
            <div className="stat-card">
              <h3>Active Users</h3>
              <p>{users.filter(u => u.isActive !== false).length}</p>
            </div>
            <div className="stat-card">
              <h3>Admin Users</h3>
              <p>{users.filter(u => u.isAdmin).length}</p>
            </div>
          </div>
          
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                        {user.isAdmin ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isActive !== false ? 'active' : 'inactive'}`}>
                        {user.isActive !== false ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => toggleUserStatus(user._id, user.isActive)}
                          className="btn-toggle"
                        >
                          {user.isActive !== false ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => deleteUser(user._id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div className="admin-section">
          <h2>📁 File Management</h2>
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Total Files</h3>
              <p>{files.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Size</h3>
              <p>{files.reduce((sum, file) => sum + (file.size || 0), 0).toFixed(2)} MB</p>
            </div>
            <div className="stat-card">
              <h3>Recent Uploads</h3>
              <p>{files.filter(f => new Date(f.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
            </div>
          </div>
          
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>User</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Columns</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map(file => (
                  <tr key={file._id}>
                    <td>{file.originalName}</td>
                    <td>{file.userId?.name || 'Unknown'}</td>
                    <td>{(file.size / 1024 / 1024).toFixed(2)} MB</td>
                    <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                    <td>{file.columns?.length || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => deleteFile(file._id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="admin-section">
          <h2>📊 System Analytics</h2>
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>📈 Usage Statistics</h3>
              <ul>
                <li>Total Users: {users.length}</li>
                <li>Total Files: {files.length}</li>
                <li>Average Files per User: {(files.length / users.length).toFixed(1)}</li>
                <li>Most Active User: {users[0]?.name || 'N/A'}</li>
              </ul>
            </div>
            <div className="analytics-card">
              <h3>🗂️ File Types</h3>
              <ul>
                <li>Excel Files: {files.filter(f => f.originalName?.includes('.xlsx') || f.originalName?.includes('.xls')).length}</li>
                <li>CSV Files: {files.filter(f => f.originalName?.includes('.csv')).length}</li>
                <li>Other: {files.filter(f => !f.originalName?.includes('.xlsx') && !f.originalName?.includes('.xls') && !f.originalName?.includes('.csv')).length}</li>
              </ul>
            </div>
            <div className="analytics-card">
              <h3>⏰ Recent Activity</h3>
              <ul>
                <li>Last 24h: {files.filter(f => new Date(f.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length} uploads</li>
                <li>Last 7 days: {files.filter(f => new Date(f.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} uploads</li>
                <li>Last 30 days: {files.filter(f => new Date(f.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} uploads</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
