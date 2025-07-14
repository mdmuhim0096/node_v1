const route = require("express").Router();
const Notification = require("../model/notification");
const Counter = require("../model/counter");

route.post("/add", async (req, res) => {
    try {
        const { receiverId, senderId, type, commentId, text } = req.body;
        const notification = new Notification({ receiverId, senderId, type, text, commentId });
        const counter = new Counter({ countWoner: receiverId, _type: "notifications" })
        const response = await notification.save();
        await counter.save();
        console.log(response);
        res.status(201).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" })
    }
});

module.exports = route;