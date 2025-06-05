document.addEventListener("DOMContentLoaded", () => {
    resaltarNavActivo();
    manejarBienvenida();
    verificarNombreEnPaginasProtegidas();
});

// Resalta el ítem del navbar activo
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

// Si estamos en bienvenida.html, prepara el botón
function manejarBienvenida() {
    const btn = document.getElementById("btnIngresar");
    if (btn) {
        btn.addEventListener("click", guardarNombre);
    }
}

// Guarda el nombre y redirige
function guardarNombre() {
    const nombre = document.getElementById("nombreUsuario").value.trim();
    if (nombre === "") {
        alert("Por favor, ingresá tu nombre.");
        return;
    }
    localStorage.setItem("nombreCliente", nombre);
    console.log("Nombre ingresado:", nombre);
    window.location.href = "pages/productos.html";

}

// En productos, carrito, ticket: verificar si hay nombre cargado
function verificarNombreEnPaginasProtegidas() {
    const pagina = location.pathname.split("/").pop();
    const paginasProtegidas = ["productos.html", "carrito.html", "ticket.html"];

    if (paginasProtegidas.includes(pagina)) {
        const nombre = localStorage.getItem("nombreCliente");
        if (!nombre) {
            window.location.href = "pages/index.html";
        } else {
            const contenedorSaludo = document.getElementById("saludoNavbar");
            if (contenedorSaludo) {
                contenedorSaludo.textContent = `Hola ${nombre}, ¡bienvenido!`;
            }
        }
    }
}