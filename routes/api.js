const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Bring in mongoose model, Place, to represent a restaurant
const Property = mongoose.model('Property');
const User = mongoose.model('User');

// TODO: create two routes that return json
// GET /api/places
// POST /api/places/create
// You do not have to specify api in your urls
// since that's taken care of in app.js when
// this routes file is loaded as middleware
router.get('/places', function(req, res) {
	console.log(req.query.cuisine);

	if(req.query.location === undefined && req.query.cuisine === undefined){
		Place.find({}, function(err, places) {
		res.json(places.map(function(ele) {
			return {
				'name': ele.name,
				'cuisine': ele.cuisine,
				'location': ele.location
			}; 
		}));
		});
	}
	else if(req.query.location === undefined && req.query.cuisine !== undefined){
		Place.find({'cuisine': req.query.cuisine}, function(err, places) {
		res.json(places.map(function(ele) {
			return {
				'name': ele.name,
				'cuisine': ele.cuisine,
				'location': ele.location
			}; 
		}));
		});
	}else if(req.query.location !== undefined && req.query.cuisine === "All"){
		Place.find({'location': req.query.location}, 
			function(err, places) {
		res.json(places.map(function(ele) {
			return {
				'name': ele.name,
				'cuisine': ele.cuisine,
				'location': ele.location
			}; 
		}));
		});
	} else {
		Place.find({'cuisine': req.query.cuisine, 'location': req.query.location}, 
			function(err, places) {
		res.json(places.map(function(ele) {
			return {
				'name': ele.name,
				'cuisine': ele.cuisine,
				'location': ele.location
			}; 
		}));
		});
	}
});


router.post('/properties/create', (req, res) => {

	const newProperty = new Property({
	name: req.body['prop-name'],
	address: {street: req.body['prop-street'], city: req.body['prop-city'],
			  st: req.body['prop-state'], zip: req.body['prop-zip']},
	owner: {name: req.body['landlord-name'], st: req.body['landlord-state'],
			address: {street: req.body['owner-street'], city: req.body['owner-city'],
			  st: req.body['owner-state'], zip: req.body['owner-zip']} },
	contact: {salutation: req.body['salutation']||'', first_name: req.body['contact-first'],
			  last_name: req.body['contact-last'], title: req.body['contact-title']},
	manager: req.body['prop-manager'],
	accountant: req.body['prop-accountant'],
	//propertyImage: req.body['img-file']
	});

	User.findOneAndUpdate({username: req.body.username}, {$push: {properties: newProperty} } ,
	(err, newProp) => {
		if(err){
			return res.send(500, 'Error occurred: database error.'); 
		}
		console.log(err, newProp);
		res.json({slug: newProp});
	});

 });

module.exports = router;