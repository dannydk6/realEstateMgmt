require('./database/db');
require('./auth');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const app = express();

// Create a server and then socket.io integration.
const server = require('http').Server(app);

// Enable socket.io, for sync communication between clients.
const io = require('socket.io')(server);

// enable sessions
const session = require('express-session');

// Enable session storage in mongo database.
const MongoStore = require('connect-mongo')(session);

// Session option defaultscc
let sessionOptions = {
    secret: process.env.SECRET || 'secret message fiend!',
    resave: true,
    saveUninitialized: true,
    httpOnly: true
};

// If we are in production, add a mongo store for sessions.
if(process.env.NODE_ENV === "PRODUCTION"){
	sessionOptions.store = new MongoStore({url: process.env.MONGODB_URI})
}

const sessionMiddleware = session(sessionOptions);

// Store data on sessions using sessionOptions.
app.use(sessionMiddleware);

io.use(function(socket, next) {
	sessionMiddleware(socket.request, socket.request.res, next);
});

// Set templating and body parsing.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// body parser setup
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

//Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// User authentication
app.use(passport.initialize());
app.use(passport.session());

// Serialize and deserialize users, making their info available.
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

// Make User Data Available to All Templates
app.use(accessUserData);

// middleware for accessing user data.
function accessUserData(req, res, next){
	res.locals.user = req.user;
	next();
}

// A router for all routes starting with '/'
const baseRoutes = require('./routes/routes');
app.use('/', baseRoutes);

app.use(express.urlencoded({extended: false}));
const api = require('./routes/api');
app.use('/api', api);

// Use this router for handling admin requests.
const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

// This is the port that our website is served on.
const PORT = process.env.PORT || 5000;

// Listen in on requests to our defined port.
server.listen(PORT, () => console.log(`Listening on ${ PORT }`))
