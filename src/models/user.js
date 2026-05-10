import mongoose from "mongoose";

// Define the user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  address: String,
  nameLocked: {
    type: Boolean,
    default: false,
  },

  nameLockedAt: {
    type: Date,
  },

  nameHistory: [
    {
      name: String,
      changedAt: Date,
    },
  ],
  education: [
    {
      level: String,
      degree: String,
      field: String,
      institution: String,
      passingYear: Number,
      score: String,
    },
  ],
  workExperiences: [
    {
      jobTitle: String,
      company: String,
      employmentType: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      responsibilities: String,
      achievements: String,
    },
  ],
  hobbies: [String], // Optional but highly recommended
  skills: { type: [String], default: [] },
  careerObjective: String,
  otp: String,
  otpExpiry: Date,
  // 🔥 NEW: Role for Admin
  refreshToken: {
    type: String,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  loginSessions: [
    {
      ip: String,
      browser: String,
      os: String,
      device: String,
      location: String,
      lastLogin: Date,
      firstLogin: Date,
      token: String,
    },
  ],
  badges: [
    {
      domain: String,
      level: Number,
      badge: String,
    },
  ],
  nameLockedByAdmin: {
    type: Boolean,
    default: false,
  },

  nameLockHistory: [
    {
      action: String, // LOCK / UNLOCK
      by: String, // admin email or id
      at: Date,
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin", "moderator", "analyst", "custom"],
    default: "user",
  },

  permissions: {
    canBlockUser: { type: Boolean, default: false },
    canResetAttempts: { type: Boolean, default: false },
    canViewActivity: { type: Boolean, default: false },
    canManageExams: { type: Boolean, default: false },
    canManagePermissions: { type: Boolean, default: false },
  },
});

// Export the model using ES module syntax
const User = mongoose.model("User", userSchema);

export default User;
