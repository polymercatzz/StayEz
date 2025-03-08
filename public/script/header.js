document.getElementById("menuToggle").addEventListener("click", function () {
    document.getElementById("navLinks").classList.toggle("active");
});

document.addEventListener("click", function (event) {
    if (!event.target.closest(".navbar")) {
        document.getElementById("navLinks").classList.remove("active");
    }
});

let popup = document.getElementById("popup");

function openPopup() {
    popup.classList.add("openPopup");
}

function closePopup() {
    popup.classList.remove("openPopup");
}