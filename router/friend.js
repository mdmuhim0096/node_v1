const route = require("express").Router();
const jwt = require("jsonwebtoken");
const jwt_sicret = "15ef1fr5g4158dwo0k";
const FriendRequest = require("../model/friend");
const People = require("../model/people");
const Counter = require("../model/counter");

route.post('/send_request', async (req, res) => {
    try {
        const token = req.cookies.token;
        const decode = jwt.verify(token, jwt_sicret);
        const uid = decode.userId;
        const { receiverId } = req.body;
        const mainUser = await People.findById(uid);
        mainUser.notAllow.push(receiverId);
        const newCounter = new Counter({ countWoner: receiverId, counter: 1, _type: "friendrequest" });
        const isMatchFriend = await FriendRequest.findOne({ sender: uid, receiver: receiverId });
        if (isMatchFriend) {
            return res.status(400).json({ message: 'Friend request already axist' });
        }
        const request = new FriendRequest({ sender: uid, receiver: receiverId, myId: uid });
        await request.save();
        await mainUser.save();
        await newCounter.save();
        res.json({ message: 'Friend request sended', status: request.status, id: mainUser._id });
    } catch (error) {
        res.status(500).json({ message: 'Error sending friend request', error });
    }
});

route.get('/friend_requests', async (req, res) => {
    try {
        const token = req.cookies.token;
        const decode = jwt.verify(token, jwt_sicret);
        const uid = decode.userId;
        const requests = await FriendRequest.find({ receiver: uid, status: 'pending' }).populate('sender');
        res.status(200).json({ message: "here is your friends", data: requests })
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests', error });
    }
});


route.post('/request_accept', async (req, res) => {
    try {
        const { requestId } = req.body;
        const request = await FriendRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = 'accepted';
        await request.save();

        await People.findByIdAndUpdate(request.sender, { $push: { friends: request.receiver } });
        await People.findByIdAndUpdate(request.receiver, { $push: { friends: request.sender } });

        res.json({ message: 'Friend request accepted' });
    } catch (error) {
        res.status(500).json({ message: 'Error accepting request', error });
    }
});

route.post("/reject_request", async (req, res) => {
    try {
        const { requestId } = req.body;
        await FriendRequest.findByIdAndDelete(requestId);
        res.status(200).json({ message: "rejected" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "server error in api/reject_request" })
    }
});

route.get("/counter_req", async (req, res) => {
    try {
        const token = req.cookies.token;
        const decode = jwt.verify(token, jwt_sicret);
        const uid = decode.userId;
        const totalreq = await Counter.find({ countWoner: uid, _type: "friendrequest" });
        res.status(200).json({ message: "here is your exicution", totalreq });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "server error in api/reject_request" })
    }
})

route.post("/reset_counter_req", async (req, res) => {
    try {
        const token = req.cookies.token;
        const decode = jwt.verify(token, jwt_sicret);
        const countWoner = decode.userId;
        const totalreq = await Counter.find({ countWoner });
        totalreq.forEach(async (data) => {
            await Counter.findByIdAndDelete(data.id);
        })
        res.status(200).json({ message: "here is you exicution", totalreq });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "server error in api/reject_request" })
    }
});

route.get("/ourstyle/:myId/:myfriendId", async (req, res) => {
    try {
        const design = await FriendRequest.findOne({ $or: [{ sender: req.params.myId, receiver: req.params.myfriendId }, { sender: req.params.myfriendId, receiver: req.params.myId }] }).select("styles block");
        res.status(200).json({ message: "here is your design", design });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" });
    }
})

route.post("/doMessageItalic", async (req, res) => {
    try {
        const { isToggleForBase, myId, myfriendId } = req.body;
        console.log(isToggleForBase);
        const design = await FriendRequest.find({ $or: [{ sender: myId, receiver: myfriendId }, { sender: myfriendId, receiver: myId }] });
        const friendId = design[0].id;
        const _design_ = await FriendRequest.findByIdAndUpdate(friendId, { "styles.text.italic": isToggleForBase }, { new: true });
        console.log("data, ---- ", _design_.styles.text.italic);
        res.status(200).json({ message: "here is your design", isItalic: _design_.styles.text.italic });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" });
    }
});

route.post("/doChatBgChange", async (req, res) => {
    try {
        const { bgColor, bgImage, bgType, myId, myFriendId } = req.body;
        const design = await FriendRequest.find({ $or: [{ sender: myId, receiver: myFriendId }, { sender: myFriendId, receiver: myId }] });
        const friendId = design[0].id;

        const _design_ = await FriendRequest.findByIdAndUpdate(friendId, { styles: { bg: { bgType, bg: bgType == "image" ? bgImage : bgColor } } }, { new: true });

        res.status(200).json({ message: "here is your design", bg: _design_.styles.bg });
    } catch (err) {
        console.log(err);
    }
});

route.post("/doFontFamilyChange", async (req, res) => {
    try {
        const { family, myId, myFriendId } = req.body;
        const design = await FriendRequest.find({ $or: [{ sender: myId, receiver: myFriendId }, { sender: myFriendId, receiver: myId }] });
        const friendId = design[0].id;
        const _design_ = await FriendRequest.findByIdAndUpdate(friendId, { "styles.text.family": family }, { new: true });
        res.status(200).json({ message: "here is your design", family: _design_.styles.bg });
    } catch (err) {
        console.log(err);
    }
})

route.post("/doFontColorChange", async (req, res) => {
    try {
        const { color, myId, myFriendId } = req.body;
        console.log("propertyes: ", color, myId, myFriendId);
        const design = await FriendRequest.find({ $or: [{ sender: myId, receiver: myFriendId }, { sender: myFriendId, receiver: myId }] });
        const friendId = design[0].id;
        const _design_ = await FriendRequest.findByIdAndUpdate(friendId, { "styles.text.color": color }, { new: true });
        res.status(200).json({ message: "here is your design", color: _design_.styles.text.color });
    } catch (err) {
        console.log(err);
    }
})

route.get("/checkIsFriend/:myId/:userId", async (req, res) => {
    const isMatch = await FriendRequest.findOne({ sender: req.params.myId, receiver: req.params.userId });
    if (isMatch && isMatch.status === "pending") {
        return res.status(208).json({ message: "request in pending", status: isMatch.status })
    }
    if (isMatch && isMatch.status === "accepted") {
        return res.status(208).json({ message: "we are already friend", status: isMatch.status })
    }
    if (!isMatch) {
        return res.status(208).json({ message: "add friend", status: "send request" })
    }
});

route.post("/block", async (req, res) => {
    try {
        const { myId, friendId } = req.body;

        const updated = await FriendRequest.findOneAndUpdate(
            {
                $or: [
                    { sender: myId, receiver: friendId },
                    { receiver: myId, sender: friendId }
                ]
            },
            { "block.blocker": myId, "block.isBlock": true },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        res.status(200).json({ message: "Blocked successfully", updated });
        console.log("isBlock: ", updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

route.post("/unblock", async (req, res) => {
    try {
        const { myId, friendId } = req.body;

        const updated = await FriendRequest.findOneAndUpdate(
            {
                $or: [
                    { sender: myId, receiver: friendId },
                    { receiver: myId, sender: friendId }
                ]
            },
            { "block.blocker": null, "block.isBlock": false },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        res.status(200).json({ message: "Blocked successfully" });
        console.log("isBlock: ", updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = route;