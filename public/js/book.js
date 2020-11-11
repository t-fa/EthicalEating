
// retrieves recipeID from index.handlebars (after a search) and passes it to app.js for the POST req
function addRecipe(recipeID) {
    // console.log(recipeID);    
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipeID: recipeID })
    };
    fetch('/addRecipe', options)
        .then(data => data.json())
        .then(result => {
        // Success! Redirect to recipe page.
        if (result.error !== null && typeof result.error !== "undefined") {
            window.alert(result.error);
        } else {
            window.location.href = "/book";
        }
    }).catch(err => {
        // There was an error, display this to the user.
        console.log("Error :(", err);
    });
};


function handleIngredientReplacementFormSubmit(event) {
    // Prevent default submit behavior.
    event.preventDefault();

    const replaceWith = document.querySelector(
      `input[name="replaceWithID"]:checked`
    ).value;
    let replaceWithID = null;
    if (replaceWith !== "null" && Number.isInteger(Number(replaceWith))) {
      replaceWithID = Number(replaceWith);
    }

    const originalID = document.querySelector(
      `input[name="originalIngredientID"]`
    ).value;
    let toReplaceID = null;
    if (originalID !== null && Number.isInteger(Number(originalID))) {
      toReplaceID = Number(originalID);
    }

    const urlObj = new URL(window.location.href);
    const recipeIDParam = urlObj.searchParams.get("recipeID");

    let recipeID = null;
    if (recipeIDParam !== null && Number.isInteger(Number(recipeIDParam))) {
      recipeID = Number(recipeIDParam);
    }

    if (toReplaceID === null || replaceWithID === null || recipeID === null) {
      console.log(
        "one or more require params null,",
        toReplaceID,
        replaceWithID,
        recipeID
      );
      return;
    }

    const options = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ toReplaceID, replaceWithID }),
    };
    // recipe ID query parameter
    fetch(`/userRecipe/${recipeID}/ingredients`, options)
      .then(data => data.json())
      .then(result => {
        // Success! Redirect to recipe page.
        if (result.error) {
            console.log("Replacement error:", result.error);
            return;
        }
        // Go back to the recipe page.
        history.back();
      })
      .catch((err) => {
        // There was an error, display this to the user.
        console.log("Replacement Error :(", err);
      });
}

function attachListeners() {
    const ingredientReplacementForm = document.getElementById("submitIngredientReplacement");
    if (ingredientReplacementForm) {
        ingredientReplacementForm.addEventListener("submit", handleIngredientReplacementFormSubmit);
    }
};

/*-----------------------------------------------------------------------------------*/
/* Table sort code citation: https://www.w3schools.com/howto/howto_js_sort_table.asp */
/*-----------------------------------------------------------------------------------*/

function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("recipeBookTable");
    switching = true;
    // direction = ascending
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
        // Start by saying: no switching is done:
        switching = false;
        rows = table.rows;
        /* Loop through all table rows (except the
        first, which contains table headers): */
        for (i = 1; i < (rows.length - 1); i++) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            /* Get the two elements you want to compare,
            one from current row and one from the next: */
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            /* Check if the two rows should switch place,
            based on the direction, asc or desc: */
            if (y.innerHTML.toLowerCase() != "") {
                if (dir == "asc") {
                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                        // If so, mark as a switch and break the loop:
                        shouldSwitch = true;
                        break;
                    }
                } else if (dir == "desc") {
                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                        // If so, mark as a switch and break the loop:
                        shouldSwitch = true;
                        break;
                    }
                }
            }
        }
        if (shouldSwitch) {
            /* If a switch has been marked, make the switch
            and mark that a switch has been done: */
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            // Each time a switch is done, increase this count by 1:
            switchcount++;
        } else {
            /* If no switching has been done AND the direction is "asc",
            set the direction to "desc" and run the while loop again. */
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", attachListeners);
