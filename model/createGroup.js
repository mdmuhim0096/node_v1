// models/Group.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  groupImage: {
    type: String,
    default: 'groupImage/group.png' // Cloudinary/URL of group image
  },
  members: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'user' },
      joinedAt: { type: Date, default: Date.now }
    }
  ],
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  createdAt: {
    type: String
  },
  style: {
    text: {
      color: {
        type: String,
        default: "text-lime-500"
      },
      bg: {
        type: String,
        default: "bg-teal-500"
      },
      family: {
        type: String,
        default: "font-raleway"
      },
      italic: {
        type: Boolean,
        default: true
      }
    },
    background: {
      bgType: {
        type: String,
        default: "color"
      },
      bgDesign: {
        type: String,
        default: "bg-green-500"
      }
    }
  }
});

module.exports = mongoose.model('group', groupSchema);
