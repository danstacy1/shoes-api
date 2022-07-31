// seed.js is going to be the file we run, whenever we want to seed our database, we'll create a bunch of pets at once.

// we want to be careful with this, because when we run it, it'll delete all of the shoes in the db. 

// we can modify this later, to only delete shoes that don't have an owner already, but we'll keep it simple for now.

const mongoose = require('mongoose')
const Shoe = require('./shoe')
const db = require('../../config/db')

const startShoes = [
    { brand: 'Nike', name: 'Jordan 3 Retro UNC', color: 'White/Grey', style: 'Basketball', forsale: false},
    { brand: 'Nike', name: 'Jordan 11 Concord', color: 'White/Black', style: 'Basketball', forsale: true},
    { brand: 'adidas', name: 'UltraBoost 4.0 DNA', color: 'White', style: 'Running', forsale: false},
    { brand: 'adidas', name: 'Yeezy Boost 350 V2', color: 'White/Black/Red', style: 'Running', forsale: true},
    { brand: 'Vans', name: 'Old Skool Classic', color: 'Black/White', style: 'Skating', forsale: true},
    { brand: 'Crocs', name: 'Classic Clog', color: 'Tie-Dye', style: 'Leisure', forsale: true},
    { brand: 'Chaco', name: 'Z Cloud', color: 'Grey/Yellow/Red', style: 'Sandels', forsale: false}
]

// first we need to connect to the database
mongoose.connect(db, {
    useNewUrlParser: true
})
    .then(() => {
        // first we remove all of the shoes
        // here we can add something to make sure we only delete shoes without an owner
        Shoe.deleteMany({ owner: null })
            .then(deletedShoes => {
                console.log('deletedShoes', deletedShoes)
                // the next step is to use our startShoes array to create our seeded shoes
                Shoe.create(startShoes)
                    .then(newShoes => {
                        console.log('the new shoes', newShoes)
                        mongoose.connection.close()
                    })
                    .catch(error => {
                        console.log(error)
                        mongoose.connection.close()
                    })
            })
            .catch(error => {
                console.log(error)
                mongoose.connection.close()
            })
    })
    .catch(error => {
        console.log(error)
        mongoose.connection.close()
    })