const route = require("express").Router();
const People = require("../model/chat");
const Group = require("../model/initiateGroup");

route.post("/sharechat", async (req, res) => {
    try {
        const { senderId, recevireId, shareId, realTime, user } = req.body;
        const newShareChat = new People({ senderId, recevireId, share: shareId, time: realTime, user , mediaUrl: "share"});
        const response = await newShareChat.save();
        res.status(201).json({ message: "success", response });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "server error" });
    }
});

route.post("/sharegroup", async (req, res) => {
    try {
        const { sender, realTime, shareId, group, messageType } = req.body;
        const shareGroup = new Group({ sender, createdAt: realTime, share: shareId, group, messageType, content: "this is an post" });
        const response = await shareGroup.save();
        res.status(201).json({ message: "success", response });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "server error" });
    }
});

module.exports = route;
