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
router.get('/properties', function(req, res) {
	console.log(req.query);

	User.find({slug: req.query.username}, (err, user) =>{
		let prop = user[0].properties.find(x => x.slug === req.query.slug);
		console.log(prop);
		res.json(prop);
	});

	
});


router.post('/properties/create', (req, res) => {
	User.find({slug: req.body.username}, 
		(err, user) => {
		//Run through all properties and check if 
		// there exists a property with this name already.
		// If there does, make a slug with a tag saying which
		// one.
		let sum = 0;
		user[0].properties.forEach((prop)=>{
			if(prop.name === req.body['prop-name']){
				sum++;
			}
		});

		let mySlug = "";

		if(sum > 0){
			mySlug = req.body['prop-name'].split(' ').join('-') + "-" + (sum+1);
		}else{
			mySlug = req.body['prop-name'].split(' ').join('-');
		}
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
		slug: mySlug
		//propertyImage: req.body['img-file']
		});

		User.findOneAndUpdate({username: req.body.username}, {$push: {properties: newProperty} } ,
		(err, newProp) => {
			if(err){
				return res.send(500, 'Error occurred: database error.'); 
			}
			res.json({slug: newProperty.slug});
		});	
	});
});




module.exports = router;