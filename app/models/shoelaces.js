// import dependencies
const mongoose = require('mongoose')

// toy is a subdocument NOT A MODEL
// toy will be part of the toys array added to specific pets

// we dont, DO NOT, need to get the model from mongoose, so we're going to save a lil real estate in our file and skip destructuring, in favor of the regular syntax
const shoelaceSchema = new mongoose.Schema({
    color: {
        type: String,
        required: true
    },
}, {
    timestamps: true
})

module.exports = shoelaceSchema