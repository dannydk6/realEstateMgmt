const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

// Upload images to server. In the future, upload files to amazon server rather than heroku.
router.post('/properties/img/upload', multer({ dest: './public/img/uploads/'}).single('img-file'), function(req,res){
	console.log(req.body); //form fields
	/* example output:
	{ title: 'abc' }
	 */
	console.log(req.file); //form files
	/* example output:
            { fieldname: 'img-file',
              originalname: 'grumpy.png',
              encoding: '7bit',
              mimetype: 'image/png',
              destination: './uploads/',
              filename: '436ec561793aa4dc475a88e84776b1b9',
              path: 'uploads/436ec561793aa4dc475a88e84776b1b9',
              size: 277056 }
	 */
	//const ext = req.file.mimetype.replace('image/', '.');
	const actualPath = req.file.path.replace(/public/, '');
	res.json({path:actualPath});
});

// Bring in mongoose model, Place, to represent a restaurant
const Property = mongoose.model('Property');
const User = mongoose.model('User');
const Building = mongoose.model('Building');

// TODO: create two routes that return json
// GET /api/places
// POST /api/places/create
// You do not have to specify api in your urls
// since that's taken care of in app.js when
// this routes file is loaded as middleware
router.get('/properties', function(req, res) {

	User.find({slug: req.query.username}, (err, user) =>{
		let prop = user[0].properties.find(x => x.slug === req.query.slug);
		console.log(prop);
		res.json(prop);
	});

});

// Use this route when we need a field from every single property
router.get('/allProperties', function(req,res) {

	User.find({slug: req.query.username}, (err,user)=>{
		let myResponse = [];
		if(req.query.type === "string"){
			user[0].properties.forEach((property)=>{
				myResponse.push({slug: property.slug + "_" + property.index, value: property[req.query.slug]});
			});
			res.json(myResponse);
		//This is when we want the owner name.			
		}else if(req.query.type === "name"){
			user[0].properties.forEach((property)=>{
				myResponse.push({slug: property.slug + "_" + property.index, value: property.owner.name});
			});
			res.json(myResponse);	
		}else if(req.query.type === "contact"){
			user[0].properties.forEach((property)=>{
				myResponse.push({slug: property.slug + "_" + property.index, 
				value: property.contact.salutation + " " + property.contact.first_name + " " +
				property.contact.last_name});
			});
			res.json(myResponse);	
		}else{
			// This lets you know there is no correct type sent.
			res.json({});
		}



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

		mySlug = mySlug.split('"').join('').split("'").join('').split('(').join('');
		mySlug = mySlug.split('<').join('').split('>').join('').split('.').join('');
		mySlug = mySlug.split(')').join('').split('/').join('').split("\/").join('');
		mySlug = mySlug.split('#').join('').split('&').join('').split(';').join('');
		if (!isNaN(mySlug.charAt(0))){
			tmp = mySlug;
			mySlug = "num" + tmp;
		}
		let newProperty = '';
		if(req.body['img-url'] !== undefined){
			newProperty = new Property({
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
			slug: mySlug,
			index: user[0].properties.length + 1,
			dateCreated: new Date(),
			propertyImage: req.body['img-url']
			//propertyImage: req.body['img-file']
			});
		}else{
			newProperty = new Property({
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
			slug: mySlug,
			index: user[0].properties.length + 1,
			dateCreated: new Date()
			//propertyImage: req.body['img-file']
			});			
		}

		User.findOneAndUpdate({username: req.body.username}, {$push: {properties: newProperty} } ,
		(err, newProp) => {
			if(err){
				return res.send(500, 'Error occurred: database error.'); 
			}
			res.json({slug: newProperty.slug, index: newProperty.index});
		});	
	});
});

//Update any new properties
router.post('/properties/update', (req, res) => {
	console.log('Image url: ' + req.body['img-url']);
	if(req.body['img-url'] !== undefined){
		User.findOneAndUpdate({slug: req.body.username, "properties.slug": req.body.propSlug},
					{$set: {"properties.$.name": req.body['prop-name'],
					"properties.$.address": {street: req.body['prop-street'], city: req.body['prop-city'],
					  st: req.body['prop-state'], zip: req.body['prop-zip']},
					"properties.$.owner": {name: req.body['landlord-name'], st: req.body['landlord-state'],
					address: {street: req.body['owner-street'], city: req.body['owner-city'],
					  st: req.body['owner-state'], zip: req.body['owner-zip']} },
					"properties.$.contact": {salutation: req.body['salutation']||'', 
					first_name: req.body['contact-first'],last_name: req.body['contact-last'], 
					title: req.body['contact-title']},
					"properties.$.manager": req.body['prop-manager'],
					"properties.$.accountant": req.body['prop-accountant'],
					"properties.$.propertyImage": req.body['img-url'] || ''
				}}, 
			(err, property) => {
			//Run through all properties and find
			// there exists a property with this slug.
			// Update that property with this info.

			res.json(req.body);
		});
	}else{
		User.findOneAndUpdate({slug: req.body.username, "properties.slug": req.body.propSlug},
					{$set: {"properties.$.name": req.body['prop-name'],
					"properties.$.address": {street: req.body['prop-street'], city: req.body['prop-city'],
					  st: req.body['prop-state'], zip: req.body['prop-zip']},
					"properties.$.owner": {name: req.body['landlord-name'], st: req.body['landlord-state'],
					address: {street: req.body['owner-street'], city: req.body['owner-city'],
					  st: req.body['owner-state'], zip: req.body['owner-zip']} },
					"properties.$.contact": {salutation: req.body['salutation']||'', 
					first_name: req.body['contact-first'],last_name: req.body['contact-last'], 
					title: req.body['contact-title']},
					"properties.$.manager": req.body['prop-manager'],
					"properties.$.accountant": req.body['prop-accountant']
				}}, 
			(err, property) => {
			//Run through all properties and find
			// there exists a property with this slug.
			// Update that property with this info.

			res.json(req.body);
		});		
	}
});

// Delete Property
// Update all property indices and send them to page
router.post('/properties/delete', (req, res) => {
	// TODO: Do something about slugs that will now be screwed if there are duplicates.
	// Basically check for all duplicates and then edit them.

	User.findOneAndUpdate({slug: req.body.username},
		{$pull: {"properties": {slug: req.body.propSlug}}}, 
		(err, user) => {

		let myIndex = user.properties.find(o => o.slug === req.body.propSlug).index - 1;
		console.log('\n\n\nThis my index: ' + myIndex);
		let newProperties = user.properties;
		console.log(newProperties);
		if(myIndex < newProperties.length - 1){
			for(let i = myIndex; i < newProperties.length; i++){
				newProperties[i].index -= 1;
			}
		}
		newProperties.splice(myIndex, 1);
		console.log('new props')
		console.log(newProperties);


		User.findOneAndUpdate({slug:req.body.username},
			{$set: {"properties": newProperties}},
			(err,user)=>{
				res.json({'message': 'deleted item'});
		});

	});
});

//Add a building to property
router.post('/properties/buildings/create', (req, res) => {
	console.log('img-url was undefined?' + req.body['img-url']);
	if(req.body['img-url'] !== undefined){
		console.log('Username: ' + req.body.username);
		User.find({slug: req.body.username},
			(err, myUser) => {
			//Run through all properties and find
			// there exists a property with this slug.
			// Update that property with this info.

			let mySlug = req.body.name.split(' ').join('');

			mySlug = mySlug.split('"').join('').split("'").join('').split('(').join('');
			mySlug = mySlug.split('<').join('').split('>').join('').split('.').join('');
			mySlug = mySlug.split(')').join('').split('/').join('').split("\/").join('');
			mySlug = mySlug.split('#').join('').split('&').join('').split(';').join('');
			if (!isNaN(mySlug.charAt(0))){
				tmp = mySlug;
				mySlug = "num" + tmp;
			}

			let myIndex = myUser[0].properties.find(o => o.slug === req.body.propSlug).index - 1;
			console.log('\n\n\nThis my index: ' + myIndex);
			const newProperties = myUser[0].properties;

			const newBuilding = new Building({
				name: req.body.name,
				slug: mySlug,
				address: {street:req.body.street, st: req.body.state,
					city:req.body.city, zip: req.body.zip},
				type: req.body.type,
				index: (newProperties[myIndex].buildings.length+1) || 1,
				dateCreated: new Date(),
				buildingImage: req.body['img-url']
			});

			newProperties[myIndex].buildings.push(newBuilding);

			User.findOneAndUpdate({slug: req.body.username}, 
				{$set: {"properties": newProperties}},
			(err, user)=>{
				res.json(newBuilding);

			});


		});		
	}else{
		console.log('Username: ' + req.body.username);
		User.find({slug: req.body.username},
			(err, myUser) => {
			//Run through all properties and find
			// there exists a property with this slug.
			// Update that property with this info.

			let mySlug = req.body.name.split(' ').join('');

			mySlug = mySlug.split('"').join('').split("'").join('').split('(').join('');
			mySlug = mySlug.split('<').join('').split('>').join('').split('.').join('');
			mySlug = mySlug.split(')').join('').split('/').join('').split("\/").join('');
			mySlug = mySlug.split('#').join('').split('&').join('').split(';').join('');
			if (!isNaN(mySlug.charAt(0))){
				tmp = mySlug;
				mySlug = "num" + tmp;
			}

			let myIndex = myUser[0].properties.find(o => o.slug === req.body.propSlug).index - 1;
			console.log('\n\n\nThis my index: ' + myIndex);
			const newProperties = myUser[0].properties;

			const newBuilding = new Building({
				name: req.body.name,
				slug: mySlug,
				address: {street:req.body.street, st: req.body.state,
					city:req.body.city, zip: req.body.zip},
				type: req.body.type,
				index: (newProperties[myIndex].buildings.length+1) || 1,
				dateCreated: new Date()
			});

			newProperties[myIndex].buildings.push(newBuilding);

			User.findOneAndUpdate({slug: req.body.username}, 
				{$set: {"properties": newProperties}},
			(err, user)=>{
				res.json(newBuilding);

			});


		});		
	}
});

router.get('/properties/buildings', function(req, res) {

	User.find({slug: req.query.username}, (err, user) =>{
		let prop = user[0].properties.find(x => x.slug === req.query.propSlug);
		console.log('Property: ' + prop);
		let building = prop.buildings.find(x => x.slug === req.query.buildSlug);
		console.log('Building: ' + building);
		res.json(building);
	});

});



module.exports = router;