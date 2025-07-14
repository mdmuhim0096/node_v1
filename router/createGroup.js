const Group = require("../model/createGroup");
const route = require("express").Router();
const multer = require("multer");
const path = require("path");
const People = require("../model/people");
const { default: mongoose } = require("mongoose");
const { deletePreviusFile } = require("../lib/fileHandeler");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/groupImage');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

route.post("/create", async (req, res) => {
    try {
        const { groupName, myId, realTime, firstuser = [] } = req.body;
        const group = new Group({ name: groupName, admin: myId, createdAt: realTime });
        firstuser.forEach(id => {
            group.members.push({ userId: id });
        });
        const response = await group.save();
        const me = await People.findById(myId);
        me.groups.push(response.id);
        await me.save();
        res.status(201).json({ message: "group created", response })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" })
    }
});

route.post("/changeImage/:id", upload.single("img"), async (req, res) => {
    try {
        const image = req.file.filename;
        const groupImage = `/groupImage/${image}`;
        const groupAfterFind = await Group.findById(req.params.id);
        if (groupAfterFind && !groupAfterFind.groupImage.includes("group.png")) {
            deletePreviusFile("/" + groupAfterFind.groupImage);
        }
        const response = await Group.findByIdAndUpdate(req.params.id, { groupImage }, { new: true });
        res.status(200).json({ message: "image changed", img: response.groupImage });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" })
    }
});

route.post("/changeName", async (req, res) => {
    try {
        const { groupId, groupName } = req.body;
        const response = await Group.findByIdAndUpdate(groupId, { name: groupName }, { new: true });
        res.status(200).json({ message: "name changed", name: response.name })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" })
    }
})

route.post("/addmember/:id", async (req, res) => {
    try {
        const { members } = req.body;
        const member = await People.findById(members);
        member.groups.push(req.params.id);
        const objmembers = new mongoose.Types.ObjectId(member.id);
        const ourGroup = await Group.findById(req.params.id);
        ourGroup.members.push({ userId: objmembers })
        await ourGroup.save();
        await member.save();
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" })
    }
});

// Remove a member from a group AND remove the group from that user
route.post("/removemember/:id", async (req, res) => {
  try {
    const { userId } = req.body; // just send userId in body

    // 1. Pull the user from the group's members array
    const groupUpdate = await Group.findByIdAndUpdate(
      req.params.id,
      { $pull: { members: { userId: userId } } },
      { new: true }
    );

    // 2. Pull the group from the user's groups array
    const userUpdate = await People.findByIdAndUpdate(
      userId,
      { $pull: { groups: req.params.id } },
      { new: true }
    );

    res.status(200).json({
      message: "Member removed successfully",
      group: groupUpdate,
      user: userUpdate
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

route.get("/myGroup/:id", async (req, res) => {
    try {
        const groups = await People.findById(req.params.id).populate("groups");
        if (!groups) {
            return res.status(404).json({ messae: "group not found" });
        }
        res.status(200).json({ message: "here is your groups", groups });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" })
    }
});

route.post("/changebg", async (req, res) => {
    try {
        const { bgColor, bgImage, bgType, group } = req.body;
        await Group.findByIdAndUpdate(group, { style: { background: { bgType, bgDesign: bgType == "color" ? bgColor : bgImage } } }, { new: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" })
    }
});

route.post("/font", async (req, res) => {
    try {
        const { color, italic, bg, family, group, } = req.body;
        let styleObj = {};
        if (color) {
            styleObj["color"] = color;
        }
        if (bg) {
            styleObj["bg"] = bg;
        }
        if (italic) {
            styleObj["italic"] = italic;
        }
        if (family) {
            styleObj["family"] = family;
        }
        await Group.findByIdAndUpdate(group, { style: { text: styleObj } }, { new: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" })
    }
});

route.get("/members/:id", async (req, res) => {
    try {
        const __group__ = await Group.findById(req.params.id).populate("members.userId", "_id name image")
        if (!__group__) {
            return res.status(404).json({ message: "group not found" })
        }
        const members = __group__.members;
        res.status(200).json({ message: "here is your group", members })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "server error" })
    }
})

route.get("/deleteGroup", async (req, res) => {
    try {
        await Group.deleteMany();
        res.send("<h1>success ✨</h1>")
    } catch (error) {

    }
})

module.exports = route;