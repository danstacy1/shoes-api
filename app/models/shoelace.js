// import dependencies
const mongoose = require('mongoose')

// shoelace is a subdocument NOT A MODEL
// shoelace will be part of the toys array added to specific pets

// we dont, DO NOT, need to get the model from mongoose, so we're going to save a lil real estate in our file and skip destructuring, in favor of the regular syntax
const shoelaceSchema = new mongoose.Schema({
    color: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
 }, {
    timestamps: true
})

module.exports = shoelaceSchema