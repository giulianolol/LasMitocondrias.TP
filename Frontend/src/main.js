document.addEventListener("DOMContentLoaded", () => {
    inicializarTema();
    resaltarNavActivo();
    manejarBienvenida();
    manejarFecha();
    verificarNombre();
    mostrarTeclados();
    configurarBotonesCategorias();
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

function manejarBienvenida() {
    const btn = document.getElementById("btnIngresar");
    if (btn) {
        btn.addEventListener("click", guardarNombre);
    }
}

function guardarNombre() {
    const nombre = document.getElementById("nombreUsuario").value.trim();
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/;

    if (nombre === "" || !regex.test(nombre)) {
        mostrarAlerta("Por favor, ingresá un nombre válido (solo letras, mínimo 2 caracteres).", "danger");
        return;
    }
    localStorage.setItem("nombreCliente", nombre);
    window.location.href = "pages/productos.html";

}

function verificarNombre() {
    const pagina = location.pathname.split("/").pop();
    const paginasProtegidas = ["productos.html", "carrito.html", "ticket.html"];

    if (paginasProtegidas.includes(pagina)) {
        const nombre = localStorage.getItem("nombreCliente");
        if (!nombre) {
            window.location.href = "pages/index.html";
        } else {
            const contenedorSaludo = document.getElementById("nameTicket");
            if (contenedorSaludo) {
                contenedorSaludo.textContent = `${nombre}`;
            }
        }
    }
}

function configurarBotonesCategorias() {
    const btnTeclados = document.getElementById("btn-teclados");
    const btnMouses = document.getElementById("btn-mouses");

    if (btnTeclados && btnMouses) {
        btnTeclados.addEventListener("click", () => mostrarSeccion("teclados"));
        btnMouses.addEventListener("click", () => mostrarSeccion("mouses"));
    }

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

function manejarFecha() {
    const fecha = document.getElementById("fechaCompleta");
    if (fecha) {
        fecha.textContent = obtenerFecha();
    }
}

function obtenerFecha() {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const año = hoy.getFullYear();
    return `${dia}/${mes}/${año}`;
}

function inicializarTema() {
    const temaGuardado = localStorage.getItem('tema') || 'light';
    document.documentElement.setAttribute('data-bs-theme', temaGuardado);

    const boton = document.getElementById('botonTema');
    if (boton) {
        boton.textContent = temaGuardado === 'dark' ? '🌞' : '🌙';
    }

    const main = document.querySelector('main');
    const body = document.body;
    const card = document.querySelector('.card');
    const navbar = document.querySelector('header');
    const footer = document.querySelector('footer');


    if (temaGuardado === 'dark') {
        if (main) {
            main.classList.remove('bg-body-secondary');
            main.classList.add('bg-dark', 'text-white');
        }
        body.classList.remove('bg-body-secondary');
        body.classList.add('bg-dark', 'text-white');

        if (card) {
            card.classList.remove('bg-light');
            card.classList.add('bg-secondary', 'text-white');
        }

        if (navbar) {
            navbar.classList.remove('bg-dark', 'bg-primary', 'text-white');
            navbar.classList.add('bg-completly-black', 'text-white');
        }
        if (footer) {
            footer.classList.remove('bg-dark', 'bg-primary', 'text-white');
            footer.classList.add('bg-completly-black', 'text-white');
        }

    } else {
        if (main) {
            main.classList.remove('bg-dark', 'text-white');
            main.classList.add('bg-body-secondary');
        }
        body.classList.remove('bg-dark', 'text-white');
        body.classList.add('bg-body-secondary');

        if (card) {
            card.classList.remove('bg-secondary', 'text-white');
            card.classList.add('bg-light');
        }

        if (navbar) {
            navbar.classList.remove('bg-completly-black', 'text-white', 'sombra-suave', 'borde-inferior');
            navbar.classList.add('bg-dark', 'text-white');
        }
        if (footer) {
            footer.classList.remove('bg-completly-black', 'text-white', 'sombra-suave', 'borde-superior');
            footer.classList.add('bg-dark', 'text-white');
        }
    }
}

function cambiarTema() {
    const actual = document.documentElement.getAttribute('data-bs-theme');
    const nuevo = actual === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', nuevo);
    localStorage.setItem('tema', nuevo);

    const botonTema = document.getElementById('botonTema');
    if (botonTema) {
        botonTema.textContent = nuevo === 'dark' ? '🌞' : '🌙';
    }

    const main = document.querySelector('main');
    const body = document.body;
    const card = document.querySelector('.card');
    const navbar = document.querySelector('header');
    const footer = document.querySelector('footer');

    if (nuevo === 'dark') {
        if (main) {
            main.classList.remove('bg-body-secondary');
            main.classList.add('bg-dark', 'text-white');
        }

        body.classList.remove('bg-body-secondary');
        body.classList.add('bg-dark', 'text-white');

        if (card) {
            card.classList.remove('bg-light');
            card.classList.add('bg-secondary', 'text-white');
        }

        if (navbar) {
            navbar.classList.remove('bg-dark', 'bg-primary', 'text-white');
            navbar.classList.add('bg-completly-black', 'text-white', 'sombra-suave', 'borde-inferior');
        }

        if (footer) {
            footer.classList.remove('bg-dark', 'bg-primary', 'text-white');
            footer.classList.add('bg-completly-black', 'text-white', 'sombra-suave', 'borde-superior');
        }

    } else {
        if (main) {
            main.classList.remove('bg-dark', 'text-white');
            main.classList.add('bg-body-secondary');
        }

        body.classList.remove('bg-dark', 'text-white');
        body.classList.add('bg-body-secondary');

        if (card) {
            card.classList.remove('bg-secondary', 'text-white');
            card.classList.add('bg-light');
        }

        if (navbar) {
            navbar.classList.remove('bg-completly-black', 'text-white', 'sombra-suave', 'borde-inferior');
            navbar.classList.add('bg-dark', 'text-white');
        }

        if (footer) {
            footer.classList.remove('bg-completly-black', 'text-white', 'sombra-suave', 'borde-superior');
            footer.classList.add('bg-dark', 'text-white');
        }
    }
}

function mostrarAlerta(mensaje, tipo = "success", duracion = 3000) {
    const container = document.getElementById("alert-container");

    const alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.role = "alert";
    alerta.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    container.appendChild(alerta);

    setTimeout(() => {
        alerta.classList.remove("show");
        alerta.classList.add("hide");
        alerta.addEventListener("transitionend", () => alerta.remove());
    }, duracion);
}

async function mostrarTeclados() {
    console.log('Cargando teclados...');

    try {
        const res = await fetch('http://localhost:3000/api/productos');
        console.log('Petición a la API de productos realizada');

        if (!res.ok) throw new Error('Error al obtener productos');

        const productos = await res.json();
        console.log('Productos obtenidos:', productos);

        const teclados = productos.filter(p => p.categoria === 'teclado');
        const contenedor = document.querySelector('#seccion-teclados .row');
        if (!contenedor) return;

        contenedor.innerHTML = ''; // Limpiar lo anterior

        teclados.forEach(teclado => {
            const col = document.createElement('div');
            col.className = 'col-md-4';

            col.innerHTML = `
                <div class="card bg-dark text-white h-100 shadow-sm rounded-4">
                    <img src="${teclado.imagen}" class="card-img-top" alt="${teclado.nombre}" />
                    <div class="card-body">
                        <h5 class="card-title">${teclado.nombre}</h5>
                        <p class="card-text">Tipo: ${teclado.tipo}</p>
                        <p class="card-text">Precio: $${teclado.precio}</p>
                        <p class="card-text text-success">Estado: ${teclado.estado}</p>
                        <p class="card-text">${teclado.descripcion}</p>
                    </div>
                </div>
            `;

            contenedor.appendChild(col);
        });

    } catch (err) {
        console.error('Error al cargar teclados:', err);
    }
}


