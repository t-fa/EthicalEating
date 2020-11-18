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
    // Used for bug testing
    curr = '<br><a href="/ingredientEthics/2"id ="recipe_link'+ ingredientCount+ '">Ingredient Detail</a>'
    name = "recipe_link" 
    
    //console.log("Ingredients are", curr, document.getElementById("recipe_link").parentElement)
    ingredientSelect.innerHTML = htmlContent
    ingredientFields.appendChild(ingredientSelect)
    
    //Gets the child node containing the Recipe dropdown ID
    temp_dropdown = document.getElementsByClassName(className)[0].childNodes[4]
    // Changes the child node ID to match the class ID
    temp_dropdown.id = "ingredient"+ ingredientCount
    console.log(document.getElementsByClassName(className)[0].childNodes[4])
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
