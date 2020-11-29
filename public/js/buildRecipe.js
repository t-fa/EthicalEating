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
    htmlContent += '<button onclick="removeIngredient(\'' + className + '\');" style = "border-radius: 6px;">Remove Ingredient</button>'
    htmlContent += '<br><a href="/ingredientEthics/2" class="ingredient-detail-popup" id ="recipe_link'+ ingredientCount+ '">Ingredient Detail</a>'
    
    ingredientSelect.innerHTML = htmlContent
    ingredientFields.appendChild(ingredientSelect)

    addCustomLink(className, ingredientCount)
    
    }

//Creates a direct link for the ingredient selected at the current selection box
function addCustomLink(currentClass, currentCount){

    temp_dropdown = document.getElementsByClassName(currentClass)[0].childNodes[4]
    temp_dropdown.id = "ingredients"+ currentCount 
    document.getElementById("ingredients"+currentCount).setAttribute('onchange','getVal('+currentCount+');');
    getVal(currentCount)
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


// getToolTipData fetches JSON data for the ingredient at link and calls callback.
function getToolTipData(link, callback) {
    const fetchOptions = {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    };
    fetch(link, fetchOptions)
        .then(data => data.json())
        .then(jsonData => callback(null, jsonData))
        .catch(err => callback(err, null));
}

getVal(1)
function getVal(num)
{
    var selectedVal = document.getElementById("ingredients"+num).value;
    var link = document.getElementById("recipe_link"+num);
    var final = /ingredientEthics/ + selectedVal

    // Attribution: Used bootstrap documentation to set up popover code.
    // https://getbootstrap.com/docs/4.0/components/popovers/
    link.setAttribute("href", final);
    link.setAttribute("tabindex", 0);
    link.setAttribute("data-html", true);
    link.setAttribute("data-toggle", "popover");
    link.setAttribute("data-trigger", "focus");
    link.setAttribute("data-placement", "right");
    link.classList.add("ingredient-detail-popup");

    // fetch pop-over tooltip data to populate the tip for this particular link.
    getToolTipData(final, function(err, data) {
        if (err) {
            // if there's an error loading the tooltip data, then
            // fallback to default link behavior.
            link.removeEventListener("click", function(event) {
                event.preventDefault();
            });
            return;
        }
        // no error loading tool tip data, so show the pop-over
        // tool tip instead of linking to the ingredients page.
        link.addEventListener("click", function(event) {
            event.preventDefault();
        });
        link.setAttribute("data-original-title", `${data.ingredient.name}<br />${data.ingredient.description}`);
        const noProblems = `This ingredient has no ethical issues. Great choice!`;
        const hasProblems = `This ingredient has some ethical downsides because of the amount of water required to produce it. You could consider replacing it with one of the following options.`;

        // Set the popover data depending on if there are replacements or not.
        if (!data.ingredientReplacements.length) {
            link.setAttribute("data-content", noProblems);
                $('[data-toggle="popover"]').popover({ "html": true });
            link.innerHTML = "Ethically OK <i class='material-icons'>done</i>";
        } else {
            link.innerHTML = "See Ethical Alternatives <i class='material-icons'>warning</i>";
            // build an LI tag for all the ingredientReplacements
            const ingredientLI = data.ingredientReplacements.map(r =>
                `<li><strong><a href="/ingredientEthics/${r.ingredientIDReplacement}?backAction=close" target="_blank">${r.name}</strong></a> ${r.replacementReason} <a href="${r.replacementReasonSource}" target="_blank">[source]</a></li>`).join("");
            link.setAttribute("data-content", `${hasProblems}<br /><br /><ul>${ingredientLI}</ul>`);
            $('[data-toggle="popover"]').popover({ "html": true });
        }
    });
}

$(function () {
    // Attribution: Used bootstrap documentation to set up popover code.
    // https://getbootstrap.com/docs/4.0/components/popovers/
    $('[data-toggle="popover"]').popover();
    $('.popover-dismiss').popover({ trigger: "focus" });
    const $showProblemsButton = $("button#toggle-show-problems");
    const showMeProblems = "Show Me Ethical Problems";
    const hideProblems = "Hide Ethical Problems";
    $("button#toggle-show-problems").click(function() {
        $("html").toggleClass("ingredient-detail-popup-hidden");
        const currentText = $showProblemsButton.text();
        if (currentText === showMeProblems) {
            $showProblemsButton.text(hideProblems);
        } else {
            $showProblemsButton.text(showMeProblems);
        }
    });
    $("html").addClass("ingredient-detail-popup-hidden");
});
