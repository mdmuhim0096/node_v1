const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://muhim:muhim765@cluster0.lghriwg.mongodb.net/2030");
const databas = mongoose.connection;
databas.on("connected", () => {
    console.log("connected to mongoDB")
});
module.exports = databas;