const route = require("express").Router();
const Save = require("../model/save");

route.post("/save", async (req, res) => {
    try {
        const { id, _id_ } = req.body;
        const newSave = new Save({ saveWoner: _id_, postId: id });
        const response = await newSave.save();
        res.status(200).json({ message: "saved success", response });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" });
    }
});

route.get("/save/:id", async (req, res) => {
    try {
        const save = await Save.find({ saveWoner: req.params.id }).populate({
            path: "postId", populate: {
                path: "postOwner",
                select: "name image _id"
            }
        });
        if (!save) {
            return res.status(404).json({ message: "save not found 404" });
        }
        res.status(200).json({ message: "here is your save content", save });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "internal server error" });
    }
});

module.exports = route;