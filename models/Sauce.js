const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String },
    heat: { type: Number, required: true },
    likes: { type: Number, required: true, default : 0 },
    dislikes: { type: Number, required: true, default : 0 },
    usersLicked: { type: Array },
    usersDislicked: { type: Array }
});
module.exports = mongoose.model('Sauce', sauceSchema);