const route = require("express").Router();
const Chat = require("../model/chat");
const People = require("../model/people");
const multer = require("multer");
const path = require("path");
const { deletePreviusFile } = require("../lib/fileHandeler");
const { text } = require("stream/consumers");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, './public/chatImage');
        } else if (file.mimetype.startsWith("video/")) {
            cb(null, './public/chatVideo');
        } else {
            cb(null, './public/chatAudio');
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

route.post("/update", async (req, res) => {
    try {
        const { chatId, message } = req.body;
        const messages = await Chat.findByIdAndUpdate(chatId, { messageText: message }, { new: true });
        res.status(200).json({ message: "success", data: messages });
    } catch (error) {
        console.log(error)
    }
})

route.post("/delete", async (req, res) => {
    try {
        const { chatId } = req.body;
        const message = await Chat.findById(chatId);
        deletePreviusFile("/" + message.mediaUrl);
        await Chat.findByIdAndDelete(chatId);
        res.status(200).json({ message: "deleted success" })
    } catch (error) {
        console.log(error);
    }
})

route.post("/unsent", async (req, res) => {
    try {
        const { chatId } = req.body;
        const messages = await Chat.findById(chatId);

        if (!messages) {
            return res.status(404).json({ message: "Message not found" });
        }

        let updatedData = {};

        if (messages.link?.isLink) {
            updatedData = {
                "link.link": "unsent",
                "link.isLink": false
            };
        } else if (typeof messages.mediaUrl === "string" &&
            (messages.mediaUrl.includes("image") ||
                messages.mediaUrl.includes(".jpg") ||
                messages.mediaUrl.includes("video") ||
                messages.mediaUrl.includes(".mp4") ||
                messages.mediaUrl.includes("audio") ||
                messages.mediaUrl.includes(".mp3"))) {

            deletePreviusFile("/" + messages.mediaUrl);
            updatedData = {
                mediaUrl: "unsent"
            };
        } else {
            updatedData = {
                messageText: "unsent"
            };
        }

        const updatedMessage = await Chat.findByIdAndUpdate(chatId, updatedData, { new: true });

        return res.status(200).json({ message: "success", data: updatedMessage });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error });
    }
});

route.post("/upload", upload.fields([{ name: "image" }, { name: "audio" }, { name: "video" }]), async (req, res) => {
    try {
        const { image, audio, video } = req.files;
        const file = image?.[0] || audio?.[0] || video?.[0];
        if (!file) { return res.status(400).json({ error: 'No file uploaded' }); }
        let directotyName = '';
        if (file.mimetype.startsWith("image/")) {
            directotyName = 'chatImage';
        } else if (file.mimetype.startsWith("video/")) {
            directotyName = 'chatVideo';
        } else if (file.mimetype.startsWith("audio/")) {
            directotyName = 'chatAudio';
        }
        return res.json({ message: "we send image", mediaUrl: `${directotyName}/${file.filename}` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" });
    }
})

route.post("/getusr/:id", async (req, res) => {
    try {
        const userId = req.params.id; // Extract user ID from URL parameter
        const user = await People.findById(userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user); // Send user data
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


route.post("/replaychat", async (req, res) => {
    try {
        const { recevireId, senderId, time, user, chatId, replay } = req.body;
        const reply = new Chat({ senderId, recevireId, time, user, isReplay: true, replay: { chatId, text: replay } });
        const response = await reply.save();
        res.status(201).json({ message: "replay created true", response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

route.get("/deleteall", async (req, res) => {
    try {
        await Chat.deleteMany();
        res.send("<h1>deleted all 📗📗</h1>")
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

module.exports = route