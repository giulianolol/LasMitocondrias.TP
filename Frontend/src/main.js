document.addEventListener("DOMContentLoaded", () => {
    resaltarNavActivo();
    manejarBienvenida();
    verificarNombreEnPaginasProtegidas();
    configurarBotonesCategorias();  // <-- agregamos esta función acá
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


function configurarBotonesCategorias() {
    const btnTeclados = document.getElementById("btn-teclados");
    const btnMouses = document.getElementById("btn-mouses");

    if (btnTeclados && btnMouses) {
        console.log("Botones de categorías encontrados" + btnTeclados + " y " + btnMouses);
        btnTeclados.addEventListener("click", () => mostrarSeccion("teclados"));
        btnMouses.addEventListener("click", () => mostrarSeccion("mouses"));
    }

    // Mostrar la sección de teclados por defecto
    mostrarSeccion("teclados");
}

function mostrarSeccion(seccion) {
    const seccionTeclados = document.getElementById("seccion-teclados");
    const seccionMouses = document.getElementById("seccion-mouses");

    if (seccion === "teclados") {
        seccionTeclados.style.display = "block";
        seccionMouses.style.display = "none";
    } else if (seccion === "mouses") {
        seccionTeclados.style.display = "none";
        seccionMouses.style.display = "block";
    }
}