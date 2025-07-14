// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // who receives the notification
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },  // who triggered the action

  type: { 
    type: String, 
    enum: ['like', 'comment', 'follow', 'message', 'mention', 'reply', 'post'], 
    required: true 
  },

  // Optional fields depending on notification type
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },

  text: { type: String }, // Optional message for custom display
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
