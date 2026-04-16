import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    dob: '',
    address: '',
    city: '',
    gender: '',
    hobbies: []
  });
  const [showOtherHobby, setShowOtherHobby] = useState(false);
  const [otherHobbyText, setOtherHobbyText] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (value === 'Other') {
      setShowOtherHobby(checked);
      if (!checked) setOtherHobbyText('');
      return;
    }
    
    let updatedHobbies = [...formData.hobbies];
    if (checked) {
      updatedHobbies.push(value);
    } else {
      updatedHobbies = updatedHobbies.filter((h) => h !== value);
    }
    setFormData({ ...formData, hobbies: updatedHobbies });
  };

  const validateLocal = () => {
    const nameRegex = /^[A-Za-z ]+$/;
    if (!nameRegex.test(formData.name)) return 'Name allows only alphabets and spaces.';
    
    const mobileRegex = /^[6-9][0-9]{9}$/;
    if (!mobileRegex.test(formData.mobile)) return 'Mobile must be 10 digits starting with 6, 7, 8, or 9.';
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(formData.email)) return 'Only Gmail addresses allowed.';
    
    const passRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[#@$]).{8,}$/;
    if (!passRegex.test(formData.password)) return 'Password must be min 8 chars, 1 capital, 1 digit, 1 special (#, @, or $).';
    
    const dob = new Date(formData.dob);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18 || age > 60) return 'You must be between 18 and 60 years old.';
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errMsg = validateLocal();
    if (errMsg) return setError(errMsg);

    let finalHobbies = [...formData.hobbies];
    if (showOtherHobby && otherHobbyText.trim() !== '') {
      finalHobbies.push(otherHobbyText.trim());
    }

    try {
      const payload = { ...formData, hobbies: finalHobbies };
      const res = await axios.post('http://localhost:5000/api/register', payload);
      localStorage.setItem('token', res.data.token);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '650px', margin: '3rem auto' }}>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email (Gmail only)</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>City</label>
            <select name="city" value={formData.city} onChange={handleChange} required>
              <option value="">Select City</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label>Address</label>
          <textarea name="address" rows="2" value={formData.address} onChange={handleChange} required></textarea>
        </div>

        <div className="form-group">
          <label>Gender</label>
          <div className="checkbox-group">
            <label><input type="radio" name="gender" value="Male" onChange={handleChange} required/> Male</label>
            <label><input type="radio" name="gender" value="Female" onChange={handleChange} required/> Female</label>
          </div>
        </div>

        <div className="form-group">
          <label>Hobbies</label>
          <div className="checkbox-group">
            <label><input type="checkbox" value="Singing" onChange={handleCheckboxChange} /> Singing</label>
            <label><input type="checkbox" value="Drawing" onChange={handleCheckboxChange} /> Drawing</label>
            <label><input type="checkbox" value="Other" onChange={handleCheckboxChange} /> Other</label>
          </div>
          {showOtherHobby && (
            <input 
              type="text" 
              placeholder="Specify other hobby" 
              style={{ marginTop: '0.8rem' }}
              value={otherHobbyText}
              onChange={(e) => setOtherHobbyText(e.target.value)} 
            />
          )}
        </div>

        {error && <div className="error-text" style={{marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
        
        <button type="submit" className="btn btn-primary">Register Now</button>
      </form>
      <div className="switch-link">
        Already have an account? <Link to="/login">Login here</Link>
      </div>
    </div>
  );
};

export default Register;
