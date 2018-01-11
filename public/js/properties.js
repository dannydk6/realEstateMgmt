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
	// TODO: Add event listeners for each property after load.
	const sidebarProps = document.querySelector('#sidebarProperties');
	for(let i = 0; i < sidebarProps.children.length; i++){
		sidebarProps.children[i].addEventListener('click', getProperty);
	}

	// This is the button that adds a new property to the page.
	const createPropBtn = document.querySelector('.createBtn')
	console.log(createPropBtn);
	createPropBtn.addEventListener('click', createNewProperty);

	// This div wraps the overflow. Manipulate this div for getting to certain areas for scrolling.
	const mainWrap = document.querySelector('#mainWrap');
	//This div contains the main content on the page.
	const contentDiv = document.querySelector('#content');

	// This span is the property name sorting button.
	const propNameSort = document.querySelector('#propSort');
	propNameSort.addEventListener('click', sortPropertiesNames);

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
			        <div class="property" id={{slug}}>
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
				//Use slug as property id.
				newProperty.id = JSON.parse(req.responseText).slug + "_" + JSON.parse(req.responseText).index;

				newProperty.addEventListener('click', getProperty);

				if(propNameSort.classList.contains('sorted')){
					sortPropertiesNames();
				}

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

	// This function controls what happens when a property is edited.
	function editProperty(evt){

		// Do an xmlhttprequest for the property
		const req = new XMLHttpRequest();
		let url = chooseURL('/api/properties?');
		url += "slug=" + document.querySelector('#hiddenVal').value;
		const username = document.querySelector('#username').value;
		url += "&username=" + username;
		console.log(url);

		req.open('GET', url, true);
		req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400){
			console.log(req.responseText);
			const data = JSON.parse(req.responseText);
			const contentDiv = document.querySelector('#content');
			removeAllChildren(contentDiv);

			contentDiv.classList.remove('contentRead');
			contentDiv.classList.add('contentWrite');

			const newPropForm = document.createElement('form');
			newPropForm.id = "newPropForm";

			contentDiv.appendChild(newPropForm);

			const formGroup = document.createElement('div');

			//Property name input
			formGroup.classList.add('form-group');
			formGroup.innerHTML = '<input type="text" class="form-control" id="propertyNameInput"'+ 
			'placeholder="Enter Property Name" name="prop-name" value="' + data.name +'">'; 

			newPropForm.appendChild(formGroup);

			const formDivider = document.createElement('div');
			formDivider.id = "form-divider";

			newPropForm.appendChild(formDivider);

			// These are the headers for the forms
			const formHeaders = document.createElement('div');
			formHeaders.id = "form-headers";
			formHeaders.innerHTML = '<label id="addressHeader">Address:</label><label id="ownerHeader">Owner:</label>' +
	            '<span>Owner</span><label id="ownerAddress">Address:</label><span>Owner</span>' +
	            '<label id="ownerContact">Contact:</label>'+
	            '<label id="propertyManager">Property Manager:</label>'+
	            '<label id="propertyAccountant">Property Accountant:</label>';
	        formDivider.appendChild(formHeaders);

	        const formInputs = document.createElement('div');

	        formInputs.id = "form-inputs";

	        //Put the username in the form (its really the slug)
	        let username = document.querySelector('#username').value;
	        formInputs.innerHTML = "<input type='hidden' name='username' value='" + username + "'>";

	        // Property Address Inputs
	        formInputs.innerHTML += '<input type="text" class="form-control" id="streetInput"' + 
	        	'placeholder="Enter Street" name="prop-street" value="' + data.address.street+'">' +
	            '<input type="text" class="form-control" id="cityInput"'+
	            'placeholder="Enter City" name="prop-city" value="' + data.address.city+'">' +
	            '<input type="text" class="form-control" id="stateInput" '+
	            'placeholder="Enter State" name="prop-state" value="' + data.address.st + '">' +
	            '<input type="text" class="form-control" id="zipInput"'+
	            'placeholder="Enter Zip Code" name="prop-zip" value="' + data.address.zip+'"><br>';
			
			//Landlord Name and State of Incorp.
			formInputs.innerHTML += '<input type="text" class="form-control" id="landlordInput" '+
				'placeholder="Enter Landlord" name="landlord-name" value="'+data.owner.name+'">' +
	            '<input type="text" class="form-control" id="landlordStateInput" '+
	            'placeholder="Enter Landlord State of Incorporation" value="'+data.owner.st+'" name="landlord-state"><br>';
	        
	        // Owner Address
	        formInputs.innerHTML += '<input type="text" class="form-control" id="ownerStreetInput" value="'+ data.owner.address.street +'"placeholder="Enter Street" name="owner-street">' +
	            '<input type="text" class="form-control" id="ownerCityInput" placeholder="Enter City" name="owner-city" value="'+ data.owner.address.city +'">'+
	            '<input type="text" class="form-control" id="ownerStateInput" placeholder="Enter State" name="owner-state" value="'+data.owner.address.st+'">' +
	            '<input type="text" class="form-control" id="ownerZipInput" placeholder="Enter Zip Code" name="owner-zip" value="'+data.owner.address.zip+'"><br>';

	        // Contact for Owner
	        formInputs.innerHTML += '<div id="radioSalutation">Select Salutation:</div> &nbsp;';

	        formInputs.innerHTML +=
	            '<input type="radio" name="salutation" value="Ms."> Ms. &nbsp;'+
	            '<input type="radio" name="salutation" value="Mr."> Mr. &nbsp;'+
	            '<input type="radio" name="salutation" value="Dr."> Dr. &nbsp;';
	        formInputs.innerHTML +=
	            '<input type="text" class="form-control" id="contactFirst" placeholder="Enter First Name" name="contact-first" value="'+data.contact.first_name+'">'+
	            '<input type="text" class="form-control" id="contactLast" placeholder="Enter Last Name" name="contact-last" value="'+data.contact.last_name+'">'+
	            '<input type="text" class="form-control" id="contactTitle" placeholder="Enter Title" name="contact-title" value="'+data.contact.title+'"><br>';
	        
	        formInputs.innerHTML += '<select class="form-control" id="propManager" name="prop-manager">'+
	            '<option>John Doe</option><option>Sally Mae</option><option>Robby Robertson</option></select>'+
	            '<br><select class="form-control" id="propAccountant" name="prop-accountant">' +
	            '<option>John Doe</option><option>Sally Mae</option><option>Robby Robertson</option>'+
	            '</select><br><div id="bottomOfContent">' + 
	            '<button id="sendPropBtn" class="btn btn-primary">Create Property</button></div><br>';
	        formDivider.appendChild(formInputs);
			//Button at the end of creating new property that adds a property.
			const sendPropBtn = document.querySelector('#sendPropBtn');
			sendPropBtn.addEventListener('click', updateProperty);

			const propPhoto = document.createElement('div');
			propPhoto.id = "property-photo";
			propPhoto.classList.add('clickable');
			propPhoto.innerHTML = 'Add Property Photo' +
	        '<input type="file" id="getFile" accept="image/*" name="img-file"/>' +
	        '<i class="fa fa-search" id="searchIcon"></i>';

	        contentDiv.appendChild(propPhoto);

			// Handle file selects
			document.getElementById('getFile').addEventListener('change', handleFileSelect, false);	
			

			
		} });
		req.send();		
	}

	// This controls what the create new property button does in the top left.
	// Makes an editable interface to add a new property.
	function createNewProperty(evt){
		evt.preventDefault();	

		const currSelection = document.querySelector('.propertySelected');

		// Depending on which property is selected, we will deselect
		// and select the appropriate property in the sidebar.
		if(currSelection !== null){
			currSelection.classList.remove('propertySelected');
			currSelection.classList.add('property');
		}

		removeAllChildren(contentDiv);

		contentDiv.classList.remove('contentRead');
		contentDiv.classList.add('contentWrite');

		const newPropForm = document.createElement('form');
		newPropForm.id = "newPropForm";

		contentDiv.appendChild(newPropForm);

		const formGroup = document.createElement('div');

		//Property name input
		formGroup.classList.add('form-group');
		formGroup.innerHTML = '<input type="text" class="form-control" id="propertyNameInput" placeholder="Enter Property Name" name="prop-name">'; 

		newPropForm.appendChild(formGroup);

		const formDivider = document.createElement('div');
		formDivider.id = "form-divider";

		newPropForm.appendChild(formDivider);

		// These are the headers for the forms
		const formHeaders = document.createElement('div');
		formHeaders.id = "form-headers";
		formHeaders.innerHTML = '<label id="addressHeader">Address:</label><label id="ownerHeader">Owner:</label>' +
            '<span>Owner</span><label id="ownerAddress">Address:</label><span>Owner</span>' +
            '<label id="ownerContact">Contact:</label>'+
            '<label id="propertyManager">Property Manager:</label>'+
            '<label id="propertyAccountant">Property Accountant:</label>';
        formDivider.appendChild(formHeaders);

        const formInputs = document.createElement('div');

        formInputs.id = "form-inputs";

        //Put the username in the form (its really the slug)
        let username = document.querySelector('#username').value;
        formInputs.innerHTML = "<input type='hidden' name='username' value='" + username + "'>";

        // Property Address Inputs
        formInputs.innerHTML += '<input type="text" class="form-control" id="streetInput" placeholder="Enter Street" name="prop-street">' +
            '<input type="text" class="form-control" id="cityInput" placeholder="Enter City" name="prop-city">' +
            '<input type="text" class="form-control" id="stateInput" placeholder="Enter State" name="prop-state">' +
            '<input type="text" class="form-control" id="zipInput" placeholder="Enter Zip Code" name="prop-zip"><br>';
		
		//Landlord Name and State of Incorp.
		formInputs.innerHTML += '<input type="text" class="form-control" id="landlordInput" placeholder="Enter Landlord" name="landlord-name">' +
            '<input type="text" class="form-control" id="landlordStateInput" placeholder="Enter Landlord State of Incorporation" name="landlord-state"><br>';
        
        // Owner Address
        formInputs.innerHTML += '<input type="text" class="form-control" id="ownerStreetInput" placeholder="Enter Street" name="owner-street">' +
            '<input type="text" class="form-control" id="ownerCityInput" placeholder="Enter City" name="owner-city">'+
            '<input type="text" class="form-control" id="ownerStateInput" placeholder="Enter State" name="owner-state">' +
            '<input type="text" class="form-control" id="ownerZipInput" placeholder="Enter Zip Code" name="owner-zip"><br>';

        // Contact for Owner
        formInputs.innerHTML += '<div id="radioSalutation">Select Salutation:</div> &nbsp;' +
            '<input type="radio" name="salutation" value="Ms."> Ms. &nbsp;'+
            '<input type="radio" name="salutation" value="Mr."> Mr. &nbsp;'+
            '<input type="radio" name="salutation" value="Dr."> Dr. &nbsp;'+
            '<input type="text" class="form-control" id="contactFirst" placeholder="Enter First Name" name="contact-first">'+
            '<input type="text" class="form-control" id="contactLast" placeholder="Enter Last Name" name="contact-last">'+
            '<input type="text" class="form-control" id="contactTitle" placeholder="Enter Title" name="contact-title"><br>';
        
        formInputs.innerHTML += '<select class="form-control" id="propManager" name="prop-manager">'+
            '<option>John Doe</option><option>Sally Mae</option><option>Robby Robertson</option></select>'+
            '<br><select class="form-control" id="propAccountant" name="prop-accountant">' +
            '<option>John Doe</option><option>Sally Mae</option><option>Robby Robertson</option>'+
            '</select><br><div id="bottomOfContent">' + 
            '<button id="sendPropBtn" class="btn btn-primary">Create Property</button></div><br>';
        formDivider.appendChild(formInputs);
		//Button at the end of creating new property that adds a property.
		const sendPropBtn = document.querySelector('#sendPropBtn');
		sendPropBtn.addEventListener('click', createProperty);

		const propPhoto = document.createElement('div');
		propPhoto.id = "property-photo";
		propPhoto.classList.add('clickable');
		propPhoto.innerHTML = 'Add Property Photo' +
        '<input type="file" id="getFile" accept="image/*" name="img-file"/>' +
        '<i class="fa fa-search" id="searchIcon"></i>';

        contentDiv.appendChild(propPhoto);

		// Handle file selects
		document.getElementById('getFile').addEventListener('change', handleFileSelect, false);
	}

	//This function is called when a property is clicked.
	function getProperty(evt){
		//This div contains the main content on the page.
		// Lets remove everything in it.
		const currSelection = document.querySelector('.propertySelected');

		// Depending on which property is selected, we will deselect
		// and select the appropriate property in the sidebar.
		if(currSelection === null){
			this.classList.add('propertySelected');
			this.classList.remove('property');
		}else if(currSelection.id !== this.id){
			currSelection.classList.remove('propertySelected');
			currSelection.classList.add('property');
			this.classList.add('propertySelected');
			this.classList.remove('property');
		}else{
			this.classList.remove('propertySelected');
			this.classList.add('property');
		}
		// Do an xmlhttprequest for the property
		const req = new XMLHttpRequest();
		let url = chooseURL('/api/properties?');
		//Get the slug from the id.
		let slug = this.id.replace(/\d+$/, '').substr(0,this.id.length-2);
		console.log(slug);
		url += "slug=" + slug;
		const username = document.querySelector('#username').value;
		url += "&username=" + username;
		console.log(url);

		req.open('GET', url, true);
		req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400){
			// if there was a successful request, 
			// Load the page with database info for 
			// that property.
			const data = JSON.parse(req.responseText);
			removeAllChildren(contentDiv);
			contentDiv.classList.remove('contentWrite');
			contentDiv.classList.add('contentRead');

			// Add property-photo and editBtn elements
			const propertyPhoto = document.createElement('div');
			propertyPhoto.id = "property-photo";
			propertyPhoto.classList.add('edit');

			const editBtn = document.createElement('div');

			editBtn.innerHTML = "Edit &nbsp; <i class='fa fa-edit'></i><input type='hidden' id='hiddenVal' value='" +
								data.slug + "'>"
			editBtn.id = "editBtn";
			editBtn.addEventListener('click', editProperty);

			contentDiv.appendChild(editBtn);
			contentDiv.appendChild(propertyPhoto);

			//Create the property title and add it in.
			const propTitle = document.createElement('h3');
			propTitle.id = 'propTitle';
			propTitle.textContent = data.name;

			contentDiv.appendChild(propTitle);

			// create container div for header-value pairs
			const infoRead = document.createElement('div');
			infoRead.id = "infoRead";

			contentDiv.appendChild(infoRead);

			// These are all the headers and their corresponding key values in database
			const headers = [["address","Address:", "address" ], ["owner","Owner:", "object", "name"], 
			["owner","Owner Address:","address"],["contact","Owner Contact:", "contact"], ["type","Property Type:", "string"], 
			["manager","Property Manager:", "string"], ["accountant","Property Accountant:","string"],
			["occupancy", "Occupancy:", "string"]];

			// For each header, create a valuesRead Div, headersRead Div,
			// and vals for the values. If its an address, change formatting.
			headers.forEach((header) =>{
				const valuesRead = document.createElement('div');
				valuesRead.classList.add('valuesRead');

				const headerRead = document.createElement('div');
				headerRead.classList.add('headerRead');
				if(header[0] === "owner" && header[2] === "address"){
					headerRead.innerHTML = "<div>Owner</div><div>Address:</div>";
				}else{
					headerRead.textContent = header[1];
				}
				

				const vals = document.createElement('div');
				vals.classList.add('vals');
				if(data[header[0]] !== undefined){
					if(header[2] === "object"){
						vals.innerHTML = "<div>" + data[header[0]][header[3]] + "</div>";
					}else if(header[2] === "address"){
						if(header[0] === "address"){
							vals.innerHTML = "<div>" + data.address.street + "</div>";
							vals.innerHTML += "<div>" + data.address.city + 
							", " + data.address.st + " " + data.address.zip + "</div>";
						}else{
							vals.innerHTML = "<div>" + data[header[0]].address.street + "</div>";
							vals.innerHTML += "<div>" + data[header[0]].address.city + 
							", " + data[header[0]].address.st + " " + data[header[0]].address.zip + "</div>";
						}
					}else if(header[2] === "contact"){
						console.log('did we get here')
						vals.innerHTML = "<div>" + data[header[0]].salutation + " " + 
						data[header[0]].first_name + " " + data[header[0]].last_name;
					}else{
						vals.innerHTML = "<div>" + data[header[0]] + "</div>";
					}
				}else{
					vals.innerHTML = "";
				}

				valuesRead.appendChild(headerRead);
				valuesRead.appendChild(vals);

				infoRead.appendChild(valuesRead);
				mainWrap.scrollTop = 0;
			});

			
		} });
		req.send();
		// Clear out the main content window.


	}

	function sortPropertiesNames(evt){
		//Get the sidebar
		const sidebarProperties = document.querySelector('#sidebarProperties');
		// If there are no children, then don't do anything.
		if(sidebarProperties.children.length < 2){
			console.log("no children or only one, so don't sort");
		}else{
			let e = sidebarProperties.children;
			if(!propNameSort.classList.contains('sorted')){
				// Grab all the children, get their prop-names and ids and save them in array object.
				[].slice.call(e).sort(function(a, b) {
					return a.children[0].textContent.toLowerCase() > b.children[0].textContent.toLowerCase();
				}).forEach(function(val, index) {
				sidebarProperties.appendChild(val);
				});
				propNameSort.classList.add('sorted');
			}else{
				[].slice.call(e).sort(function(a, b) {
					aIndex = a.id.match(/\d$/)[0];
					bIndex = b.id.match(/\d$/)[0];
					return aIndex > bIndex;
				}).forEach(function(val, index) {
				sidebarProperties.appendChild(val);
				});
				propNameSort.classList.remove('sorted');
			}
		}

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

