const route = require("express").Router();
const Post = require("../model/post");
const jwt = require("jsonwebtoken");
const jwt_sicret = "15ef1fr5g4158dwo0k";
const People = require("../model/people");
const upload = require("../middleware/multer");

const { createNotification } = require("../middleware/notification");
const { deletePreviusFile } = require("../lib/fileHandeler");
const { default: mongoose } = require("mongoose");

route.post("/createPost", upload.single("media"), async (req, res) => {
    try {
        const { caption } = req.body;
        const token = req.cookies.token;
        const decode = jwt.verify(token, jwt_sicret);
        const uid = decode.userId;
        const mimeType = req.file.mimetype;
        let fileType = '';
        if (mimeType.startsWith("video/")) {
            fileType = 'video';
        } else if (mimeType.startsWith("image/")) {
            fileType = "image";
        }

        let isVideo = false, isImage = false;
        let directoryName = '';

        if (fileType === "video") {
            directoryName = "postVideo";
            isVideo = true
        } else if (fileType === "image") {
            directoryName = "postImage";
            isImage = true
        }
        const destinationPath = `/${directoryName}/${req.file.filename}`;
        const newPost = new Post({ caption, postOwner: uid, media: destinationPath, video: isVideo, image: isImage });
        const response = await newPost.save();
        const user = await People.findById(uid);
        const friends = user.friends;
        createNotification(friends, uid, "post", newPost._id);
        res.status(201).json({ message: "post created successfully", data: response });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "server error in post/createPost" });
    }
});

route.post("/addcomment", async (req, res) => {
    try {
        const { post_id, comment } = req.body;
        const token = req.cookies.token;
        const decode = jwt.verify(token, jwt_sicret);
        const uid = decode.userId;
        const post = await Post.findById(post_id);
        if (!post) return console.log("Post not found");

        post.comments.push({
            text: comment,
            user: uid
        });
        await post.save();

    } catch (error) {
        console.error("Error adding comment:", error);
    }
});

route.post("/addreplay", async (req, res) => {
    try {
        const token = req.cookies.token;
        const decode = jwt.verify(token, jwt_sicret);
        const uid = decode.userId;
        const { postId, commentId, replyText } = req.body;
        const post = await Post.findById(postId);
        if (!post) return console.log("Post not found");

        const comment = post.comments.id(commentId);
        if (!comment) return console.log("Comment not found");

        comment.replies.push({
            text: replyText,
            user: uid
        });

        await post.save();

    } catch (error) {
        console.error("Error adding reply:", error);
    }
});

route.post("/addlike", async (req, res) => {
    try {
        const token = req.cookies.token;
        const decode = jwt.verify(token, jwt_sicret);
        const uid = decode.userId;
        const { postId } = req.body;
        const post = await Post.findById(postId);
        if (!post) return console.log("Post not found");

        if (!post.likes.includes(uid)) {
            post.likes.push(uid);
        } else {
            post.likes = post.likes.filter(id => id.toString() !== uid);
        }

        await post.save();

    } catch (error) {
        console.error("Error liking/unliking post:", error);
    }
});

route.get("/mypost", async (req, res) => {
    try {
        const token = req.cookies.token;
        const decode = jwt.verify(token, jwt_sicret);
        const posts = await Post.find({ postOwner: decode.userId }).populate("postOwner", "name image");
        res.status(200).json({ message: "here is your posts", data: posts })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "server error in post/mypost" });
    }
});

route.get("/publicpost/:id", async (req, res) => {
    try {
        const User = await People.findById(req.params.id);
        const notAllowPost = User.notAllowPost.map(id => new mongoose.Types.ObjectId(id));
        const posts = await Post.find({ _id: { $nin: notAllowPost } })
            .populate("postOwner", "username id image name")
            .populate("comments.user", "username email")
            .populate("comments.replies.user", "username email")
            .populate("likes", "username");

        res.status(200).json({ message: "here is your post", posts });
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
});

route.get("/getpostbyid/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("postOwner", "username id image name")
            .populate("comments.user", "username email")
            .populate("comments.replies.user", "username email")
            .populate("likes", "username");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({ message: "Here is your post", post });
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

route.get("/postinfo/:id", async (req, res) => {
    try {
        const singlePost = await Post.findById(req.params.id)
            .populate("comments.user", "image name")
            .populate("comments.replies.user", "image name")
            .populate("comments.replies.replay.user", "image name")
            .populate("comments.replies.replay.replay.user", "image name gender")
        res.status(200).json({ message: "here is your post", singlePost });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error in postinfo/API" });
    }
})

route.post("/addinnerreplay", async (req, res) => {
    try {
        const token = req.cookies.token;
        const decode = jwt.verify(token, jwt_sicret);
        const uid = decode.userId;
        const { postId, commentId, repId, replyText } = req.body;
        const post = await Post.findById(postId);
        if (!post) return console.log("Post not found");
        const comment = post.comments.id(commentId);
        const replay = comment.replies.id(repId);
        replay.replay.push({ text: replyText, user: uid });
        await post.save();

    } catch (error) {
        console.error("Error adding reply:", error);
    }
});

route.post("/addNestedInnerReplay", async (req, res) => {
    try {
        const token = req.cookies.token;
        const decode = jwt.verify(token, jwt_sicret);
        const uid = decode.userId;
        const { postId, commentId, repId, replyText, replayOf, nestedId } = req.body;
        const post = await Post.findById(postId);
        if (!post) return console.log("Post not found");
        const comment = post.comments.id(commentId);
        const replay = comment.replies.id(repId);
        const nestetdReplay = replay.replay.id(nestedId);
        nestetdReplay.replay.push({ replayOf, text: replyText, user: uid });
        await post.save();
    } catch (error) {
        console.error("Error adding reply:", error);
    }
});

route.post("/addlike_comment", async (req, res) => {
    try {
        const { commentId, postId } = req.body;
        const token = req.cookies.token;
        const decode = jwt.verify(token, jwt_sicret);
        const uid = decode.userId;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "post not found 404" });
        const comment = post.comments.id(commentId);
        comment.likes.push({ user: uid });
        await post.save();
    } catch (error) {
        console.error("Error adding like:", error);
    }
})

route.post("/addlike_replay", async (req, res) => {
    try {
        const { commentId, postId, repId } = req.body;
        const token = req.cookies.token;
        const decode = jwt.verify(token, jwt_sicret);
        const uid = decode.userId;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "post not found 404" });
        const comment = post.comments.id(commentId);
        const replay = comment.replies.id(repId);
        replay.likes.push({ user: uid });
        await post.save();
    } catch (error) {
        console.error("Error adding like:", error);
    }
})


route.post("/inner_addlike_replay", async (req, res) => {
    try {
        const { commentId, postId, repId, nestId } = req.body;
        const token = req.cookies.token;
        const decode = jwt.verify(token, jwt_sicret);
        const uid = decode.userId;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "post not found 404" });
        const comment = post.comments.id(commentId);
        const replay = comment.replies.id(repId);
        const nestrep = replay.replay.id(nestId);
        nestrep.likes.push({ user: uid });
        await post.save();
    } catch (error) {
        console.error("Error adding like:", error);
    }
})

route.get("/randompost/:id", async (req, res) => {
    try {
        const posts = await Post.find({ postOwner: req.params.id }).populate("postOwner", "name image");
        res.status(200).json({ message: "here is post", posts });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" });
    }
});

route.get("/read_all_video/:id", async (req, res) => {
    try {
        const user = await People.findById(req.params.id);
        const notAllowVideoPost = user.notAllowVideoPost.map(id => new mongoose.Types.ObjectId(id));
        const videos = await Post.find({ _id: { $nin: notAllowVideoPost }, video: true, image: false }).populate("postOwner", "username id image name")
            .populate("comments.user", "username email")
            .populate("comments.replies.user", "username email")
            .populate("likes", "username");

        res.status(200).json({ message: "here is your videos", videos });
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
})

route.post("/upadateCaption/:id", async (req, res) => {
    try {
        const { caption } = req.body;
        const post = await Post.findByIdAndUpdate(req.params.id, { caption }, { new: true });
        res.status(200).json({ message: "update success", post });
    } catch (error) {
        res.status(500).json({ message: "internal server error" });
    }
})


route.post("/upadateMedia/:id", upload.single("media"), async (req, res) => {
    try {
        const beforeUpdatePost = await Post.findById(req.params.id);
        const previusFile = beforeUpdatePost.media;
        deletePreviusFile(previusFile);
        const mimeType = req.file.mimetype;
        const isVideo = mimeType.startsWith("video/");
        const isImage = mimeType.startsWith("image/");
        let directoryName = isVideo ? "postVideo" : isImage ? "postImage" : "";
        const destinationPath = `/${directoryName}/${req.file.filename}`;
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            {
                media: destinationPath,
                image: isImage,
                video: isVideo,
            },
            { new: true }
        );

        res.status(200).json({ message: "update success", post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "internal server error" });
    }
});

route.delete("/delete/:id", async (req, res) => {
    try {
        const beforDelete = await Post.findById(req.params.id);
        deletePreviusFile(beforDelete.media);
        await Post.findByIdAndDelete(beforDelete.id);
        res.status(200).json({ message: "delete success" })
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "internal server error" });
    }
})

module.exports = route;