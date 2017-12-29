const express = require('express'), 
    router = express.Router(),
    passport = require('passport'),
    mongoose = require('mongoose');

const User = mongoose.model('User');

router.get('/home', (req, res) =>{
	if(req.user !== undefined){
		if(req.user.group === "admin"){
			res.render('admin/home', { layout: 'layouts/admin', title: 'Home'});
		}else{
			res.redirect('/home');
		}
	}else{
		res.redirect('/home');
	}
});

// route handlers go above
module.exports = router;