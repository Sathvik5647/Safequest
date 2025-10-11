const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  storiesCompleted: { type: Number, default: 0 },
  safeChoicesStreak: { type: Number, default: 0 },
  perfectStories: { type: Number, default: 0 },
  achievements: [String],
  lastLoginDate: { type: Date, default: Date.now },
  loginStreak: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  username: { type: String, required: false },
  avatar: { type: String, default: 'luna' },
  profilePicture: { type: String, required: false },
  privacy: { type: String, enum: ['private', 'friends', 'public'], default: 'private' },
  notifications: { type: Boolean, default: true },
  tutorialCompleted: { type: Boolean, default: false },
  stats: { type: userStatsSchema, default: () => ({}) }
});

const User = mongoose.model('User', userSchema);

module.exports = User;