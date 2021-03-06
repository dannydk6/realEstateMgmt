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
	// These are all the headers and their corresponding key values in database.
	// This is used in getProperty.
	const headers = [["address","Address:", "address" ], ["owner","Owner:", "object", "name"], 
	["owner","Owner Address:","address"],["contact","Owner Contact:", "contact"], ["type","Property Type:", "string"], 
	["manager","Property Manager:", "string"], ["accountant","Property Accountant:","string"],
	["occupancy", "Occupancy:", "string"]];

	// Add event listeners for each property after load.
	const sidebarProps = document.querySelector('#sidebarProperties');
	for(let i = 0; i < sidebarProps.children.length; i++){
		sidebarProps.children[i].children[0].addEventListener('click', getPropertyMain);
	}

	// This div wraps the overflow. Manipulate this div for getting to certain areas for scrolling.
	const mainWrap = document.querySelector('#mainWrap');

	//This div contains the main content on the page.
	const contentDiv = document.querySelector('#content');

	// This span is the property name sorting button.
	const propNameSort = document.querySelector('#propSort');
	propNameSort.addEventListener('click', sortPropertiesNames);

	const fieldSort = document.querySelector('#fieldSort');
	fieldSort.addEventListener('click', sortPropertiesField);

	// This select dropdown is used for choosing parameters in sidebar.
	const fieldsBox = document.querySelector('#soflow');
	fieldsBox.addEventListener('change', getAllProperties);

	// This is the button that adds a new property to the page.
	const createPropBtn = document.querySelector('.createBtn')
	createPropBtn.addEventListener('click', createNewProperty);

	// Using handlebars, we can add hidden input to see if there are any properties.
	// If there aren't, display createNewProperty. If there is, select the first one
	// And display its contents.
	const showProp = document.querySelector('#showProp');
	if(showProp !== null){
		sidebarProperties.children[0].classList.add('propertySelected');
		getProperty.call(sidebarProperties.children[0]);
	}else{
		createNewProperty();
	}
	// The edit button appears for created properties. This one is the one that shows on initial screen load.
	const editBtn = document.querySelector('#editBtn');
	if(editBtn !== null){
		editBtn.addEventListener('click', editProperty);
		// If there is an edit button, we also know that the first property is selected
		const sidebarProperties = document.querySelector('#sidebarProperties')
								  .children[0].classList.add('propertySelected');
	}


	



	function createProperty(evt){
		this.removeEventListener('click', createProperty);
		evt.preventDefault();

		let formData = new FormData(document.querySelector('#newPropForm'));

		let propName = document.querySelector('#propertyNameInput').value;

		// This is for img file upload
		const imgFile = document.querySelector('#getFile');
		// If there is no img file, avoid upload process.
		if(imgFile.value !== '' && propName !== ''){
			const imgForm = document.createElement('form');
			imgForm.name = "img-upload";
			const imgFileCopy = imgFile.cloneNode(true);
			imgForm.appendChild(imgFileCopy);

			const imgFormData = new FormData(imgForm);
			//console.log(imgFormData);

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

				formData = new FormData(document.querySelector('#newPropForm'));

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

				        const fieldSelected = fieldsBox.options[fieldsBox.selectedIndex].textContent;
				        //console.log(fieldSelected);
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

						const propertyMain = document.createElement('div');
						propertyMain.classList.add('propertyMain');


						newProperty.appendChild(propertyMain);
						propertyMain.appendChild(propNameSpan);
						propertyMain.appendChild(propFieldSpan);
						sidebarProps.appendChild(newProperty);
						//Use slug as property id.
						newProperty.id = JSON.parse(req.responseText).slug + "_" + JSON.parse(req.responseText).index;

						propertyMain.addEventListener('click', getPropertyMain);

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
						getPropertyMain.call(propertyMain);

					};
					
					let params = createPostParams(formData);
					req.send(params);

				}		
			}
			imgReq.send(imgFormData);

		}else{
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

			        const fieldSelected = fieldsBox.options[fieldsBox.selectedIndex].textContent;
			        //console.log(fieldSelected);
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

					const propertyMain = document.createElement('div');
					propertyMain.classList.add('propertyMain');


					newProperty.appendChild(propertyMain);
					propertyMain.appendChild(propNameSpan);
					propertyMain.appendChild(propFieldSpan);
					sidebarProps.appendChild(newProperty);
					//Use slug as property id.
					newProperty.id = JSON.parse(req.responseText).slug + "_" + JSON.parse(req.responseText).index;

					propertyMain.addEventListener('click', getPropertyMain);

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
					getPropertyMain.call(propertyMain);

				};
				
				let params = createPostParams(formData);
				req.send(params);

			}		
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
		//console.log(url);

		req.open('GET', url, true);
		req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400){

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

	        // Add the slug to get property
	        formInputs.innerHTML += "<input type='hidden' name='propSlug' value='" + data.slug + "'>";

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
	        
	        // Handle managers. Show selected as the manager matching the list of managers for account.
	        // In this version, use this preset managers array.
	        const managers = ["John Doe", "Sally Mae", "Robby Robertson"];

	        //formInputs.innerHTML += '<select class="form-control" id="propManager" name="prop-manager">';
	        const managerSelect = document.createElement('select');
	        managerSelect.id = 'propManager';
	        managerSelect.name = 'prop-manager';
	        managerSelect.classList.add('form-control');
	        for(let i = 0; i < managers.length; i++){
	        	if(managers[i] === data.manager){
	        		managerSelect.innerHTML += '<option selected>' + managers[i] + '</option>';
	        	}else{
	        		managerSelect.innerHTML += '<option>' + managers[i] + '</option>';
	        	}
	        }

	        formInputs.appendChild(managerSelect);

	        // Work with prop accountants now too.
	        formInputs.innerHTML += '<br>';
	        //'<select class="form-control" id="propAccountant" name="prop-accountant">'

	        
	        // Right now manager options are the same as accountants.

	        const acctSelect = document.createElement('select');
	        acctSelect.id = 'propAccountant';
	        acctSelect.name = 'prop-accountant';
	        acctSelect.classList.add('form-control');
	        for(let i = 0; i < managers.length; i++){
	        	if(managers[i] === data.accountant){
	        		acctSelect.innerHTML += '<option selected>' + managers[i] + '</option>';
	        	}else{
	        		acctSelect.innerHTML += '<option>' + managers[i] + '</option>';
	        	}
	        }

	        formInputs.appendChild(acctSelect);


	        formInputs.innerHTML += '<br><div id="bottomOfContent">' + 
	        '<button id="updatePropBtn" class="btn btn-primary">Update Property</button>' +
	        '<button id="deletePropBtn" class="btn btn-danger">Delete Property</button></div><br>';

	        formDivider.appendChild(formInputs);

			//Button at the end of creating new property that updates a property.
			const updatePropBtn = document.querySelector('#updatePropBtn');
			updatePropBtn.addEventListener('click', updateProperty);

			//Button at the end of creating new property that deletes a property.
			const deletePropBtn = document.querySelector('#deletePropBtn');
			deletePropBtn.addEventListener('click', deleteProperty);

			const propPhoto = document.createElement('div');
			propPhoto.id = "property-photo";
			propPhoto.classList.add('clickable');
			propPhoto.innerHTML = 'Add Property Photo' +
	        '<input type="file" id="getFile" accept="image/*" name="img-file"/>' +
	        '<i class="fa fa-search" id="searchIcon"></i>';

	        if(data.propertyImage !== '' && data.propertyImage !== undefined){
	        	propPhoto.innerHTML += '<img src="' + chooseURL(data.propertyImage) + 
				'" id="propImg" class="propImg">';;
	        }
	        

	        contentDiv.appendChild(propPhoto);

			// Handle file selects
			document.getElementById('getFile').addEventListener('change', handleFileSelect, false);	
			

			
		} });
		req.send();		
	}

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
			// Remove buildings div only if it exists
			if(currSelection.children[1] !== undefined){
				currSelection.removeChild(currSelection.children[1]);
			}
			
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

	function getPropertyMain(evt){
		getProperty.call(this.parentNode);
	}

	//This function is called when a property is clicked.
	function getProperty(evt){

		// This class is assigned to whichever property is currently selected.
		const currSelection = document.querySelector('.propertySelected');

		// This is the current selected building.
		const buildingSelected = document.querySelector('.buildingSelected');

		// If there is a currently selected building, remove it.
		// TODO: When there's suites, remove all children.
		if(buildingSelected !== null){
			buildingSelected.classList.remove('buildingSelected');
			buildingSelected.classList.add('building');
		}

		// Depending on which property is selected, we will deselect
		// and select the appropriate property in the sidebar.
		if(evt !== undefined){
			if(currSelection === null){
				this.classList.add('propertySelected');
				this.classList.remove('property');
			}else if(currSelection.id !== this.id){
				// Remove the buildings interface
				if(currSelection.children[1] !== undefined){
					currSelection.removeChild(currSelection.children[1]);
				}
				currSelection.classList.remove('propertySelected');
				currSelection.classList.add('property');
				this.classList.add('propertySelected');
				this.classList.remove('property');
			}
		}else{
			if(currSelection === null){
				this.classList.add('propertySelected');
				this.classList.remove('property');
			}else if(currSelection.id !== this.id){
				if(currSelection.children[1] !== undefined){
					currSelection.removeChild(currSelection.children[1]);
				}
				currSelection.classList.remove('propertySelected');
				currSelection.classList.add('property');
				this.classList.add('propertySelected');
				this.classList.remove('property');
			}else{
				this.classList.add('propertySelected');
				this.classList.remove('property');
			}
		}

		const newSelection = this;
		// Do an xmlhttprequest for the property
		const req = new XMLHttpRequest();
		let url = chooseURL('/api/properties?');
		//Get the slug from the id.
		let slug = this.id.replace(/_\d*$/, '').substr(0,this.id.length-2);
		//console.log(slug);
		url += "slug=" + slug;
		const username = document.querySelector('#username').value;
		url += "&username=" + username;
		//console.log(url);

		// Get info from database on the selected property.
		req.open('GET', url, true);
		req.addEventListener('load', function() {
			if (this.status >= 200 && this.status < 400){
				// if there was a successful request, 
				// Load the page with database info for 
				// that property.
				const data = JSON.parse(this.responseText);
				removeAllChildren(contentDiv);

				// Add a buildings div if there are any buildings in property.
				// Populate the div with buildings.
				if(newSelection.children[1] === undefined && data.buildings.length > 0){
					const buildingsDiv = document.createElement('div');
					buildingsDiv.classList.add('buildings');

					newSelection.appendChild(buildingsDiv);

					for(let i = 0; i < data.buildings.length; i++){
						const newBuilding = document.createElement('div');
						newBuilding.classList.add('building');
						newBuilding.id = data.buildings[i].slug + '_' + data.buildings[i].index;

						let propNameSpan = document.createElement('span');
						propNameSpan.classList.add('prop-name');
						propNameSpan.textContent = data.buildings[i].name;
						let propFieldSpan = document.createElement('span');
						propFieldSpan.classList.add('prop-field');
						propFieldSpan.textContent = data.buildings[i].type;

						newBuilding.appendChild(propNameSpan);
						newBuilding.appendChild(propFieldSpan);		
						buildingsDiv.appendChild(newBuilding);

						newBuilding.addEventListener('click', getBuilding);		
					}
				}

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
							//console.log('did we get here')
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


				const valuesRead = document.createElement('div');
				valuesRead.classList.add('valuesRead');
				const buildingsHeader = document.createElement('div');
				buildingsHeader.classList.add('headerRead');
				buildingsHeader.innerHTML = "<b>Buildings<b>";

				const vals = document.createElement('div');
				vals.classList.add('vals');


				infoRead.appendChild(valuesRead);
				valuesRead.appendChild(buildingsHeader);
				valuesRead.appendChild(vals);

				if(data.buildings === undefined || data.buildings.length < 1){
					const addBuildingBtn = document.createElement('div');
					addBuildingBtn.classList.add('addBuildingBtn');
					addBuildingBtn.innerHTML = '<a href=""><u>+ Add Building</u></a>';
					addBuildingBtn.addEventListener('click', addNewBuilding);

					vals.appendChild(addBuildingBtn);

				}else{
					const buildTable = document.createElement('table');
					buildTable.classList.add('table');
					buildTable.classList.add('table-sm');
					buildTable.classList.add('table-hover');
					buildTable.innerHTML = '' +
					  '<thead>' +
					    '<tr>' +
					      '<th scope="col">#</th>' +
					      '<th scope="col">Name</th>' +
					      '<th scope="col">Type</th>' +
					      '<th scope="col">State</th>' +
					    '</tr>' +
					  '</thead>';

					const tableBody = document.createElement('tbody');
					buildTable.appendChild(tableBody);

					for(let i = 0; i < data.buildings.length; i++){
						const tableRow = document.createElement('tr');
						tableRow.innerHTML = "" +
						'<td>' + (i+1) + '</td>' +
						'<td>' + data.buildings[i].name + '</td>' +
						'<td>' + data.buildings[i].type + '</td>' +
						'<td>' + data.buildings[i].address.st + '</td>';

						tableBody.appendChild(tableRow);
					}

					infoRead.appendChild(buildTable);
					const addBuildingBtn = document.createElement('div');
					addBuildingBtn.classList.add('addBuildingBtn');
					addBuildingBtn.innerHTML = '<a href=""><u>+ Add Building</u></a>';
					addBuildingBtn.addEventListener('click', addNewBuilding);

					vals.appendChild(addBuildingBtn);
				}





			} 
		});
		req.send();

	}

	// Add a building to a given property for a given user.
	function addNewBuilding(evt){

		evt.preventDefault();			
		contentDiv.scrollTop = 0;
		removeAllChildren(contentDiv);

		const propPhoto = document.createElement('div');
		propPhoto.id = "property-photo";
		propPhoto.classList.add('clickable');
		propPhoto.innerHTML = 'Add Building Photo' +
	    '<input type="file" id="getFile" accept="image/*" name="img-file"/>' +
	    '<i class="fa fa-search" id="searchIcon"></i>';

    	contentDiv.appendChild(propPhoto);

		// Handle file selects
		document.getElementById('getFile').addEventListener('change', handleFileSelect, false);


		const myForm = document.createElement('form');
		myForm.id = "myForm";

		 //Put the username in the form (its really the slug)
        let username = document.querySelector('#username').value;
        myForm.innerHTML = "<input type='hidden' name='username' value='" + username + "'>";

        // Get the slug from selected property
        const selectedProp = document.querySelector('.propertySelected').id;

        // Use a regex to remove index to get actual slug of property
        let propSlug = selectedProp.replace(/_\d*$/, '');
        myForm.innerHTML += "<input type='hidden' name='propSlug' value='" + propSlug + "'>";



		contentDiv.appendChild(myForm);

		const formGroup = document.createElement('div');

		//Property name input
		formGroup.classList.add('form-group');
		formGroup.innerHTML = '<input type="text" class="form-control" id="propertyNameInput" placeholder="Enter Building Name" name="name">'; 

		myForm.appendChild(formGroup);
		contentDiv.appendChild(myForm);
		// create container div for header-value pairs
		const infoRead = document.createElement('div');
		infoRead.id = "infoRead";

		myForm.appendChild(infoRead);

		const buildHeaders = [["Type:","type"],["Address:", "address"]];

		// For each header, create a valuesRead Div, headersRead Div,
		// and vals for the values. If its an address, change formatting.
		buildHeaders.forEach((header) =>{
			const valuesRead = document.createElement('div');
			valuesRead.classList.add('valuesRead');

			const headerRead = document.createElement('div');
			headerRead.classList.add('headerAddBuild');

			headerRead.textContent = header[0];
			
			const vals = document.createElement('div');
			vals.classList.add('valsWrite');
	
			if(header[1] === "type"){
				const typeSelect = document.createElement('select');
				typeSelect.classList.add('form-control');
				typeSelect.name = 'type';
				typeSelect.innerHTML = '' +
	            '<option>Office</option>' +
              	'<option>Retail</option>' +
              	'<option>Residential</option>' +
              	'<option>Industrial</option>' +
              	'<option>Other</option>';
              	vals.appendChild(typeSelect);

			}else if(header[1] === "address"){
				vals.innerHTML = "" +
				'<input type="text" class="form-control" id="streetInput" placeholder="Enter Street" name="street">' +
              	'<input type="text" class="form-control" id="cityInput" placeholder="Enter City" name="city">' + 
              	'<input type="text" class="form-control" id="stateInput" placeholder="Enter State" name="state">' +
              	'<input type="text" class="form-control" id="zipInput" placeholder="Enter Zip Code" name="zip">';
              	const createBuildBtn = document.createElement('button');
              	createBuildBtn.id = "createBuildBtn";
              	createBuildBtn.classList.add('btn', 'btn-primary');
              	createBuildBtn.textContent = "Add Building";
              	createBuildBtn.addEventListener('click', createBuilding);
              	vals.appendChild(createBuildBtn);
			}else{
				vals.innerHTML = "<input type='text' name=''" + header[1] + ">";
			}

			valuesRead.appendChild(headerRead);
			valuesRead.appendChild(vals);

			infoRead.appendChild(valuesRead);

		});	
		
	}



	// Use this to update sidebar text values after user changes fields dropdown menu option.
	function getAllProperties(evt){
		// Do an xmlhttprequest for the property
		const req = new XMLHttpRequest();
		let url = chooseURL('/api/allProperties?');
		//Get the slug from the id.
		let slug = fieldsBox.options[fieldsBox.selectedIndex].id.replace(/_mySlug$/, '');
		//console.log(slug);
		url += "slug=" + slug;
		const username = document.querySelector('#username').value;
		url += "&username=" + username;
		url += "&type=" + fieldsBox.options[fieldsBox.selectedIndex].value;
		//console.log(url);

		req.open('GET', url, true);
		req.addEventListener('load', function() {
		if (req.status >= 200 && req.status < 400){
			// if there was a successful request, 
			// Load the page with database info for 
			// that property.
			const data = JSON.parse(req.responseText);	

			data.forEach((prop) =>{
				document.querySelector('#' + prop.slug).children[0].children[1].textContent = prop.value;
			})	

			if(fieldSort.classList.contains('sorted')){
				sortPropertiesField(undefined);
			}


			
		} });
		req.send();
	}

	function sortPropertiesNames(evt){
		//Get the sidebar
		const sidebarProperties = document.querySelector('#sidebarProperties');
		// If there are no children, then don't do anything.
		if(sidebarProperties.children.length < 2){
			//console.log("no children or only one, so don't sort");
		}else{
			let e = sidebarProperties.children;
			if(!propNameSort.classList.contains('sorted')){
				// Grab all the children, get their prop-names and ids and save them in array object.
				[].slice.call(e).sort(function(a, b) {
					return a.children[0].children[0].textContent.toLowerCase() > b.children[0].children[0].textContent.toLowerCase();
				}).forEach(function(val, index) {
				sidebarProperties.appendChild(val);
				});
				propNameSort.classList.add('sorted');
				propNameSort.children[0].classList.add('highlighted');
				fieldSort.classList.remove('sorted');
				fieldSort.children[0].classList.remove('highlighted');
			}else{
				[].slice.call(e).sort(function(a, b) {
					aIndex = a.id.match(/\d*$/)[0];
					bIndex = b.id.match(/\d*$/)[0];
					return aIndex > bIndex;
				}).forEach(function(val, index) {
				sidebarProperties.appendChild(val);
				});
				propNameSort.classList.remove('sorted');
				propNameSort.children[0].classList.remove('highlighted');
				fieldSort.children[0].classList.remove('highlighted');
				fieldSort.classList.remove('sorted');
			}
		}

	}

	function sortPropertiesField(evt){
		//Get the sidebar
		const sidebarProperties = document.querySelector('#sidebarProperties');
		// If there are no children, then don't do anything.
		if(sidebarProperties.children.length < 2){
			//console.log("no children or only one, so don't sort");
		}else{
			let e = sidebarProperties.children;
			if(!fieldSort.classList.contains('sorted') || evt === undefined){
				// Grab all the children, get their prop-names and ids and save them in array object.
				[].slice.call(e).sort(function(a, b) {
					return a.children[0].children[1].textContent.toLowerCase() > b.children[0].children[1].textContent.toLowerCase();
				}).forEach(function(val, index) {
				sidebarProperties.appendChild(val);
				});
				if(evt !== undefined){
					propNameSort.classList.remove('sorted');
					propNameSort.children[0].classList.remove('highlighted');
					fieldSort.classList.add('sorted');
					fieldSort.children[0].classList.add('highlighted');
				}

			}else{
				[].slice.call(e).sort(function(a, b) {
					aIndex = a.id.match(/\d*$/)[0];
					bIndex = b.id.match(/\d*$/)[0];
					return aIndex > bIndex;
				}).forEach(function(val, index) {
				sidebarProperties.appendChild(val);
				});
				propNameSort.classList.remove('sorted');
				propNameSort.children[0].classList.remove('highlighted');
				fieldSort.classList.remove('sorted');
				fieldSort.children[0].classList.remove('highlighted');
			}
		}

	}
	//TODO: Fix the bug with picture
	function updateProperty(evt){
		this.removeEventListener('click', updateProperty)
		evt.preventDefault();

		let formData = new FormData(document.querySelector('#newPropForm'));

		let propName = document.querySelector('#propertyNameInput').value;


		// This is for img file upload. This will reupload an image on every single edit so change that soon.
		const imgFile = document.querySelector('#getFile');
		//console.log(imgFile);
		// If there is no img file, avoid upload process.
		if(imgFile.value !== '' && propName !== ''){
			const imgForm = document.createElement('form');
			imgForm.name = "img-upload";
			const imgFileCopy = imgFile.cloneNode(true);
			imgForm.appendChild(imgFileCopy);

			const imgFormData = new FormData(imgForm);
			//console.log(imgFormData);

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
				//console.log('Update prop: ' + document.querySelector('#form-inputs'));

				formData = new FormData(document.querySelector('#newPropForm'));

				// TODO: Have checks for data input and make popups if no input.
				if(propName !== ""){
					const req = new XMLHttpRequest();
					
					const url = chooseURL('/api/properties/update');
					req.open('POST', url, true);
					req.setRequestHeader('Content-Type', 
						'application/x-www-form-urlencoded; charset=UTF-8');

					
					req.onload = function(){
						//Useful code for changing window's url location after post.
						//window.location = "/leases";
						let data = JSON.parse(req.responseText);
						//console.log(data);
				        let propName = document.querySelector('#propertyNameInput').value;

						if(propNameSort.classList.contains('sorted')){
							sortPropertiesNames();
						}
						let importantSlug = '';
						for(let i = 0; i <sidebarProps.children.length; i++){
							if (sidebarProps.children[i].classList.contains('propertySelected')){
								importantSlug = sidebarProps.children[i].id;
							}
						}
						//console.log("Important Slug:" + importantSlug);
						let currProp = document.querySelector('#' + importantSlug);
						currProp.children[0].children[0].textContent = data['prop-name'];

						let fieldParam = fieldsBox.options[fieldsBox.selectedIndex].id.replace(/_mySlug$/, '');
						//console.log(fieldParam);
						let pairs = {manager: 'prop-manager', accountant: 'prop-accountant',
									 contact: 'contact-first', owner: 'landlord-name'};
						currProp.children[0].children[1].textContent = data[pairs[fieldParam]];

						getProperty.call(currProp);

					};
					
					let params = createPostParams(formData);
					req.send(params);

				}		
			}
			imgReq.send(imgFormData);

		}else{
			let propName = document.querySelector('#propertyNameInput').value;

			// TODO: Have checks for data input and make popups if no input.
			// TODO: Have checks for data input and make popups if no input.
			if(propName !== ""){
				const req = new XMLHttpRequest();
				
				const url = chooseURL('/api/properties/update');
				req.open('POST', url, true);
				req.setRequestHeader('Content-Type', 
					'application/x-www-form-urlencoded; charset=UTF-8');
				
				req.onload = function(){
					//Useful code for changing window's url location after post.
					//window.location = "/leases";
					let data = JSON.parse(req.responseText);
					//console.log(data);
			        let propName = document.querySelector('#propertyNameInput').value;

					if(propNameSort.classList.contains('sorted')){
						sortPropertiesNames();
					}
					let importantSlug = '';
					for(let i = 0; i <sidebarProps.children.length; i++){
						if (sidebarProps.children[i].classList.contains('propertySelected')){
							importantSlug = sidebarProps.children[i].id;
						}
					}
					//console.log("Important Slug:" + importantSlug);
					let currProp = document.querySelector('#' + importantSlug);
					currProp.children[0].children[0].textContent = data['prop-name'];

					let fieldParam = fieldsBox.options[fieldsBox.selectedIndex].id.replace(/_mySlug$/, '');
					//console.log(fieldParam);
					let pairs = {manager: 'prop-manager', accountant: 'prop-accountant',
								 contact: 'contact-first', owner: 'landlord-name'};
					currProp.children[0].children[1].textContent = data[pairs[fieldParam]];

					getProperty.call(currProp);



				};
				
				let params = createPostParams(formData);
				req.send(params);
			}	
		}		
	}

	// Use this function to delete an unwanted property
	function deleteProperty(evt){
		evt.preventDefault();

		const formData = new FormData(document.querySelector('#newPropForm'));

		// TODO: Have checks for data input and make popups if no input.
		if(true){
			const req = new XMLHttpRequest();
			
			const url = chooseURL('/api/properties/delete');
			req.open('POST', url, true);
			req.setRequestHeader('Content-Type', 
				'application/x-www-form-urlencoded; charset=UTF-8');
			
			req.onload = function(){
				//Useful code for changing window's url location after post.
				//window.location = "/leases";
				let data = JSON.parse(req.responseText);
		        let propName = document.querySelector('#propertyNameInput').value;

				let importantSlug = '';
				for(let i = 0; i <sidebarProps.children.length; i++){
					if (sidebarProps.children[i].classList.contains('propertySelected')){
						importantSlug = sidebarProps.children[i].id;
					}
				}

				importantIndex = +importantSlug.match(/\d*$/)[0];
				//console.log('This is important: ' + importantIndex)

				if(importantIndex < sidebarProps.children.length){
					[].slice.call(sidebarProps.children).forEach((property) =>{
						let myIndex = +property.id.match(/\d*$/)[0];
						//console.log(myIndex);

						if(myIndex > importantIndex){
							myIndex -= 1;
							property.id = property.id.replace(/\d*$/,myIndex);
						}

					});					
				}


				let currProp = document.querySelector('#' + importantSlug);
				sidebarProps.removeChild(currProp);

				removeAllChildren(contentDiv);

				if(sidebarProps.children.length >= 1){
					sidebarProps.children[0].classList.add('propertySelected');
					getProperty.call(sidebarProps.children[0]);
				}else{
					createNewProperty();
				}



			};
			
			let params = createPostParams(formData);
			req.send(params);
		}
	}


	// Add a building to selected property.
	function createBuilding(evt){
		this.removeEventListener('click', createBuilding);
		evt.preventDefault();

		let formData = new FormData(document.querySelector('#myForm'));

		let buildingName = document.querySelector('#propertyNameInput').value;

		// Check the building name and make sure it exists.
		let propName = document.querySelector('#propertyNameInput').value;

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

				document.querySelector('#myForm').appendChild(hiddenInput);
				//console.log(document.querySelector('#form-inputs'));

				// Refresh form data so it includes path for image.
				formData = new FormData(document.querySelector('#myForm'));

				// TODO: Have checks for data input and make popups if no input.
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
				        const data = JSON.parse(req.responseText);
				        const sidebarProps = document.querySelector('#sidebarProperties');
				        const propertySelected = document.querySelector('.propertySelected');
				        let propName = document.querySelector('#propertyNameInput').value;

				        const mapping = [{value: 'Owner Contact', id: '#contactFirst'},
				        				 {value: 'Owner', id: '#landlordInput'},
				        				 {value: 'Property Manager', id: '#propManager'},
				        				 {value: 'Property Accountant', id: '#propAccountant'},
				        				 {value: 'Property Type', id: ''}];
				        //Do this for the selected value
				        //const currId = mapping.find(o => o.value === fieldSelected).id;
				        let propField = data.type;

				        // New property is a new building. Add it to buildings inside
				        // Create a buildings container inside property sidebar
				        // If a buildings container doesn't exist.

				    	let buildingsDiv = propertySelected.children[1];
				    	if(buildingsDiv === undefined){

					        let newProperty = document.createElement('div');
							newProperty.classList.add('building');
							let propNameSpan = document.createElement('span');
							propNameSpan.classList.add('prop-name');
							propNameSpan.textContent = propName;
							let propFieldSpan = document.createElement('span');
							propFieldSpan.classList.add('prop-field');
							propFieldSpan.textContent = propField;

							newProperty.appendChild(propNameSpan);
							newProperty.appendChild(propFieldSpan);


				        	buildingsDiv = document.createElement('div');
				        	buildingsDiv.classList.add('buildings');
				        	console.log(buildingsDiv);
							propertySelected.appendChild(buildingsDiv);

				        	buildingsDiv.appendChild(newProperty);
							//Use slug as property id.

							newProperty.id = data.slug + "_" + data.index;

							newProperty.addEventListener('click', getBuilding);

							getBuilding.call(newProperty);
				    	}else{
				    		let newProperty = document.createElement('div');
							newProperty.classList.add('building');
							let propNameSpan = document.createElement('span');
							propNameSpan.classList.add('prop-name');
							propNameSpan.textContent = propName;
							let propFieldSpan = document.createElement('span');
							propFieldSpan.classList.add('prop-field');
							propFieldSpan.textContent = propField;

							newProperty.appendChild(propNameSpan);
							newProperty.appendChild(propFieldSpan);

							propertySelected.appendChild(buildingsDiv);

				        	buildingsDiv.appendChild(newProperty);
							//Use slug as property id.

							newProperty.id = data.slug + "_" + data.index;

							newProperty.addEventListener('click', getBuilding);

							getBuilding.call(newProperty);
				    	}

						

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
			        const data = JSON.parse(req.responseText);
			        const sidebarProps = document.querySelector('#sidebarProperties');
			        const propertySelected = document.querySelector('.propertySelected');
			        let propName = document.querySelector('#propertyNameInput').value;

			        const mapping = [{value: 'Owner Contact', id: '#contactFirst'},
			        				 {value: 'Owner', id: '#landlordInput'},
			        				 {value: 'Property Manager', id: '#propManager'},
			        				 {value: 'Property Accountant', id: '#propAccountant'},
			        				 {value: 'Property Type', id: ''}];
			        //Do this for the selected value
			        //const currId = mapping.find(o => o.value === fieldSelected).id;
			        let propField = data.type;

			        // New property is a new building. Add it to buildings inside
			        // Create a buildings container inside property sidebar
			        // If a buildings container doesn't exist.

			    	let buildingsDiv = propertySelected.children[1];
			    	if(buildingsDiv === undefined){

				        let newProperty = document.createElement('div');
						newProperty.classList.add('building');
						let propNameSpan = document.createElement('span');
						propNameSpan.classList.add('prop-name');
						propNameSpan.textContent = propName;
						let propFieldSpan = document.createElement('span');
						propFieldSpan.classList.add('prop-field');
						propFieldSpan.textContent = propField;

						newProperty.appendChild(propNameSpan);
						newProperty.appendChild(propFieldSpan);


			        	buildingsDiv = document.createElement('div');
			        	buildingsDiv.classList.add('buildings');
			        	console.log(buildingsDiv);
						propertySelected.appendChild(buildingsDiv);

			        	buildingsDiv.appendChild(newProperty);
						//Use slug as property id.

						newProperty.id = data.slug + "_" + data.index;

						newProperty.addEventListener('click', getBuilding);

						getBuilding.call(newProperty);
			    	}else{
			    		let newProperty = document.createElement('div');
						newProperty.classList.add('building');
						let propNameSpan = document.createElement('span');
						propNameSpan.classList.add('prop-name');
						propNameSpan.textContent = propName;
						let propFieldSpan = document.createElement('span');
						propFieldSpan.classList.add('prop-field');
						propFieldSpan.textContent = propField;

						newProperty.appendChild(propNameSpan);
						newProperty.appendChild(propFieldSpan);

						propertySelected.appendChild(buildingsDiv);

			        	buildingsDiv.appendChild(newProperty);
						//Use slug as property id.

						newProperty.id = data.slug + "_" + data.index;

						newProperty.addEventListener('click', getBuilding);

						getBuilding.call(newProperty);
			    	}

				};
				
				let params = createPostParams(formData);
				req.send(params);

			}		
		}
	}

	//This function is called when a property is clicked.
	function getBuilding(evt){

		// This class is assigned to whichever property is currently selected.
		const currSelection = document.querySelector('.buildingSelected');

		// Depending on which property is selected, we will deselect
		// and select the appropriate property in the sidebar.
		if(evt !== undefined){
			if(currSelection === null){
				this.classList.add('buildingSelected');
				this.classList.remove('building');
			}else if(currSelection.id !== this.id){

				currSelection.classList.remove('buildingSelected');
				currSelection.classList.add('building');
				this.classList.add('buildingSelected');
				this.classList.remove('building');
			}
		}else{
			this.classList.add('buildingSelected');
			this.classList.remove('building');
		}
		const propertySelected = document.querySelector('.propertySelected').id;
		console.log(propertySelected);
		const propSlug = propertySelected.replace(/_\d*$/, '');

		const newSelection = this;
		// Do an xmlhttprequest for the property
		const req = new XMLHttpRequest();
		let url = chooseURL('/api/properties/buildings?');
		//Get the slug from the id.
		let slug = this.id.replace(/_\d*$/, '').substr(0,this.id.length-2);
		//console.log(slug);
		url += "buildSlug=" + slug;
		//
		url += "&propSlug=" + propSlug;
		const username = document.querySelector('#username').value;
		url += "&username=" + username;
		//console.log(url);

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
				if(data.buildingImage !== '' && data.buildingImage !== undefined){
					propertyPhoto.innerHTML = '<img src="' + chooseURL(data.buildingImage) + 
					'" id="propImg" class="propImg"></img>';
				}
				
				// TODO: Allow for editing Buildings

				const editBtn = document.createElement('div');

				editBtn.innerHTML = "Edit &nbsp; <i class='fa fa-edit'></i><input type='hidden' id='hiddenVal' value='" +
									data.slug + "'>"
				editBtn.id = "editBtn";
				//editBtn.addEventListener('click', editProperty);

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

				const myHeaders = [["type","Property Type:", "string"], ["address","Address:", "address" ], 
				["occupancy", "Occupancy:", "string"]];

				// For each header, create a valuesRead Div, headersRead Div,
				// and vals for the values. If its an address, change formatting.
				myHeaders.forEach((header) =>{
					const valuesRead = document.createElement('div');
					valuesRead.classList.add('valuesRead');

					const headerRead = document.createElement('div');
					headerRead.classList.add('headerRead');

					headerRead.textContent = header[1];
					
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
							//console.log('did we get here')
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


				const valuesRead = document.createElement('div');
				valuesRead.classList.add('valuesRead');
				const buildingsHeader = document.createElement('div');
				buildingsHeader.classList.add('headerRead');
				buildingsHeader.innerHTML = "<b>Suites<b>";

				const vals = document.createElement('div');
				vals.classList.add('vals');

				infoRead.appendChild(valuesRead);
				valuesRead.appendChild(buildingsHeader);
				valuesRead.appendChild(vals);

				if(data.suites === undefined || data.buildings.length < 1){
					const addBuildingBtn = document.createElement('div');
					addBuildingBtn.classList.add('addSuitesBtn');
					addBuildingBtn.innerHTML = '<a href=""><u>+ Add Suite</u></a>';
					//addBuildingBtn.addEventListener('click', addNewBuilding);

					vals.appendChild(addBuildingBtn);

				}else{
					const buildTable = document.createElement('table');
					buildTable.classList.add('table');
					buildTable.classList.add('table-sm');
					buildTable.classList.add('table-hover');
					buildTable.innerHTML = '' +
					  '<thead>' +
					    '<tr>' +
					      '<th scope="col">#</th>' +
					      '<th scope="col">Name</th>' +
					      '<th scope="col">Type</th>' +
					      '<th scope="col">State</th>' +
					    '</tr>' +
					  '</thead>';

					const tableBody = document.createElement('tbody');
					buildTable.appendChild(tableBody);

					for(let i = 0; i < data.buildings.length; i++){
						const tableRow = document.createElement('tr');
						tableRow.innerHTML = "" +
						'<td>' + (i+1) + '</td>' +
						'<td>' + data.buildings[i].name + '</td>' +
						'<td>' + data.buildings[i].type + '</td>' +
						'<td>' + data.buildings[i].address.st + '</td>';

						tableBody.appendChild(tableRow);
					}

					infoRead.appendChild(buildTable);
					const addBuildingBtn = document.createElement('div');
					addBuildingBtn.classList.add('addSuitesBtn');
					addBuildingBtn.innerHTML = '<a href=""><u>+ Add Suite</u></a>';
					//addBuildingBtn.addEventListener('click', addNewBuilding);

					vals.appendChild(addBuildingBtn);
				}





			} 
		});
		req.send();

	}



}

// Get all the params and values from the form data and put them into a string.
function createPostParams(formData){
	let parameters = "";
	for(let pair of formData.entries()){
		pair2clean = pair[1].toString().split(" ").join("%20");
		parameters = parameters + pair[0] + "=" + pair2clean + "&";
	}
	//console.log(parameters);
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

