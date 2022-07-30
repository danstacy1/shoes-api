// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for shoes
const Shoe = require('../models/shoe')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /shoes
router.get('/shoes', (req, res, next) => {
	// we want everyone to see the shoes, whether they're logged in or not.
	// if we wanted to protect these resources, then we can add that middleware back in. and we would place it between the route and the callback function.(second argument)
	Shoe.find()
		.populate('owner')
		.then((shoes) => {
			// `shoes` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return shoes.map((shoe) => shoe.toObject())
		})
		// respond with status 200 and JSON of the shoes
		.then((shoes) => res.status(200).json({ shoes: shoes }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// SHOW
// GET /shoes/5a7db6c74d55bc51bdf39793
router.get('/shoes/:id', (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	Shoe.findById(req.params.id)
		.populate('owner')
		.then(handle404)
		// if `findById` is succesful, respond with 200 and "shoe" JSON
		.then((shoe) => res.status(200).json({ shoe: shoe.toObject() }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// CREATE
// POST /shoes
router.post('/shoes', requireToken, (req, res, next) => {
	// set owner of new shoe to be current user
	req.body.shoe.owner = req.user.id

	Shoe.create(req.body.shoe)
		// respond to succesful `create` with status 201 and JSON of new "shoe"
		.then((shoe) => {
			res.status(201).json({ shoe: shoe.toObject() })
		})
		// if an error occurs, pass it off to our error handler
		// the error handler needs the error message and the `res` object so that it
		// can send an error message back to the client
		.catch(next)
})

// UPDATE
// PATCH /shoes/5a7db6c74d55bc51bdf39793
router.patch('/shoes/:id', requireToken, removeBlanks, (req, res, next) => {
	// if the client attempts to change the `owner` property by including a new
	// owner, prevent that by deleting that key/value pair
	delete req.body.shoe.owner

	Shoe.findById(req.params.id)
		.then(handle404)
		.then((shoe) => {
			// pass the `req` object and the Mongoose record to `requireOwnership`
			// it will throw an error if the current user isn't the owner
			requireOwnership(req, shoe)

			// pass the result of Mongoose's `.update` to the next `.then`
			return shoe.updateOne(req.body.shoe)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DESTROY
// DELETE /shoes/5a7db6c74d55bc51bdf39793
router.delete('/shoes/:id', requireToken, (req, res, next) => {
	Shoe.findById(req.params.id)
		.then(handle404)
		.then((shoe) => {
			// throw an error if current user doesn't own `shoe`
			requireOwnership(req, shoe)
			// delete the shoe ONLY IF the above didn't throw
			shoe.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

module.exports = router