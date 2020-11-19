// load button functionality
function buttonFunctions() {
    document.getElementById('addIngredient').addEventListener('click', addIngredients)
    document.getElementById('startOver').addEventListener('click', startOver)
    document.getElementById('ingredLink').addEventListener('click', ingredNav)
}


// adds a new div containing ingredient dropdown as well as option to remove element
let ingredientCount = 1;
function addIngredients() {
    ingredientCount++;
    let ingredientFields = document.getElementById('ingredientFields')
    let ingredientSelect = document.createElement('div');
    let className = 'ingredient' + ingredientCount
    ingredientSelect.className = 'added ' + className
    let htmlContent = document.getElementById('ingredientSelect').innerHTML
    htmlContent += '<button onclick="removeIngredient(\'' + className + '\');">Remove Ingredient</button>'
    htmlContent += '<br><a href="/ingredientEthics/2"id ="recipe_link'+ ingredientCount+ '">Ingredient Detail</a>'
    
     ingredientSelect.innerHTML = htmlContent
    ingredientFields.appendChild(ingredientSelect)
	let htmlContent2= '<script> getVal'+ ingredientCount+'() function getVal'+ ingredientCount+'() { var selectedVal = document.getElementById("ingredients'+ ingredientCount+'").value; var link = document.getElementById("recipe_link"); var final = /ingredientEthics/ + selectedVal link.setAttribute("href", final);console.log(selectedVal);}</script>'
	
	//let htmlContent2= 'function getVal2(){console.log("made it in here atleast")}'
   
   
    //document.getElementById('first').insertAdjacentHTML('beforeend', '<div id="idChild"> content html </div>');
    var test = document.createElement("script");
    test.innerHTML = htmlContent2;
    
    //document.getElementById("first").insertAdjacentHTML("afterend", test);
    console.log('first is',document.getElementById('first'))
    
    console.log("yo:", '<script> getVal'+ ingredientCount+'() function getVal'+ ingredientCount+'() { var selectedVal = document.getElementById("ingredients'+ ingredientCount+'").value; var link = document.getElementById("recipe_link"); var final = /ingredientEthics/ + selectedVal link.setAttribute("href", final);console.log(selectedVal);}</script>')
    // Used for bug testing
    curr = '<br><a href="/ingredientEthics/2"id ="recipe_link'+ ingredientCount+ '">Ingredient Detail</a>'
    name = "recipe_link" 
    
    //console.log("Ingredients are", curr, document.getElementById("recipe_link").parentElement)

    
    
    //Gets the child node containing the Recipe dropdown ID
    temp_dropdown = document.getElementsByClassName(className)[0].childNodes[4]
    
    // Changes the child node ID to match the class ID
    temp_dropdown.id = "ingredients"+ ingredientCount
    
    // Adds the getValX() to the code
    document.getElementById("ingredients"+ ingredientCount).setAttribute('onchange','getVal('+ingredientCount+');');
    console.log(document.getElementById("ingredient"+ ingredientCount))
   // Adds event listener for the newly created row
   start("ingredient"+ ingredientCount)

    }
// Event Listener for the dropdown menus
function start(num){
if (ingredientCount > 1){
document.getElementById(num).addEventListener("change", getVal(), false)
}}


// removes element that contains the button
function removeIngredient(ingredient) {
    document.getElementsByClassName(ingredient)[0].remove();

}

// Navigatees to the ingredient page
function ingredNav() {
    document.getElementById("ingredients").onchange = function() {
    
    document.getElementById("ingredLink").href = "/ingredlinks";
    
}
}

// removes added elements, does not affect recipe name or first ingredient selection
function startOver() {
    let addedElements = document.getElementsByClassName('added');
    for (var i = addedElements.length - 1; i >= 0 ; i--) {
        addedElements[i].remove(); 
    };
}

function getVal(){
var selectedVal = document.getElementById("ingredients").value;
var link = document.getElementById("recipe_link"+current_value);
var final = /ingredientEthics/ + selectedVal
   link.setAttribute("href", final);
console.log(selectedVal);
}

// wait for page content to load
document.addEventListener("DOMContentLoaded", buttonFunctions)
//window.addEventListener("load", start, false);
