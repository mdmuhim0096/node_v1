const Notification = require('../model/notification');
const Counter = require("../model/counter")
// 🔔 Create a new notification
const createNotification = async (receiverId = [], senderId, type, postId, commentId, messageId, text) => {
    try {
        for (let id of receiverId) {
            const notification = new Notification({ receiverId: id, senderId, type, postId, commentId, messageId, text });
            const counter = new Counter({ countWoner: id, _type: type })
            await notification.save();
            await counter.save();
        }
    } catch (err) {
        console.log({ error: err.message });
    }
}

module.exports = { createNotification };