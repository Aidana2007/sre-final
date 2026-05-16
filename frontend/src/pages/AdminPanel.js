import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { userService, taskService } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchUsers();
    fetchAllTasks();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const response = await taskService.getTasks();
      setTasks(response.data.tasks);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleAssignTask = (task) => {
    setSelectedTask(task);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await taskService.assignTask(selectedTask._id, selectedUserId);
      toast.success('Task assigned successfully');
      setShowAssignModal(false);
      fetchAllTasks();
    } catch (error) {
      toast.error('Failed to assign task');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Panel</h1>
          <p>Manage users and tasks</p>
        </div>

        <div className="tasks-section" style={{marginBottom: '30px'}}>
          <h2 style={{marginBottom: '20px'}}>User Management</h2>
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{borderBottom: '2px solid #e5e7eb'}}>
                  <th style={{padding: '12px', textAlign: 'left'}}>Username</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>Email</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>Role</th>
                  <th style={{padding: '12px', textAlign: 'left'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} style={{borderBottom: '1px solid #e5e7eb'}}>
                    <td style={{padding: '12px'}}>{user.username}</td>
                    <td style={{padding: '12px'}}>{user.email}</td>
                    <td style={{padding: '12px'}}>
                          {isAdmin ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          style={{padding: '6px', borderRadius: '5px', border: '1px solid #ddd'}}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className="badge badge-status">{user.role}</span>
                      )}
                    </td>
                    <td style={{padding: '12px'}}>
                      {isAdmin && (
                        <button
                          className="btn-small btn-danger"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="tasks-section">
          <h2 style={{marginBottom: '20px'}}>Task Management</h2>
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task._id} className="task-card">
                <div className="task-header">
                  <div>
                    <div className="task-title">{task.title}</div>
                    {task.description && <p style={{color: '#666', marginTop: '5px'}}>{task.description}</p>}
                    <p style={{color: '#999', fontSize: '14px', marginTop: '5px'}}>
                      Assigned to: {task.user?.username || 'Unassigned'}
                    </p>
                  </div>
                </div>
                <div className="task-meta">
                  <span className="badge badge-status">{task.status}</span>
                  <span className={`badge badge-priority-${task.priority}`}>{task.priority}</span>
                </div>
                <div className="task-actions">
                  <button
                    className="btn-small btn-primary"
                    onClick={() => handleAssignTask(task)}
                  >
                    Reassign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showAssignModal && (
          <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Assign Task</h2>
              <p style={{marginBottom: '20px', color: '#666'}}>
                Assign "{selectedTask?.title}" to a user
              </p>
              <form onSubmit={handleAssignSubmit}>
                <div className="form-group">
                  <label>Select User</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    required
                  >
                    <option value="">Choose a user...</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    Assign
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAssignModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPanel;
