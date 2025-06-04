document.addEventListener("DOMContentLoaded", () => {
    resaltarNavActivo();
});

function resaltarNavActivo() {
    const paginaActual = location.pathname.split("/").pop().toLowerCase(); 

    document.querySelectorAll(".nav-link").forEach(link => {
        const href = link.getAttribute("href").split("/").pop().toLowerCase(); 
        if (href === paginaActual || (paginaActual === "" && href === "home.html")) {
            link.classList.add("active-border");
        } else {
            link.classList.remove("active-border");
        }
    });
}