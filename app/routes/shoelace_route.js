const express = require('express')
const passport = require('passport')

// pull in Mongoose model for shoes
const Shoe = require('../models/shoe')

const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })
const router = express.Router()

// ROUTES GO HERE
// we only need three, and we want to set them up using the same conventions as our other routes, which means we might need to refer to those other files to make sure we're using our middleware correctly

// POST -> create a shoelace
// POST /shoelaces/<shoe>
router.post('/shoelaces/:shoeId', removeBlanks, (req, res, next) => {
    // get our shoelace from req.body
    const shoelace = req.body.shoelace
    // get our shoe's id from req.params.shoeId
    const shoeId = req.params.shoeId
    // find the shoe
    Shoe.findById(shoeId)
        .then(handle404)
        .then(shoe => {
            console.log('this is the shoe', shoe)
            console.log('this is the shoelace', shoelace)

            // push the shoelace into the shoe's shoelaces array
            shoe.shoelaces.push(shoelace)

            // save the shoe
            return shoe.save()
            
        })
        // send the newly updated shoe as json
        .then(shoe => res.status(201).json({ shoe: shoe }))
        .catch(next)
})

// UPDATE a shoelace
// PATCH /shoelaces/<shoe>/<shoelace_id>
router.patch('/shoelaces/:shoeId/:shoelaceId', requireToken, removeBlanks, (req, res, next) => {
    // get the shoelace and the shoe ids saved to variables
    const shoeId = req.params.shoeId
    const shoelaceId = req.params.shoelaceId

    // find our shoe
    Shoe.findById(shoeId)
        .then(handle404)
        .then(shoe => {
            // single out the shoelace (.id is a subdoc method to find something in an array of subdocs)
            const theShoelace= shoe.shoelaces.id(shoelaceId)
            // make sure the user sending the request is the owner
            requireOwnership(req, shoe)
            // update the shoelace with a subdocument method
            theShoelace.set(req.body.shoelace)
            // return the saved shoe
            return shoe.save()
        })
        .then(() => res.sendStatus(204))
        .catch(next)
})

// DELETE a shoelace
// DELETE /shoelaces/<shoe>/<shoelace_id>
router.delete('/shoelaces/:shoeId/:shoelaceId', requireToken, (req, res, next) => {
    // get the shoelace and the shoe ids saved to variables
    const shoeId = req.params.shoeId
    const shoelaceId = req.params.shoelaceId
    // then we find the shoe
    Shoe.findById(shoeId)
        // handle a 404
        .then(handle404)
        // do stuff with the shoelace(in this case, delete it)
        .then(shoe => {
            // we can get the subdoc the same way as update
            const theShoelace = shoe.shoelaces.id(shoelaceId)
            // require that the user deleting this shoelace is the shoe's owner
            requireOwnership(req, shoe)
            // call remove on the subdoc
            theShoelace.remove()

            // return the saved shoe
            return shoe.save()
        })
        // send 204 no content status
        .then(() => res.sendStatus(204))
        // handle errors
        .catch(next)
})

// export the router
module.exports = router