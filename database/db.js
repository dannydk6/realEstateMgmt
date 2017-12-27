// 1ST DRAFT DATA MODEL
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const URLSlugs = require('mongoose-url-slugs');

mongoose.Promise = global.Promise;

const Property = new mongoose.Schema({
  name: String
})

// Users
// * our site requires authentication...
// * users have a username and password
const User = new mongoose.Schema({
  // username provided by authentication plugin
  // password hash provided by authentication plugin
  name: {first: String, middle: String, last: String},
  // User email
  email: String,
  // Company Name
  company: String,
  // status: Admin > Supervisor > Property Manager > Property Accountant
  status: String,
  //Picture of the company logo
  logo: String,
  // A picture of user's signature. Maybe we can implement signing with cursor?
  signature: String,
  //Contact for user
  phone: {number: String, ext: String},
  //Company Address
  address: {street: String, city: String, st: String, zip: String},

  // Array of properties for user to access. Only supervisor has array
  // of properties.
  properties: [Property]

});

// Passport is for authentication, slugs is to make a page for user.
User.plugin(passportLocalMongoose);
User.plugin(URLSlugs('username __v'));

// "register" database schemas so that database knows about them
mongoose.model('User', User);

// Initialize string that will be passed to mongoose.connect
// for connecting to the database.
let dbconf;

// is the environment variable, NODE_ENV, set to PRODUCTION? 
if (process.env.NODE_ENV === 'PRODUCTION') {
  // If we're in PRODUCTION mode, read environment variable to get
  // authenticated mongo database session.
  dbconf = process.env.MONGODB_URI;
} else {
 // if we're not in PRODUCTION mode, then use local database.
  dbconf = 'mongodb://localhost/remgt';
}

mongoose.connect(dbconf, {useMongoClient: true});


