const Group = require("../model/initiateGroup");
const route = require("express").Router();
const path = require("path");
const multer = require("multer");
const { deletePreviusFile } = require("../lib/fileHandeler");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/groupFile');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

route.post("/createmedia", upload.fields([{ name: "image" }, { name: "video" }, { name: "audio" }]), async (req, res) => {
    try {
        const { group, messageType, sender, seenBy, realTime } = req.body;

        const fileField = req.files.image?.[0] || req.files.video?.[0] || req.files.audio?.[0];
        const content = fileField ? `/groupFile/${fileField.filename}` : null;
        const groupChat = new Group({ group, messageType, sender, content, seenBy, createdAt: realTime });
        const response = await groupChat.save();
        res.status(201).json({ message: "chat created", response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" });
    }
});

route.post("/createtext", async (req, res) => {
    try {
        const { group, messageType, sender, content, seenBy, realTime } = req.body;
        let messageType_ = messageType;
        if (content.includes("http://") || content.includes("https://")) {
            messageType_ = "link"
        }
        const isLoop = content.match(/^\$(\d+)\s\{(.+)\}$/) || content.match(/^\$(\d+)\{(.+)\}$/);
        let loopText = "",
            next = ", ",
            TextForDeply = content;
        if (isLoop) {
            for (let i = 0; i < isLoop[1]; i++) {
                if (i == isLoop[1] - 1) next = ".";
                loopText += isLoop[2] + next;
            }
            TextForDeply = loopText;
        }
        const groupChat = new Group({ group, messageType: messageType_, sender, content: TextForDeply, seenBy, createdAt: realTime });
        const response = await groupChat.save();
        res.status(201).json({ message: "chat created", response })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" })
    }
});

route.post("/detele/:id", async (req, res) => {
    try {
        const message = await Group.findById(req.params.id);
        if (message.messageType != "text") {
            deletePreviusFile(`/groupFile/${message.content}`);
        }
        await Group.findByIdAndDelete(message.id);
        res.status(201).json({ message: "delete chat" })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" })
    }
});

route.get("/getchat/:id", async (req, res) => {
    try {
        const chats = await Group.find({ group: req.params.id }).populate("sender").populate("seenBy").populate("share");
        if (!chats) return res.status(404).json({ message: "chat not found" });
        res.status(200).json({ message: "here is your chats", chats });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" });
    }
});

route.post("/seenby", async (req, res) => {
    try {
        const { messageId, userId } = req.body;
        const ress = await Group.findByIdAndUpdate(messageId, { $addToSet: { seenBy: userId } }, { new: true });
        res.status(200).json({ message: "youe message seen by they." });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" });
    }
});

route.get("/deleteall", async (req, res) => {
    await Group.deleteMany();
    res.send("<h1>deleted all</h1>")
});

route.post("/deleteMessage", async (req, res) => {
    try {
        const { group, message } = req.body;
        const gmessage = await Group.findById(message);
        if (gmessage.messageType != "text" || gmessage.messageType != "link") {
            deletePreviusFile(gmessage.content);
        }
        await Group.findByIdAndDelete(message);
        res.status(200).json({ message: "deleted success" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" });
    }
});

route.post("/reply", async (req, res) => {
    try {
        const { rtext, messageType, sender, image, mtext, realTime, group } = req.body;

        const reply = new Group({ content: rtext, messageType, createdAt: realTime, sender, replyTo: { senderImg: image, mtext }, group });
        const response = await reply.save();
        res.status(201).json({message: "reply created", response});

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" });
    }
});


module.exports = route;