const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    replies: [
        {
            text: String,
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            },
            likes: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "user"
                    }
                }
            ],
            replay: [
                {
                    text: String,
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "user"
                    },
                    likes: [
                        {
                            user: {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "user"
                            }
                        }
                    ],
                    replay: [{
                        replayOf: String,
                        text: String,
                        user: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "user"
                        },
                        likes: [
                            {
                                user: {
                                    type: mongoose.Schema.Types.ObjectId,
                                    ref: "user"
                                }
                            }
                        ]
                    }]
                }
            ]
        }
    ],
    likes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            }
        }
    ],
});

const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        required: true
    },
    postOwner: {  // Fixed Typo
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    media: {
        type: String,
        required: true
    },
    video: {
        type: Boolean,
        default: false
    },
    image: {
        type: Boolean,
        default: false
    },
    comments: [commentSchema],  // Embedded comment schema
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ]  // Track users who liked the post
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
