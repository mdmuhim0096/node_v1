const mongoose = require("mongoose");

const saveSchema = new mongoose.Schema({
    saveWoner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    }
});

const save = mongoose.model("save", saveSchema);
module.exports = save;