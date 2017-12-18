function main(){
	// This is a hidden input. It takes input from server that tells client-side
	// if the user was actually registered.
	const validation = document.querySelector("#validation");
	
	// Using a value and input to handle validation.
	// Show the div if the registration input is invalid.
	if(validation.value.length > 1){
		const div = document.querySelector("#invalid");
		div.classList.remove("message");
	}
}

document.addEventListener("DOMContentLoaded", main);
