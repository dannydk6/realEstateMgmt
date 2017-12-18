// 1ST DRAFT DATA MODEL
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.Promise = global.Promise;

// a container for storing water
// * includes the container, quantity of water, unit used, and link to image. 
const Container = new mongoose.Schema({
  container: String,
  quantity: Number,
  unit: String, 
  img: String
});

//A log for the day.
// * includes the container, quantity of water, unit used, and date of log.
const Log = new mongoose.Schema({
  container: String, 
  quantity: Number, 
  unit: String,
  date: {month: Number, day: Number, year: Number, string: String}//, 
  //img: String//, 
});


/* Not used in final project.
// A date consisting of water logs
// * each log must have a related user
// * a log can have 0 or more items
const Dates = new mongoose.Schema({
  //user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  month: Number,
  day: Number,
  year: Number,
  logs: [Log]
});
 Not used in final project. */

// users
// * our site requires authentication...
// * so users have a username and password
// * they also can have 0 or more date logs.
const User = new mongoose.Schema({
  // username provided by authentication plugin
    // password hash provided by authentication plugin
  first_name: String,
  last_name: String,
  email: String,
  //dates: [{type: mongoose.Schema.Types.ObjectId, ref: 'Dates'}] not used
  logs: [Log],
  preferences: {preferredUnit: String, dailyGoal: Number},
  customBottles: [Container]
});

User.plugin(passportLocalMongoose);

// "register" them so that mongoose knows about it
mongoose.model('User', User);
mongoose.model('Container', Container);
mongoose.model('Log', Log);
//mongoose.model('Dates', Dates);

// Initialize string that will be passed to mongoose.connect
let dbconf;

// is the environment variable, NODE_ENV, set to PRODUCTION? 
if (process.env.NODE_ENV === 'PRODUCTION') {
  // if we're in PRODUCTION mode, then read the configration from a file
  // use blocking file io to do this...


  // our configuration file will be in json, so parse it and set the
  // connection string appropriately!
  
  dbconf = process.env.MONGODB_URI;
} else {
 // if we're not in PRODUCTION mode, then use
  dbconf = 'mongodb://localhost/waterlogger';
}


mongoose.connect(dbconf, {useMongoClient: true});


