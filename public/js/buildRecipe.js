// load button functionality
function buttonFunctions() {
    document.getElementById('addIngredient').addEventListener('click', addIngredients)
    document.getElementById('startOver').addEventListener('click', startOver)
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


    //Gets the child node containing the Recipe dropdown ID
    temp_dropdown = document.getElementsByClassName(className)[0].childNodes[4]
    
    // Changes the child node ID to match the class ID
    temp_dropdown.id = "ingredients"+ ingredientCount
    // Changes the onChange attribute to the script that listens for value selection change
    document.getElementById("ingredients"+ingredientCount).setAttribute('onchange','getVal('+ingredientCount+');');
    
    // Updates the first value after new recipe is created
    getVal(ingredientCount)
    }



// removes element that contains the button
function removeIngredient(ingredient) {
    document.getElementsByClassName(ingredient)[0].remove();

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

