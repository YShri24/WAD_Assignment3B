const mongoose = require('mongoose');

const ageValidator = function (value) {
  const dob = new Date(value);
  const today = new Date();
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age >= 18 && age <= 60;
};

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    match: [/^[A-Za-z ]+$/, 'Only alphabets and spaces allowed']
  },
  mobile: {
    type: String,
    required: true,
    match: [/^[6-9][0-9]{9}$/, 'Must be 10 digits and start with 6, 7, 8, or 9']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Only Gmail addresses allowed']
  },
  password: {
    type: String,
    required: true,
    // Password regex validation is generally handled at route level before hashing,
    // or we can add it here but it gets complicated once hashed.
  },
  dob: {
    type: Date,
    required: true,
    validate: [ageValidator, 'You must be between 18 and 60 years old']
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    enum: ['Pune', 'Mumbai', 'Delhi'],
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  hobbies: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('User', UserSchema);
