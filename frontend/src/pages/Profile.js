import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await userService.updateProfile(formData);
      toast.success('Profile updated successfully');
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="dashboard-header">
          <h1>Profile Settings</h1>
          <p>Manage your account information</p>
        </div>

        <div className="tasks-section" style={{maxWidth: '600px', margin: '0 auto'}}>
          <h2 style={{marginBottom: '20px'}}>Account Information</h2>
          <div style={{marginBottom: '30px'}}>
            <p style={{color: '#666', marginBottom: '10px'}}>
              <strong>Role:</strong> {user?.role}
            </p>
            
            <p style={{color: '#666'}}>
              <strong>Member Since:</strong> {new Date(user?.createdAt).toLocaleDateString()}
            </p>
          </div>

          <h2 style={{marginBottom: '20px'}}>Update Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength="3"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Profile;
