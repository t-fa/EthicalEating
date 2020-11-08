document.querySelectorAll("a.toggle-replacements").forEach((el) => {
    el.addEventListener("click", function(event) {
        event.preventDefault();
        // If text is "see Alternatives", change it to "hide" onClick, or vice-versa.
        el.textContent = el.textContent === "(see Alternatives)" ? "(hide Alternatives)" : "(see Alternatives)";

        // Toggle the display of alternatives.
        document.getElementById(event.target.dataset.toggleLi).classList.toggle("hidden");
    });
});
