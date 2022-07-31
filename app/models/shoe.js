// Shoe -> have an owner field, that is a user
// eventaully we'll add an array of shoelace subdocuments

const mongoose = require('mongoose')

const shoelaceSchema = require('./shoelace')

const { Schema, model } = mongoose
const shoeSchema = new Schema(
    {
        brand: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        },
        style: {
            type: String,
            required: true
        },
        forsale: {
            type: Boolean,
            required: true
        },

        shoelaces: [shoelaceSchema],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }, {
        timestamps: true,
        // we're going to be adding virtuals to our model, the following lines will make sure that those virtuals are included whenever we return JSON or an Object
        toObject: { virtuals: true },
        toJSON: {virtuals: true }
    }
)

// virtuals go here
// these are virtual properties, that use existing data (saved in the database), to add a property whenever we retrieve a document and convert it to JSON or an object
// use traditional function syntax
shoeSchema.virtual('fullTitle').get(function () {
    // in here, we can do whatever javascripty things we want, to make sure we return some value that will be assigned to this virtual
    // fullTitle is going to combine the brand and name to build a title
    return `${this.brand} ${this.name} ${this.color}`
})


///////////NOT sure how to use this in my app for now///
// shoeSchema.virtual('isABaby').get(function () {
//     if (this.age < 2) {
//         return "yeah, they're just a baby"
//     } else if (this.age >= 2 && this.age < 6) {
//         return "not really a baby, but still a baby"
//     } else {
//         return "a good old pet(definitely still a baby)"
//     }
// })

module.exports = model('Shoe', shoeSchema)