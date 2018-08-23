const mongoose = require("mongoose")

const imageCardSchema = new mongoose.Schema({
    textArea: String,
    filename: String
});

const ImageCard = mongoose.model("ImageCard", imageCardSchema);

module.exports = ImageCard;

