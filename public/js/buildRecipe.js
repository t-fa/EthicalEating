function buttonFunctions() {
    document.getElementById('addIngredient').addEventListener('click', addIngredients)
}

let ingredientCount = 1;
function addIngredients() {
    ingredientCount++;
    var objTo = document.getElementById('ingredientFields')
    var divtest = document.createElement('div');

    var ingredientSelect = document.getElementById('ingredientSelect').innerHTML


    divtest.innerHTML = ingredientSelect
    objTo.appendChild(divtest)
}

document.addEventListener("DOMContentLoaded", buttonFunctions)