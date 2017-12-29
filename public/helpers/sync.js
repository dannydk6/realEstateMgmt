const fs = require('fs');

const p = new Promise(function(fulfill, reject) {
  fulfill('Success!');
});
p.then(function(val) {
  console.log(val);
})

fs.readFile("default.json", 'utf8', function(err, data){
		if (err) {
			console.log('\nThere was an error loading the file.\n'); 
			data = undefined;
		} else {
			let attacks = JSON.parse(data).attacks;

			console.log(attacks[0]);
	}
});