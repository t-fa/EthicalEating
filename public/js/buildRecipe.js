function buttonFunctions() {
    document.getElementById('addIngredient').addEventListener('click', addIngredients)
    document.getElementById('startOver').addEventListener('click', startOver)
}

let ingredientCount = 1;
function addIngredients() {
    ingredientCount++;
    let ingredientFields = document.getElementById('ingredientFields')
    let ingredientSelect = document.createElement('div');
    let className = 'ingredient' + ingredientCount
    ingredientSelect.className = 'added ' + className
    let htmlContent = document.getElementById('ingredientSelect').innerHTML
    htmlContent += '<button onclick="removeIngredient(\'' + className + '\');">Remove Ingredient</button>'
    ingredientSelect.innerHTML = htmlContent
    ingredientFields.appendChild(ingredientSelect)
}

function removeIngredient(ingredient) {
    document.getElementsByClassName(ingredient)[0].remove();
}

function startOver() {
    
    let addedElements = document.getElementsByClassName('added');
    console.log(addedElements);
    for (var i = addedElements.length - 1; i >= 0 ; i--) {
        addedElements[i].remove(); 
    };
}

document.addEventListener("DOMContentLoaded", buttonFunctions)