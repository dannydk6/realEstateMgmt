// This controls what the create new property button does in the top left.
// Makes an editable interface to add a new property.
function createNewProperty(evt){
	if(evt !== undefined){
		evt.preventDefault();			
	}else{
		contentDiv.scrollTop = 0;
	}

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

	// These are all the headers and their corresponding key values in database.
	const headers = [["address","Address:", "address" ], ["owner","Owner:", "object", "name"], 
	["owner","Owner Address:","address"],["contact","Owner Contact:", "contact"], ["type","Property Type:", "string"], 
	["manager","Property Manager:", "string"], ["accountant","Property Accountant:","string"],
	["occupancy", "Occupancy:", "string"]];	

	// This class is assigned to whichever property is currently selected.
	const currSelection = document.querySelector('.propertySelected');

	// Depending on which property is selected, we will deselect
	// and select the appropriate property in the sidebar.
	if(evt !== undefined){
		if(currSelection === null){
			this.classList.add('propertySelected');
			this.classList.remove('property');
		}else if(currSelection.id !== this.id){
			currSelection.classList.remove('propertySelected');
			currSelection.classList.add('property');
			this.classList.add('propertySelected');
			this.classList.remove('property');
		}
	}

	// Do an xmlhttprequest for the property
	const req = new XMLHttpRequest();
	let url = chooseURL('/api/properties?');
	//Get the slug from the id.
	let slug = this.id.replace(/_\d*$/, '').substr(0,this.id.length-2);
	console.log(slug);
	url += "slug=" + slug;
	const username = document.querySelector('#username').value;
	url += "&username=" + username;
	console.log(url);

	// Get info from database on the selected property.
	req.open('GET', url, true);
	req.addEventListener('load', function() {
		if (this.status >= 200 && this.status < 400){
			// if there was a successful request, 
			// Load the page with database info for 
			// that property.
			const data = JSON.parse(this.responseText);
			removeAllChildren(contentDiv);
			contentDiv.classList.remove('contentWrite');
			contentDiv.classList.add('contentRead');

			// Add property-photo and editBtn elements
			const propertyPhoto = document.createElement('div');
			propertyPhoto.id = "property-photo";
			propertyPhoto.classList.add('edit');
			if(data.propertyImage !== '' && data.propertyImage !== undefined){
				propertyPhoto.innerHTML = '<img src="' + chooseURL(data.propertyImage) + 
				'" id="propImg" class="propImg"></img>';
			}
			

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

			const buildingsHeader = document.createElement('div');
			buildingsHeader.classList.add('headerRead');
			buildingsHeader.innerHTML = "<b>Buildings<b>";

			infoRead.appendChild(buildingsHeader);

			if(data.buildings === undefined || data.buildings.length < 1){
				const addBuildingBtn = document.createElement('div');
				addBuildingBtn.classList.add('addBuildingBtn');
				addBuildingBtn.innerHTML = '<a href=""><u>+ Add Building</u></a>';
				addBuildingBtn.addEventListener('click', addNewBuilding);

				infoRead.appendChild(addBuildingBtn);

			}

		} 
	});
	req.send();

	// TODO: Clear out the main content window.


}





function createBuilding(evt){
	evt.preventDefault();

	let formData = new FormData(document.querySelector('#myForm'));

	let buildingName = document.querySelector('#propertyNameInput').value;

	// This is for img file upload
	const imgFile = document.querySelector('#getFile');
	// If there is no img file, avoid upload process.
	if(imgFile.value !== '' && propName !== ''){
		const imgForm = document.createElement('form');
		imgForm.name = "img-upload";
		const imgFileCopy = imgFile.cloneNode(true);
		imgForm.appendChild(imgFileCopy);

		const imgFormData = new FormData(imgForm);
		console.log(imgFormData);

		const imgReq = new XMLHttpRequest();

		const url = chooseURL('/api/properties/img/upload');
		imgReq.open('POST', url, true);
		imgReq.onload = function(){

			let imgPath = JSON.parse(imgReq.responseText).path;
			let imgUrl = chooseURL(imgPath);
			//console.log(imgUrl);
			hiddenInput = document.createElement('input');
			hiddenInput.name = 'img-url';
			hiddenInput.type = 'hidden';
			hiddenInput.value = imgPath;

			document.querySelector('#form-inputs').appendChild(hiddenInput);
			//console.log(document.querySelector('#form-inputs'));

			// Refresh form data so it includes path for image.
			formData = new FormData(document.querySelector('#newPropForm'));

			// TODO: Have checks for data input and make popups if no input.
			if(propName !== ""){
				const req = new XMLHttpRequest();
				
				const url = chooseURL('/api/properties/buildings/create');
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

					newProperty.classList.add('propertySelected');
					getProperty.call(newProperty);

				};
				
				let params = createPostParams(formData);
				req.send(params);

			}		
		}
		imgReq.send(imgFormData);

	}else{
		// Check the building name and make sure it exists.
		let propName = document.querySelector('#propertyNameInput').value;

		// TODO: Have checks for data input and make popups if no input.
		if(propName !== ""){
			const req = new XMLHttpRequest();
			
			const url = chooseURL('/api/properties/buildings/create');
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

		        const fieldSelected = fieldsBox.options[fieldsBox.selectedIndex].textContent;
		        console.log(fieldSelected);
		        const mapping = [{value: 'Owner Contact', id: '#contactFirst'},
		        				 {value: 'Owner', id: '#landlordInput'},
		        				 {value: 'Property Manager', id: '#propManager'},
		        				 {value: 'Property Accountant', id: '#propAccountant'},
		        				 {value: 'Property Type', id: ''}];
		        //Do this for the selected value
		        const currId = mapping.find(o => o.value === fieldSelected).id;
		        let propField = document.querySelector(currId).value;

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

				newProperty.classList.add('propertySelected');
				getProperty.call(newProperty);

			};
			
			let params = createPostParams(formData);
			req.send(params);

		}		
	}
}