document.getElementById("menuToggle").addEventListener("click", function() {
    document.getElementById("navLinks").classList.toggle("active");
});

document.querySelectorAll(".dropdown-toggle").forEach(item => {
    item.addEventListener("click", function() {
        let dropdownMenu = this.nextElementSibling;
        dropdownMenu.classList.toggle("show");
    });
});

document.addEventListener("click", function(event) {
    if (!event.target.closest(".navbar")) {
        document.getElementById("navLinks").classList.remove("active");
        document.querySelectorAll(".dropdown-menu").forEach(menu => menu.classList.remove("show"));
    }
});
