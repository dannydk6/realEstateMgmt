const express = require('express'), 
    router = express.Router(),
    passport = require('passport'),
    mongoose = require('mongoose');

const User = mongoose.model('User');

// The main page when users log in.
router.get('/', (req, res) => {
	if(req.user !== undefined){
		//TODO: Redirect back to home after i finish working on properties page.
		res.redirect('/properties');
	}else{
		res.redirect('/login');
	}

});

// Home page for users.
router.get('/home', (req, res) => {
	if(req.user !== undefined){
		res.render('user/home', { layout:"layouts/user", title: "Home"});
	}else{
		res.redirect('/login');
	}
	
});

// All properties a user has.
router.get('/properties', (req, res) => {
	if(req.user !== undefined){
		res.render('user/properties2', { layout:"layouts/user2", title: "Properties", myUser: req.user});
	}else{
		res.redirect('/login');
	}
	
});

// All leases.
router.get('/leases', (req, res) => {
	if(req.user !== undefined){
		res.render('user/leases', { layout:"layouts/user", title: "Leases", myUser: req.user});
	}else{
		res.redirect('/login');
	}
	
});

// All tenants.
router.get('/tenants', (req, res) => {
	if(req.user !== undefined){
		res.render('user/tenants', { layout:"layouts/user", title: "Leases"});
	}else{
		res.redirect('/login');
	}
	
});

// All tenants.
router.get('/reports', (req, res) => {
	if(req.user !== undefined){
		res.render('user/reports', { layout:"layouts/user", title: "Leases"});
	}else{
		res.redirect('/login');
	}
	
});

// The main page when users log in.
router.get('/login', (req, res) => {
	// if the query string says there was a successful register, set up a message in login screen.
	if(req.query.register){
		const message = {strong: "Registration successful!", text:"Log in below.", style:"alert alert-success"};
		res.render('ui/login', { title: 'Login',layout: 'layouts/ui', message: message});
	}else{
		// if no query string for register, then do a normal render.
		res.render('ui/login', { title: 'Login',layout: 'layouts/ui'});
	}
});

// Log a user in who is part of our user group.
router.post('/login', function(req,res,next) {
  passport.authenticate('local', function(err,user) {
    if(user) {
    	req.logIn(user, function(err) {
    		if(user.group === "admin"){
    			//res.redirect('/admin/home');
    			// Just send us all to home for now.
    			res.redirect('/home');
    		} else {
    			res.redirect('/home');
    		}
    	});
    } else {
    	const message = {strong: "Oh no!", text:"User does not exist or password does not match.", style:"alert alert-danger"};
    	res.render('ui/login', { title: 'Login',layout: 'layouts/ui', message: message});
    }
  })(req, res, next);
});

// User registration page.
router.get('/register', (req, res) => {
	res.render('ui/register', { title: 'Registration', layout: 'layouts/ui' });
});

// =====================================
// Handle Registering new user =========
// =====================================
router.post('/register', (req,res) => {
	if(req.body.password === req.body.password_confirmation && req.body.password !== ""){
		User.find({email: req.body.email}, function(err, result){
			if(result.length == 0){
				User.find({},function(err, result){
					console.log(req.body.first_name);
					User.register(new User({username:req.body.username, name: {first:req.body.first_name,
					last: req.body.last_name}, email: req.body.email, company: req.body.company,
					status: (process.env.GROUP || "admin"), joined: new Date()}), 
				    req.body.password, function(err, user){
				    	if (err) {
				      		res.render('ui/register',{title: 'Registration',layout: 'layouts/ui', 
				      			message: "Your registration information is not valid."});
				    	} else {
				      		passport.authenticate('local')(req, res, function() {
				        		res.redirect('/login?register=success');
				      		});
				    	}
				  	});
				});
   
			}else{
				res.render('ui/register',{title: 'Registration',layout: 'layouts/ui', 
					message: "This email already exists."});
			}
		});

	}else{
		res.render('ui/register',{title: 'Registration',layout: 'layouts/ui', 
					message: "Your passwords did not match."});
	}
});

// Go here to send an email if you forgot your password.
router.get('/forgot-password', (req,res) => {
	res.render('ui/forgot-password', { title: 'Forgot Password',layout: 'layouts/ui' });
});

// =====================================
// LOGOUT ==============================
// =====================================
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});

// route handlers go above
module.exports = router;