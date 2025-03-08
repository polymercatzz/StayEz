document.getElementById("menuToggle").addEventListener("click", function () {
    document.getElementById("navLinks").classList.toggle("active");
});

document.addEventListener("click", function (event) {
    if (!event.target.closest(".navbar")) {
        document.getElementById("navLinks").classList.remove("active");
    }
});

// popup
function openPopup() {
    popup.classList.add("openPopup");
    document.getElementById("overlay").classList.add("active");
}

function closePopup() {
    popup.classList.remove("openPopup");
    document.getElementById("overlay").classList.remove("active");
}