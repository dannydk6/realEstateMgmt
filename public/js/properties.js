document.addEventListener('DOMContentLoaded', main);

// Choose the correct URL depending on if we are in production mode or not.
function chooseURL(subURL){
	return window.origin + subURL;
}


function removeAllChildren(node){
	while(node.firstChild){
		node.removeChild(node.firstChild);
	}
}

function main(evt){
	// This is the button that adds a new property to the page.
	const createPropBtn = document.querySelector('.createBtn')
	console.log(createPropBtn);
	createPropBtn.addEventListener('click', createNewProperty);

	//This div contains the main content on the page.
	const contentDiv = document.querySelector('#content');

	//Button at the end of creating new property that adds a property.
	const sendPropBtn = document.querySelector('#sendPropBtn');
	sendPropBtn.addEventListener('click', createProperty);

	// 
	document.getElementById('getFile').addEventListener('change', handleFileSelect, false);

	function createProperty(evt){
		evt.preventDefault();

		const form = document.querySelector('#newPropForm'));
		
		function sendData(){
			const formData = new FormData(form);

			// TODO: Have checks for data input and make popups if no input.
			if(true){
				const req = new XMLHttpRequest();
				
				const url = chooseURL('/api/properties/create');
				req.open('POST', url, true);
				req.setRequestHeader('Content-Type', 
					'application/x-www-form-urlencoded; charset=UTF-8');
				/* Useful code for changing window's url location after post.
				req.onreadystatechange = function(){
					window.location = "/leases";
				};
				*/
				//let params = createPostParams(formData);
				
				req.send(formData);

			}					
		}

  		// ...and take over its submit event.
  		form.addEventListener("submit", function (event) {
    		event.preventDefault();
    		sendData();
  		});


	}

	function createNewProperty(evt){
		evt.preventDefault();	

		removeAllChildren(contentDiv);

		console.log('whatsapp');
	}

}

function handleFileSelect(evt) {
    const file = evt.target.files[0]; // File object submitted by user
  
	// Only process image files.
	if (file.type.match('image.*')) {

		var reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function(theFile) {
		return function(e) {
		  // Render image in image div.
		  const photoDiv = document.querySelector('#property-photo');

		  // Delete the old photo in div if it exists
		  const oldPhoto = document.getElementById('propImg');

		  // If there was nothing there, then 
		  if(oldPhoto !== null){
		  	photoDiv.removeChild(oldPhoto);
		  }

		  const propImg = document.createElement('img');
		  propImg.src = e.target.result;
		  propImg.title = escape(theFile.name);
		  propImg.id = 'propImg';
		  propImg.classList.add('propImg');

		  photoDiv.appendChild(propImg);

		};
		})(file);

		// Read in the image file as a data URL.
		reader.readAsDataURL(file);
    }
}

