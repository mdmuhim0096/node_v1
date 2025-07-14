const mongoose = require("mongoose");
const countSchema = new mongoose.Schema({
    countWoner: {
        type: String
    },
    _type: {
        type: String
    }
});

const counter = mongoose.model("count", countSchema);
module.exports = counter;
