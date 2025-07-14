const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "group" }],
    gender: {
        type: String,
        required: true
    },
    like: {
        type: Number,
        default: 0
    },
    notAllow: [{
        type: String
    }],
    notAllowPost: [{
        type: String
    }],
    notAllowVideoPost: [{
        type: String
    }],
    bio: {
        type: String
    },
    styles: {
        textColor: {
            type: String,
            default: "text-white"
        },
        themebg: {
            type: String,
            default: "bg-black"
        },
        textStyle: {
            type: String,
            default: "font-sanse"
        },
        postbg:{
            type: String,
            default: "bg-black" 
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    maritalStatus: {
        type: String,
        enum: ["single", "in a relationship", "Married"],
        default: "single"
    }
});

const user = mongoose.model("user", userSchema);
module.exports = user;