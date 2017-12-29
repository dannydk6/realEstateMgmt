document.addEventListener('DOMContentLoaded', main);

function main(evt){
	const socket = io('/grid');

	let userObj = document.querySelector('#userInfo').value;
	userObj = makeUserObj(userObj);

	console.log(userObj);

	const hostBtn = document.querySelector('#hostBtn');
	hostBtn.addEventListener('click', hostBattle);

	const stopHostBtn = document.querySelector('#stopHostBtn');
	stopHostBtn.addEventListener('click', stopHostBattle);

	const inBattleBtn = document.querySelector('#inBattleBtn');

	function hostBattle(evt){
		this.classList.add("display-none");
		document.querySelector('#stopHostBtn').classList.remove("display-none");
		socket.emit('host-battle', {host:userObj.slug});
	}
  
	function stopHostBattle(evt){
		this.classList.add("display-none");
		document.querySelector('#hostBtn').classList.remove("display-none");
		socket.emit('stop-host', {host:userObj.slug});
	}

	socket.on('host-battle', (data) => {
		/** Recreate this div and add it to document.
		<div class="card mb-3 mt-3">
			<div class="card-header">
			 Host: 
			</div>
			<div class="card-body">
				<button type="button" id="data.hostBtn" class="btn btn-success 
				btn-lg btn-block host-btns">Join</button>
			</div>
		</div>			
		**/
	    //initiate Screen - start with computer total.
	    if(document.querySelector("#" + data.host) === null){
			const wrapper = document.createElement("div");
			wrapper.classList.add("card","mb-3","mt-3");
			wrapper.id = data.host;

			const cardHeader = document.createElement("div");
			cardHeader.classList.add("card-header");
			cardHeader.textContent = "Host: " + data.host;


			const cardBody = document.createElement("div");
			cardBody.classList.add("card-body");


			const joinBtn = document.createElement("button");
			joinBtn.setAttribute('type', 'button');
			joinBtn.classList.add("btn","btn-success", "btn-lg","btn-block", "host-btns");
			joinBtn.textContent = "Join";
			joinBtn.id = data.host + "-btn";

			joinBtn.addEventListener('click', createBattle);

			cardBody.appendChild(joinBtn);
			wrapper.appendChild(cardHeader);
			wrapper.appendChild(cardBody);

			document.querySelector("#battleHosts").appendChild(wrapper);	    	
	    }

	});

	socket.on('host-battle-user', (data) => {
		/** Recreate this div and add it to document.
		<div class="card mb-3 mt-3">
			<div class="card-header">
			 Host: data.host
			</div>
			<div class="card-body">
				Waiting...
			</div>
		</div>			
		**/
	    //initiate Screen - start with computer total.
	    if(document.querySelector("#" + data.host) === null){
			const wrapper = document.createElement("div");
			wrapper.classList.add("card","mb-3","mt-3");
			wrapper.id = data.host;

			const cardHeader = document.createElement("div");
			cardHeader.classList.add("card-header");
			cardHeader.textContent = "Host: " + data.host + " (me)";


			const cardBody = document.createElement("div");
			cardBody.classList.add("card-body");


			cardBody.textContent = "Waiting...";

			wrapper.appendChild(cardHeader);
			wrapper.appendChild(cardBody);

			// Add self hosting to beginning of battle hosts.
			prependChild(document.querySelector('#battleHosts'), wrapper);
	    }

	});	

	socket.on('stop-host', (data)=>{
		let toRemove = document.querySelector("#" + data.host);

		while (toRemove.hasChildNodes()) {
		  toRemove.removeChild(toRemove.lastChild);
		}

		document.querySelector('#battleHosts').removeChild(toRemove);
	});

	//Set up a battle object and change joiner's view.
	function createBattle(evt){
		const removeBtnRegex = /-btn$/;
		const player1Slug = this.id.replace(removeBtnRegex, '');

		//If the user was hosting, remove host panel, add in battle button.
		let toRemove = document.querySelector("#" + userObj.slug);
		console.log(toRemove);
		if(toRemove !== null){
			document.querySelector('#stopHostBtn').classList.add("display-none");
			while (toRemove.hasChildNodes()) {
			  toRemove.removeChild(toRemove.lastChild);
			}

			document.querySelector('#battleHosts').removeChild(toRemove);
		}else{
			document.querySelector('#hostBtn').classList.add("display-none");
		}

		//Also remove joinBtn inside panel. Bug. Get child from div body instead
		document.querySelector("#" + player1Slug).removeChild(document.querySelector("#"+this.id));

		//Add the inbattle button
		document.querySelector('#inBattleBtn').classList.remove("display-none");

		socket.emit('create-battle', {player1: player1Slug, player2:userObj.slug});
	}

}  



function makeUserObj(userInfo){
	let user = userInfo.replace(/(\r\n|\n|\r)/gm, "").replace('{', '');
	user = user.replace('}', '');	
	user = user.replace(/'/g, "");
	user = user.split(' ').join('').split(',');

	let userObj = {};

	user = user.forEach((string) => {
		const keyValue = string.split(':');
		userObj[keyValue[0]] = keyValue[1];
	});
	return userObj;
}


//Prepend a child to the be the first child of a parent.
function prependChild(parentEle, newFirstChildEle) {
    parentEle.insertBefore(newFirstChildEle, parentEle.firstChild)
}
