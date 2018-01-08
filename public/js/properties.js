document.addEventListener('DOMContentLoaded', main);

// Choose the correct URL depending on if we are in production mode or not.
function chooseURL(subURL){
	console.log(window.origin);
	return window.origin + subURL;
}


function removeAllChildren(node){
	while(node.firstChild){
		node.removeChild(node.firstChild);
	}
}

function main(evt){
	// TODO: Add event listeners for each property after load.


	// This is the button that adds a new property to the page.
	const createPropBtn = document.querySelector('.createBtn')
	console.log(createPropBtn);
	createPropBtn.addEventListener('click', createNewProperty);

	//This div contains the main content on the page.
	const contentDiv = document.querySelector('#content');

	//Button at the end of creating new property that adds a property.
	const sendPropBtn = document.querySelector('#sendPropBtn');
	sendPropBtn.addEventListener('click', createProperty);

	// Handle file selects
	document.getElementById('getFile').addEventListener('change', handleFileSelect, false);

	function createProperty(evt){
		evt.preventDefault();

		const formData = new FormData(document.querySelector('#newPropForm'));

		let propName = document.querySelector('#propertyNameInput').value;

		// TODO: Have checks for data input and make popups if no input.
		if(propName !== ""){
			const req = new XMLHttpRequest();
			
			const url = chooseURL('/api/properties/create');
			req.open('POST', url, true);
			req.setRequestHeader('Content-Type', 
				'application/x-www-form-urlencoded; charset=UTF-8');
			
			req.onload = function(){
				//Useful code for changing window's url location after post.
				//window.location = "/leases";

				// After we have posted the new property, add a div to sidebar.
				// Give it an event listener so that when it's clicked, we 
				// issue an xmlhttprequest for the property it is associated with.
				/*
			        <div class="property">
			        	<span class="prop-name">Property #1</span>
			        	<span class="prop-field">Field #1</span>
			        </div>	
		        */		
		        const sidebarProps = document.querySelector('#sidebarProperties');
		        let propName = document.querySelector('#propertyNameInput').value;
		        //let propField = document.querySelector('#soflow').value;
		        let propField = document.querySelector('#propManager').value;

				let newProperty = document.createElement('div');
				newProperty.classList.add('property');
				let propNameSpan = document.createElement('span');
				propNameSpan.classList.add('prop-name');
				propNameSpan.textContent = propName;
				let propFieldSpan = document.createElement('span');
				propFieldSpan.classList.add('prop-field');
				propFieldSpan.textContent = propField;

				newProperty.appendChild(propNameSpan);
				newProperty.appendChild(propFieldSpan);
				sidebarProps.appendChild(newProperty);
				newProperty.addEventListener('click', getProperty);



				// Also, we want to change all the form inputs now into text and scroll
				// to top of content div.
				//Button at the end of creating new property that adds a property.

				//Main content div
				const contentDiv = document.querySelector('#content');

				const sendPropBtn = document.querySelector('#sendPropBtn');

			};
			
			let params = createPostParams(formData);
			req.send(params);

		}		
	}

	function createNewProperty(evt){
		evt.preventDefault();	

		removeAllChildren(contentDiv);

		console.log('whatsapp');
	}

	//This function is called when a property is clicked.
	function getProperty(evt){
		console.log("hi");
	}

}

// Get all the params and values from the form data and put them into a string.
function createPostParams(formData){
	let parameters = "";
	for(let pair of formData.entries()){
		pair2clean = pair[1].toString().split(" ").join("%20");
		parameters = parameters + pair[0] + "=" + pair2clean + "&";
	}
	return parameters.substr(0, parameters.length-1);
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

