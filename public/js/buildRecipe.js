function buttonFunctions() {
    document.getElementById('addIngredient').addEventListener('click', addIngredients)
}

let ingredientCount = 1;
function addIngredients() {
    ingredientCount++;
    let ingredientFields = document.getElementById('ingredientFields')
    let ingredientSelect = document.createElement('div');
    let className = 'ingredient' + ingredientCount
    ingredientSelect.className = className
    let htmlContent = document.getElementById('ingredientSelect').innerHTML
    htmlContent += '<button onclick="removeIngredient(\'' + className + '\');">Remove Ingredient</button>'
    ingredientSelect.innerHTML = htmlContent
    ingredientFields.appendChild(ingredientSelect)
}

function removeIngredient(ingredient) {
    document.getElementsByClassName(ingredient)[0].remove()
}

document.addEventListener("DOMContentLoaded", buttonFunctions)