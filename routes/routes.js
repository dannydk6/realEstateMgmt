const express = require('express'), 
    router = express.Router(),
    passport = require('passport'),
    mongoose = require('mongoose');

const User = mongoose.model('User');

let months = [0,1,2,3,4,5,6,7,8,9,10,11];

// Using higher ordered functions for mapping months to dates.
months = months.map((word) => {return word + 1;});

const monthNames = [ "January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December" ];

router.get('/', (req, res) => {

	if(req.user === undefined){
		res.redirect('/login');
	}else{
		// We first must filter today's responses using today's date. 
		// I'm not going to deal with time zones...
		let todayDate = new Date();
		const dateObj = {month: months[todayDate.getMonth()], 
						day: +todayDate.getDate(), year: +todayDate.getFullYear()};

		// Use filter to get all of today's logs.
		let todayLogs = req.user.logs.filter((logs) => {
			return logs.date.month === dateObj.month &&
				   logs.date.day === dateObj.day &&
				   logs.date.year === dateObj.year;
		});

		// In settings, this is the unit to display.
		const unit = req.user.preferences.preferredUnit;

		console.log(unit);
		// Reduce all of today's logs to a total
		let todaySum = todayLogs.reduce((total, log) => {
			console.log(convertUnit(unit,log));
			return total + convertUnit(unit, log);

		}, 0.0); 

		if(unit === "L"){
			todaySum = todaySum.toFixed(1);
		}else{
			todaySum = Math.round(todaySum);
		}

		// Round to whole numbers so it looks better (presentation wise)
		// Get the percent goal to display for client.
		percentGoal = Math.round((todaySum/req.user.preferences.dailyGoal)*100) + "";

		let fillNum;
		let message;


		if(percentGoal === "0"){
			fillNum = 0;
		}else if(percentGoal.length > 2){
			fillNum = 10;
			message = "Good job making your goal today!"
		}else{
			fillNum = +percentGoal[0];
		}


		percentGoal += "%";

		res.render('index', {todaySum: todaySum, percentGoal:percentGoal, 
			todayLogs:todayLogs, fillNum:fillNum, message: message || ""});
	}

});

router.get('/addWater', (req, res) => {
	if(req.user === undefined){
		res.redirect('/login');
	}else{
		if(req.user.customBottles.length > 0){
			res.render('addWater', {areBottles: 1});
		}else{
			res.render('addWater');
		}
		
	}

});

router.post('/addWater', (req,res) => {
	//if(req.body.container !== "" && req.body.quantity !== ""){
		const date = new Date();

		const dateObj = {month: months[date.getMonth()], 
						day: +date.getDate(), year: +date.getFullYear()};

		dateObj.string = dateObj.month + "/" + dateObj.day + "/" + dateObj.year;

		/*let newLog = new Log({container: req.body.container,
			quantity: req.body.quantity, unit: req.body.unit, date: dateObj});

		User.findOneAndUpdate({_id: req.user.id}, {$push: {logs: newLog} } ,
			function(err, img, count){
				console.log(err, newLog, count);
				res.redirect('/');
			});
		*/
	//}else{
		console.log("You didn't input anything dude.");
		res.redirect('/');
	//}
	
});

router.get('/preferences', (req, res) => {
	if(req.user === undefined){
		res.redirect('/login');
	}else{
		res.render('preferences');
	}
});

router.get('/history', (req, res) => {
	if(req.user === undefined){
		res.redirect('/login');
	}else{
		res.render('history');
	}	
});

router.get('/customBottle', function(req, res) {
	if(req.user === undefined){
		res.redirect('/login');
	}else{
		res.render('customBottle');
	}	
});

router.post('/customBottle', function(req, res) {
	/*if(req.body.container !== "" && req.body.quantity !== ""){
		
		let newContainer = new Container({container: req.body.container,
			quantity: req.body.quantity, unit: req.body.unit});

		User.findOneAndUpdate({_id: req.user.id}, {$push: {customBottles: newContainer} } ,
			function(err, newContainer, count){
				console.log(err, newContainer, count);
				res.redirect('/');
			});
	}else{
		console.log("You didn't input anything dude.");
		res.redirect('/');
	}*/
	res.redirect('/');
});

router.post('/preferences', (req,res) => {
	if(req.body.goal !== ""){

		User.findOneAndUpdate({_id: req.user.id}, 
			{preferences: {preferredUnit: req.body.unit, dailyGoal: req.body.goal}} ,
		function(err, newLog, count){
			console.log(err, newLog, count);
			res.redirect('/');
		});
	}else{
		res.redirect('/');
	}
	
});

router.get('/history/graph', (req, res) => {
	if(req.user === undefined){
		res.redirect('/login');
	}else{

  		let quantDate = req.user.logs.map((log) => {return {quantity: log.quantity, unit: log.unit, date: log.date.string}});

  		let allDates = [];

  		quantDate.forEach((log)=>{
  			if(!foundInArray(log.date, allDates)){
  				allDates.push({quantity: log.quantity, date: log.date});
  			}else{
  				allDates[indexForString(log.date, allDates)].quantity += Math.round(convertUnit(req.user.preferences.preferredUnit, log));
  			}
  		})

		// Map the log quantities to an array.
  		let allLogQuantities = allDates.map((log) => {return log.quantity;});

  		// Map log dates.
  		let allLogDates = allDates.map((log) => {return log.date;});

		res.render('graph',{quantities:allLogQuantities, dates:allLogDates});
	}
});

router.get('/login', function(req, res) {
  res.render('login');
});

router.post('/login', function(req,res,next) {
  passport.authenticate('local', function(err,user) {
    if(user) {
      req.logIn(user, function(err) {
        res.redirect('/');
      });
    } else {
      res.render('login', {message: 1});
    }
  })(req, res, next);
});

router.get('/signup', function(req, res) {
  res.render('signup');
});

router.post('/signup', function(req, res) {
	if(req.body.password === req.body.password_confirmation && req.body.password !== ""){
		User.find({email: req.body.email}, function(err, result){
			if(result.length == 0){
				User.register(new User({username:req.body.username, first_name: req.body.first_name,
				last_name: req.body.last_name, email: req.body.email, preferences:{preferredUnit: "oz", dailyGoal: 60}}), 
			    req.body.password, function(err, user){
			    	if (err) {
			      		res.render('signup',{message: "Your registration information is not valid."});
			    	} else {
			      		passport.authenticate('local')(req, res, function() {
			        	res.redirect('/login');
			      		});
			    	}
			  	});   
			}else{
				res.render('signup',{message: "This email already exists."});
			}
		});

	}else{
		res.render('signup',{message: "Your passwords did not match."});
	}
});

// =====================================
// LOGOUT ==============================
// =====================================
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});

function foundInArray(string, arr){
	for(let i = 0; i < arr.length; i++){
		if(arr[i].date === string){
			return true;
		}
	}
	return false;
}

function indexForString(string, arr){
	for(let i = 0; i < arr.length; i++){
		if(arr[i].date === string){
			return i;
		}
	}
}

function convertUnit(unit, log){
	if(unit === "oz"){
		if(log.unit === unit){
			return log.quantity;
		}else if (log.unit == "mL"){
			//Convert from mL to oz.
			return (log.quantity*0.033814);
		}else{ // oz to L
			return (log.quantity*33.814);
		}
	}else if(unit === "mL"){
		if(log.unit === unit){
			// no conversion necessary
			return log.quantity;
		}else if (log.unit == "oz"){
			//Convert from oz to mL.
			return log.quantity*29.5735;
		}else{ //  L to mL
			return log.quantity*.001;
		}
	}else{ // preferred unit is L (only 3 choices)
		if(log.unit === unit){
			// no conversion necessary
			return log.quantity;
		}else if (log.unit == "oz"){
			//Convert from oz to L.
			return log.quantity*0.0295735;
		}else{ //  mL to L.
			return log.quantity*.001;
		}
	}	
}

// route handlers go above
module.exports = router;