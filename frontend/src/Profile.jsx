import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  // For Editing
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        
        const res = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Format DOB for correct display in HTML Date input
        const profileData = res.data;
        if (profileData.dob) {
          profileData.dob = new Date(profileData.dob).toISOString().split('T')[0];
        }

        setUser(profileData);
        setFormData(profileData);
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    }
  };

  if (!user) return <div style={{color:'white', textAlign:'center', marginTop: '20vh'}}>Loading...</div>;

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h2>{editMode ? 'Edit Profile' : 'User Profile'}</h2>
      
      {error && <div className="error-text" style={{marginBottom: '1rem'}}>{error}</div>}

      {editMode ? (
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input type="text" name="mobile" value={formData.mobile || ''} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="dob" value={formData.dob || ''} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea name="address" rows="2" value={formData.address || ''} onChange={handleChange} required></textarea>
          </div>
          <div className="form-group">
            <label>City</label>
            <select name="city" value={formData.city || ''} onChange={handleChange} required>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>
          <div className="checkbox-group" style={{ marginBottom: '1.5rem' }}>
            <label><input type="radio" name="gender" value="Male" checked={formData.gender === 'Male'} onChange={handleChange}/> Male</label>
            <label><input type="radio" name="gender" value="Female" checked={formData.gender === 'Female'} onChange={handleChange}/> Female</label>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary">Save Changes</button>
            <button type="button" className="btn btn-outline" onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="profile-card">
          <div className="profile-item">
            <span className="profile-label">Name</span>
            <span className="profile-value">{user.name}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Email</span>
            <span className="profile-value">{user.email}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Mobile</span>
            <span className="profile-value">{user.mobile}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">DOB</span>
            <span className="profile-value">{new Date(user.dob).toLocaleDateString()}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">City</span>
            <span className="profile-value">{user.city}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Gender</span>
            <span className="profile-value">{user.gender}</span>
          </div>
          <div className="profile-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
            <span className="profile-label">Hobbies</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {user.hobbies && user.hobbies.length > 0 ? user.hobbies.map((h, i) => (
                <span key={i} style={{ background: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.85rem' }}>{h}</span>
              )) : <span>None</span>}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => setEditMode(true)}>Edit Profile</button>
            <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
