// 1ST DRAFT DATA MODEL
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const URLSlugs = require('mongoose-url-slugs');

mongoose.Promise = global.Promise;

// Schema to use for HVAC, Roof, & Utility Services
const Service = new mongoose.Schema({
  system: String,
  installed: Date,
  // Company that serviced.
  servicer: String,
  // All maintenances made for service. 
  // Can be used to get most recent maintenance
  maintenance: [{date: Date, note: String}],
  // link to service contractx
  contract: String
});

const Suite = new mongoose.Schema({
  // Building of Suite
  building: String,
  // The floor of the suite
  floor: String,
  // Specific space on floor, like 100a, 100b
  suite: String,
  // Type: Retail, Office, Residential, Industrial
  type: String,
  gross_sqft: Number,
  rentable_sqft: Number,
  //submetered used to track electrical consumption
  submetered: Boolean,
  // status: vacant (default), occupied, under renovation
  // Status changes automatically based on lease.
  status: String,
  // Image of floor plan
  floor_plan: String
});

const Property = new mongoose.Schema({
  // Property Name
  name: String,

  // Slug to search property
  slug: String,
  // type: Office, Retail, Residential, Industrial.
  type: String,
  //Property Address
  address: {street: String, city: String, st: String, zip: String},
  // This includes the owner's name, state of incorporation, and company address.
  owner: {name: String, st: String, 
  address: {street: String, city: String, st: String, zip: String}},

  // This is the owner's contact person for this property.
  contact: {salutation: String, first_name: String, last_name: String, title: String},

  // Which user is the manager for this property?
  //manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  manager: String,

  //Which user is the accountant?
  //accountant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  accountant: String,

  propertyImage: String,

  // Array of suites in a property.
  suites: [Suite],

  // Services for the property.
  hvac: [Service],
  roof: [Service],
  utilities: [Service],

  acuisition_docs: [{name: String, date: Date, document: String}],

  //Index in the Properties Array. Use this for sorting.
  index: Number,
  // This is the date the property was created on.
  dateCreated: Date

});


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

  // Allows linking users to supervisor.
  supervisor: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},

  // Array of properties for user to access. Only supervisor has array
  // of properties.
  properties: [Property],

  preferences: {preferredField: String, sortConditions: String}

});

// Passport is for authentication, slugs is to make a page for user.
User.plugin(passportLocalMongoose);
User.plugin(URLSlugs('username __v'));

// "register" database schemas so that database knows about them
mongoose.model('User', User);
mongoose.model('Property', Property);
mongoose.model('Service', Service);
mongoose.model('Suite', Suite);

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


