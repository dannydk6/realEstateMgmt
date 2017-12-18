require('./db');
require('./auth');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');

const app = express();

// enable sessions
const session = require('express-session');
const sessionOptions = {
    secret: process.env.SECRET || 'secret message fiend!',
    resave: true,
    saveUninitialized: true
};
app.use(session(sessionOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// body parser setup
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// User authentication
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

// Make User Data Available to All Templates
app.use(function(req, res, next){
	res.locals.user = req.user;
	next();
});

const baseRoutes = require('./routes/routes');


app.use('/', baseRoutes);

app.listen(process.env.PORT || 3000);