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
    htmlContent += '<a href="/ingredientEthics/1"><button>Link Text</button></a>'
    console.log("Ingredients are")
    ingredientSelect.innerHTML = htmlContent
    ingredientFields.appendChild(ingredientSelect)

    
}

// removes element that contains the button
function removeIngredient(ingredient) {
    document.getElementsByClassName(ingredient)[0].remove();

}

// Navigatees to the ingredient page
function ingredNav() {
    document.getElementById("ingredients").onchange = function() {
    
    document.getElementById("ingredLink").href = "google.com";
    
}
}

// removes added elements, does not affect recipe name or first ingredient selection
function startOver() {
    let addedElements = document.getElementsByClassName('added');
    for (var i = addedElements.length - 1; i >= 0 ; i--) {
        addedElements[i].remove(); 
    };
}

// wait for page content to load
document.addEventListener("DOMContentLoaded", buttonFunctions)
