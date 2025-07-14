const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    recevireId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    messageText: {
        type: String
    },

    mediaUrl: {
        type: String,
    },

    link: {
        link: String,
        isLink: { type: Boolean, default: false }
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    time: {
        type: String,
        required: true
    },
    react: {
        type: String
    },
    replay: {
        chatId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "chat"
        },
        text: {
            type: String,
        }
    },
    isReplay: {
        type: Boolean,
        default: false
    },
    call: {
        callType: {
            type: String,
        },
        duration: {
            type: String,
        }
    },
    readMessage: {
        image: String,
        isRead: {
            type: Boolean,
            default: false
        }
    },
    share: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
    }
});

const messageText = mongoose.model("chat", messageSchema);
module.exports = messageText;