const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    styles: {
        bg: {
            bgType:{
                type:String,
                default: "image"
            },
            bg:{
                type:String,
                default: "bg-grray-400"
            }
        },
        text: {
            color: {
                type: String,
                default: "text-white"
            },
            family: {
                type: String,
                default: "font-sans"
            },
            italic: {
                type: Boolean,
                default: false
            }
        }
    },
    block: {
        blocker: String,
        isBlock:{
            type: Boolean,
            default: false
        }
    }
});

const friend = mongoose.model("friend", friendSchema);
module.exports = friend;