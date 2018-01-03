document.addEventListener('DOMContentLoaded', main);

function main(evt){
	const createPropBtn = document.querySelector('.createBtn')
	console.log(createPropBtn);
	createPropBtn.addEventListener('click', createNewProperty);

	const contentDiv = document.querySelector('#content');

	function createNewProperty(evt){
		evt.preventDefault();	

		removeAllChildren(contentDiv);

		console.log('whatsapp');
	}

}


function removeAllChildren(node){
	while(node.firstChild){
		node.removeChild(node.firstChild);
	}
}
