const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupMessageSchema = new Schema({
    group: {
        type: Schema.Types.ObjectId,
        ref: 'group',
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'video', 'file', 'audio', 'link', 'reply', 'share'],
        default: 'text'
    },
    replyTo: {
        senderImg: String,
        mtext: String
    },
    content: {
        type: String,
        required: true
    },
    seenBy: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    createdAt: {
        type: String
    },
    share: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    }
});

module.exports = mongoose.model('groupmessage', groupMessageSchema);
