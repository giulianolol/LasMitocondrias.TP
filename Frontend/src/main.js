console.log("main cargado")
document.addEventListener("DOMContentLoaded", () => {
    resaltarNavActivo();
    manejarBienvenida();
    manejarFecha();
    verificarNombre();
    mostrarMouses();
    mostrarTeclados();
    mostrarTecladosPaginacion();
    configurarBotonesCategorias();
    inicializarCarrito();
    actualizarContadorCarrito();
    mostrarProductos();
    inicializarTema();
    initAltaFormulario();

    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", handleAdminLogin)
    }
    //Solo renderiza el carrito cuando estamos en la página del carrito
    if (document.getElementById('carrito-contenido')) {
        renderizarCarrito();
    }
    if (document.getElementById('ticket-body')) {
        renderTicketPage();
    }


    //Si estamos en modificaciones.html leemos el producto y podemos llenar el formulad
    if (location.pathname.endsWith('modificaciones.html')) {
        cargarProductoParaModificar();

        const form = document.getElementById('formModificar');
        if (form) {
            form.addEventListener('submit', guardarCambiosProducto);
        }
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const productoJSON = localStorage.getItem('productoParaModificar');
        if (!productoJSON) return console.warn('No hay producto para modificar en localStorage');

        const producto = JSON.parse(productoJSON);
        if (String(producto.id) !== id) {
            console.warn('El ID de la URL y el de localStorage no coinciden');
            return;
        }
    }

    document.getElementById('btn-teclados').addEventListener('click', mostrarSeccionTeclados);
    document.getElementById('btn-mouses').addEventListener('click', mostrarSeccionMouses);
});

let carrito = [];

//LOGIN
async function handleAdminLogin(event) {
    event.preventDefault();
    event.stopPropagation();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    try {
        console.log("Enviando request a:", "http://localhost:3000/api/administradores/login");

        const res = await fetch("http://localhost:3000/api/administradores/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })

        });

        console.log("Response status:", res.status);
        console.log("Response ok:", res.ok);

        // Leer la respuesta
        const responseData = await res.json();
        console.log("Response data:", responseData);

        if (!res.status.toString().startsWith("2")) {
            mostrarAlerta("Credenciales inválidas", "danger");
            throw new Error(responseData.error || "Credenciales inválidas");
        }

        const { token } = responseData;
        console.log("Token recibido:", token ? "OK" : "ERROR EN TOKEN");

        // Guardamos el JWT en localStorage
        localStorage.setItem("adminToken", token);

        // Redirigimos al dashboard
        mostrarAlerta("Login exitoso. Redirigiendo al dashboard...", "success");
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 2000);

    } catch (err) {
        console.error("Login error:", err);
    }
}

//FUNCION PARA CREAR PRODUCTO
async function crearProducto(nuevoProducto) {
    const token = localStorage.getItem("adminToken");
    if (!token) return window.location.href = "admin.html"; //VA A SALIR POR ACÁ SI NO ESTÁ LOGEADO =)

    const res = await fetch("http://localhost:3000/api/productos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(nuevoProducto)
    });

    if (!res.ok) throw new Error("No autorizado o fallo al crear producto");
    return await res.json();
}

// FUNCIÓN PARA PROBAR SI EL TOKEN EXPIRÓ - hecha para devs o para debugear ;)
function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Date.now() >= payload.exp * 1000;
}

// CARRITO
function inicializarCarrito() {
    const carritoLS = localStorage.getItem('carrito');
    carrito = carritoLS ? JSON.parse(carritoLS) : [];
    console.log(carrito)
}

function renderizarCarrito() {
    const contenidoCarrito = document.getElementById('carrito-contenido');
    const carritoVacio = document.getElementById('carrito-vacio');
    const contadorItems = document.getElementById('contador-items');
    const subtotal = document.getElementById('subtotal');
    const totalCarrito = document.getElementById('total-carrito');
    const btnProceder = document.getElementById('btn-proceder-compra');
    const btnVaciar = document.getElementById('btn-vaciar-carrito');
    const resumenCarrito = document.getElementById('resumen-carrito');

    if (!contenidoCarrito) return; // No estamos en la página del carrito

    // Calcular totales
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    const total = carrito.reduce((total, item) => total + (item.price * item.cantidad), 0);

    if (carrito.length === 0) {
        carritoVacio.style.display = 'block';
        resumenCarrito.style.display = 'none';
        contenidoCarrito.innerHTML = '';
        return;
    }

    carritoVacio.style.display = 'none';
    resumenCarrito.style.display = 'block';

    // Actualizar información del resumen
    if (contadorItems) contadorItems.textContent = totalItems;
    if (subtotal) subtotal.textContent = `$${total.toFixed(2)}`;
    if (totalCarrito) totalCarrito.textContent = `$${total.toFixed(2)}`;
    if (btnProceder) btnProceder.disabled = false;
    if (btnVaciar) btnVaciar.disabled = false;

    // carritoLocal = localStorage.getItem('carrito')
    // console.log(carritoLocal)

    // Generar HTML de los productos
    contenidoCarrito.innerHTML = `
        <div class="card shadow-sm">
            <div class="card-body">
                ${carrito.map(item => `
                    <div class="row align-items-center border-bottom py-3" data-producto-id="${item.id}">
                        <div class="col-md-2">
                            <img src="${item.imageUrl}" alt="${item.name}" class="img-fluid rounded" style="max-height: 80px; object-fit: cover;">
                        </div>
                        <div class="col-md-4">
                            <h6 class="mb-1">${item.name}</h6>
                            <small class="text-muted">${item.type}</small>
                        </div>
                        <div class="col-md-2 text-center">
                            <span class="fw-bold">$${item.price}</span>
                        </div>
                        <div class="col-md-2">
                            <div class="input-group input-group-sm">
                                <button class="btn btn-outline-secondary" type="button" onclick="cambiarCantidad('${item.name}', -1)">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="text" class="form-control text-center" value="${item.cantidad}" readonly>
                                <button class="btn btn-outline-secondary" type="button" onclick="cambiarCantidad('${item.name}', 1)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-2 text-center">
                            <div class="d-flex flex-column align-items-center">
                                <span class="fw-bold mb-2">$${(item.price * item.cantidad).toFixed(2)}</span>
                                <button class="btn btn-outline-danger btn-sm" onclick="eliminarDelCarrito('${item.name}')" title="Eliminar producto">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function cambiarCantidad(productoNombre, cambio) {


    const producto = carrito.find(item => item.name === productoNombre);
    if (!producto) return;

    const nuevaCantidad = producto.cantidad + cambio;

    if (nuevaCantidad <= 0) {
        eliminarDelCarrito(productoNombre);
    } else {
        producto.cantidad = nuevaCantidad;
        guardarCarrito();
        actualizarContadorCarrito();
        renderizarCarrito();

        if (cambio > 0) {
            mostrarAlerta(`Se agregó una unidad más de ${producto.name}`, "info");
        } else {
            mostrarAlerta(`Se quitó una unidad de ${producto.name}`, "info");
        }
    }
}

function eliminarDelCarrito(productoName) {

    const index = carrito.findIndex(item => item.name === productoName);
    if (index > -1) {
        const nombreProducto = carrito[index].name;
        carrito.splice(index, 1);
        guardarCarrito();
        actualizarContadorCarrito();
        renderizarCarrito();
        mostrarAlerta(`${nombreProducto} eliminado del carrito`, 'warning');
    }
}

function vaciarCarritoConfirmado() {
    carrito = [];
    guardarCarrito();
    actualizarContadorCarrito();
    renderizarCarrito();
    mostrarAlerta('Carrito vaciado completamente', 'success');
}

async function procederCompra() {
    if (carrito.length === 0) {
        mostrarAlerta('Tu carrito está vacío', 'warning');
        return;
    }

    const nombreUsuario = localStorage.getItem('nombreCliente') || 'Cliente';

    try {
        // Crear una venta
        const res = await fetch('http://localhost:3000/api/ventas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre_usuario: nombreUsuario }) 
        });

        if (!res.ok) {
            const error = await res.json();
            console.error('Error al registrar venta:', error);
            mostrarAlerta('Error al registrar la venta', 'danger');
            return;
        }

        const venta = await res.json();
        console.log('Venta registrada:', venta);

        // Guardar info para el ticket
        const compra = {
            productos: [...carrito],
            total: calcularTotalCarrito(),
            fecha: obtenerFecha(),
            cliente: nombreUsuario
        };

        localStorage.setItem('ultimaCompra', JSON.stringify(compra));

        carrito = [];
        guardarCarrito();
        actualizarContadorCarrito();

        mostrarAlerta('¡Compra realizada con éxito! Redirigiendo al ticket...', 'success');
        setTimeout(() => {
            window.location.href = 'ticket.html';
        }, 2000);

    } catch (err) {
        console.error('Error al procesar la compra:', err);
        mostrarAlerta('Ocurrió un error inesperado', 'danger');
    }
}


function actualizarContadorCarrito() {// Actualizar contador en navbar si existe
    const contadorNav = document.getElementById('contador-carrito');
    if (contadorNav) {
        const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
        contadorNav.textContent = totalItems;
        contadorNav.style.display = totalItems > 0 ? 'inline' : 'none';
    }

    // Actualizar contador en página de carrito si existe
    const contadorCarrito = document.getElementById('contador-items');
    if (contadorCarrito) {
        const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
        contadorCarrito.textContent = totalItems;
    }
}


function agregarAlCarrito(producto) {
    const productoExistente = carrito.find(item => item.id === producto.id);

    if (productoExistente) {
        productoExistente.cantidad += 1;
        mostrarAlerta(`Se agregó otra unidad de ${producto.name} al carrito (${productoExistente.cantidad} unidades)`, "info");
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
        mostrarAlerta(`${producto.name} agregado al carrito`, "success");
    }

    guardarCarrito();
    actualizarContadorCarrito();
    renderizarCarrito(); // Actualizar vista si estamos en la página del carrito
    console.log(carritoTest)
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

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

    mostrarAlerta(`¡Bienvenido, ${nombre}!`, "success");
    localStorage.setItem("nombreCliente", nombre);

    setTimeout(() => {
        window.location.href = "pages/productos.html";
    }, 2000);
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
    if (!seccionTeclados || !seccionMouses) return;  // <-- CORTO si no existen, SINO CRASHEA Y NO LLEGA A MOSTRAR EL CARRITO

    if (seccion === "teclados") {
        seccionTeclados.style.display = "block";
        seccionMouses.style.display = "none";
    } else {
        seccionTeclados.style.display = "none";
        seccionMouses.style.display = "block";
    }
}

function configurarBotonesCategorias() {
    const btnTeclados = document.getElementById("btn-teclados");
    const btnMouses = document.getElementById("btn-mouses");
    if (!btnTeclados || !btnMouses) return;  // <-- CORTO si no existen, SINO CRASHEA Y NO LLEGA A MOSTRAR EL CARRITO

    btnTeclados.addEventListener("click", () => mostrarSeccion("teclados"));
    btnMouses.addEventListener("click", () => mostrarSeccion("mouses"));

    // inicializo la vista
    mostrarSeccion("teclados");
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
    const botonTecl = document.getElementById('btn-teclados');
    const botonMous = document.getElementById('btn-mouses');

    if (temaGuardado === 'dark') {
        if (main) {
            main.classList.remove('bg-body-secondary');
            main.classList.add('bg-dark', 'text-white');
        }
        body.classList.remove('bg-body-secondary');
        body.classList.add('bg-dark', 'text-white');

        if (botonTecl) {
            botonTecl.classList.remove('btn-dark');
            botonTecl.classList.add('bg-completly-black');
        }

        if (botonMous) {
            botonMous.classList.remove('btn-dark');
            botonMous.classList.add('bg-completly-black');
        }

        if (card) {
            card.classList.remove('bg-light');
            // card.classList.add('bg-dark', 'text-white');
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

    inicializarTema();

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

    const contenedor = document.querySelector('#seccion-teclados .row');
    const spinner = document.getElementById('spinner');

    if (!contenedor || !spinner) return;

    // Mostrar spinner y limpiar contenedor
    spinner.style.display = 'block';
    contenedor.innerHTML = '';

    try {
        const res = await fetch('http://localhost:3000/api/productos');
        console.log('Petición a la API de productos realizada');

        if (!res.ok) throw new Error('Error al obtener productos');

        const productos = await res.json();
        console.log('Productos obtenidos:', productos);

        const teclados = productos.filter(p => p.type === 'teclado');
        console.log('Teclados filtrados:', teclados);

        teclados.forEach(teclado => {
            const col = document.createElement('div');
            col.className = 'col-md-4';
            console.log('Teclado procesado:', teclado);
            col.innerHTML = `
                <div class="card bg-dark text-white h-100 shadow-sm rounded-4">
                    <img src="${teclado.imageUrl}" class="card-img-top img-fluid object-fit-cover h-100" alt="${teclado.name}" />
                    <div class="card-body">
                        <h5 class="card-title text-white">${teclado.name}</h5>
                        <p class="card-text text-white">Tipo: ${teclado.type}</p>
                        <p class="card-text text-white">Precio: $${teclado.price}</p>
                        <p class="card-text text-success">Estado: ${teclado.active}</p>
                        <p class="card-text ">Stock: ${teclado.stock == null ? "Sin stock" : teclado.stock}</p>
                        <p class="card-text ">Descripción: ${acortarDescripcion(teclado.description, 100)}</p>
                    </div>
                </div>
            `;

            contenedor.appendChild(col);
        });

    } catch (err) {
        console.log('Error al cargar teclados:', err);
        mostrarAlerta('Error al cargar teclados', 'danger');
    } finally {
        spinner.style.display = 'none';
    }
}

async function mostrarMouses() {
    console.log('Cargando mouses...');

    const contenedor = document.querySelector('#seccion-mouses .row');
    const spinner = document.getElementById('spinner');

    if (!contenedor || !spinner) return;

    // Mostrar spinner y limpiar contenido anterior
    spinner.style.display = 'block';
    contenedor.innerHTML = '';

    try {
        const res = await fetch('http://localhost:3000/api/productos');
        console.log('Petición a la API de productos realizada');

        if (!res.ok) throw new Error('Error al obtener productos');

        const productos = await res.json();
        console.log('Productos obtenidos:', productos);

        const mouses = productos.filter(p => p.type === 'mouse');
        console.log('Mouses filtrados:', mouses);

        mouses.forEach(mouse => {
            const col = document.createElement('div');
            col.className = 'col-md-4';

            col.innerHTML = `
                <div class="card bg-dark text-white h-100 shadow-sm rounded-4">
                    <img src="${mouse.imageUrl}" class="card-img-top img-fluid object-fit-cover" style="height: 200px;" alt="${mouse.name}" />
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${mouse.name}</h5>
                        <p class="card-text">Tipo: ${mouse.type}</p>
                        <p class="card-text">Precio: $${mouse.price}</p>
                        <p class="card-text text-success">Estado: ${mouse.active}</p>
                        <p class="card-text">Stock: ${mouse.stock}</p>
                        <p class="card-text ">Descripción: ${acortarDescripcion(mouse.description, 100)}</p>
                        <div class="mt-auto">
                            <button class="btn btn-primary w-100" onclick="agregarAlCarrito(${JSON.stringify(mouse).replace(/"/g, '&quot;')})">
                                <i class="fas fa-shopping-cart me-2"></i>Agregar al carrito
                            </button>
                        </div>
                    </div>
                </div>
            `;

            contenedor.appendChild(col);
        });

    } catch (err) {
        mostrarAlerta('Error al cargar mouses', 'danger');
    } finally {
        spinner.style.display = 'none';
    }
}

async function mostrarTecladosPaginacion() {
    const contenedor = document.querySelector('#seccion-teclados .row');
    const spinner = document.getElementById('spinner');

    if (!contenedor || !spinner) return;

    spinner.style.display = 'block';
    contenedor.innerHTML = '';

    try {
        const res = await fetch('http://localhost:3000/api/productos');
        if (!res.ok) throw new Error('Error al obtener productos');

        const productos = await res.json();
        tecladosGlobal = productos.filter(p => p.type === 'teclado');
        paginaActual = 1;
        renderizarPaginaTeclados();

    } catch (err) {
        mostrarAlerta('Error al cargar teclados', 'danger');
    } finally {
        spinner.style.display = 'none';
    }
}

let tecladosGlobal = [];
let paginaActual = 1;
const tecladosPorPagina = 6;

function renderizarPaginaTeclados() {
    const contenedor = document.querySelector('#seccion-teclados .row');
    contenedor.innerHTML = '';

    const inicio = (paginaActual - 1) * tecladosPorPagina;
    const tecladosPagina = tecladosGlobal.slice(inicio, inicio + tecladosPorPagina);

    tecladosPagina.forEach(teclado => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        col.innerHTML = `
            <div  class="card bg-dark text-white h-100 shadow-sm rounded-4 teclados">
                <img src="${teclado.imageUrl}" class="card-img-top img-fluid object-fit-cover" style="height: 200px;" alt="${teclado.name}" />
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${teclado.name}</h5>
                    <p class="card-text">Tipo: ${teclado.type}</p>
                    <p class="card-text">Precio: $${teclado.price}</p>
                    <p class="card-text text-success">Estado: ${teclado.active}</p>
                    <p class="card-text ">Stock: ${teclado.stock == null ? "Sin stock" : teclado.stock}</p>
                    <p class="card-text ">Descripción: ${acortarDescripcion(teclado.description, 100)}</p>
                    <div class="mt-auto">
                        <button class="btn btn-primary w-100" onclick="agregarAlCarrito(${JSON.stringify(teclado).replace(/"/g, '&quot;')})">
                            <i class="fas fa-shopping-cart me-2"></i>Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>
        `;

        contenedor.appendChild(col);

    });

    renderizarControlesPaginacion();
}

function renderizarControlesPaginacion() {
    let paginador = document.getElementById('paginador');
    if (!paginador) {
        paginador = document.createElement('div');
        paginador.id = 'paginador';
        paginador.className = 'text-center mt-4';
        document.querySelector('#seccion-teclados').appendChild(paginador);
    }

    paginador.innerHTML = '';

    const totalPaginas = Math.ceil(tecladosGlobal.length / tecladosPorPagina);
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `btn btn-sm mx-1 ${i === paginaActual ? 'btn-primary' : 'btn-secondary'}`;
        btn.addEventListener('click', () => {
            paginaActual = i;
            renderizarPaginaTeclados();
        });
        paginador.appendChild(btn);
    }
}

function imprimirTicket() {
    const contenido = document.querySelector('.card').innerHTML;

    const ventana = window.open('', '_blank', 'width=800,height=600');
    ventana.document.write(`
        <html>
            <head>
                <title>Ticket</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body { margin: 20px; }
                </style>
            </head>
            <body>
                <div class="card mx-auto" style="max-width: 600px;">
                    ${contenido}
                </div>
            </body>
        </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.close();
}

async function mostrarMousesPaginacion() {
    const contenedor = document.querySelector('#seccion-mouses .row');
    const spinner = document.getElementById('spinner');

    if (!contenedor || !spinner) return;

    spinner.style.display = 'block';
    contenedor.innerHTML = '';

    try {
        const res = await fetch('http://localhost:3000/api/productos');
        if (!res.ok) throw new Error('Error al obtener productos');

        const productos = await res.json();
        mousesGlobal = productos.filter(p => p.type === 'mouse');
        paginaMouses = 1;
        renderizarPaginaMouses();

    } catch (err) {
        mostrarAlerta('Error al cargar mouses', 'danger');
    } finally {
        spinner.style.display = 'none';
    }
}

let mousesGlobal = [];
let paginaMouses = 1;
const mousesPorPagina = 6;

function renderizarPaginaMouses() {
    const contenedor = document.querySelector('#seccion-mouses .row');
    contenedor.innerHTML = '';

    const inicio = (paginaMouses - 1) * mousesPorPagina;
    const mousesPagina = mousesGlobal.slice(inicio, inicio + mousesPorPagina);

    mousesPagina.forEach(mouse => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        col.innerHTML = `
            <div class="card bg-dark text-white h-100 shadow-sm rounded-4">
                <img src="${mouse.imageUrl}" class="card-img-top img-fluid object-fit-cover" style="height: 200px;" alt="${mouse.name}" />
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${mouse.name}</h5>
                    <p class="card-text">Tipo: ${mouse.type}</p>
                    <p class="card-text">Precio: $${mouse.price}</p>
                    <p class="card-text text-success">Estado: ${mouse.active}</p>
                    <p class="card-text">Stock: ${mouse.stock == null ? "Sin stock" : mouse.stock}</p>
                    <p class="card-text">Descripción: ${acortarDescripcion(mouse.description, 100)}</p>
                    <div class="mt-auto">
                        <button class="btn btn-primary w-100" onclick="agregarAlCarrito(${JSON.stringify(mouse).replace(/"/g, '&quot;')})">
                            <i class="fas fa-shopping-cart me-2"></i>Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>
        `;
        contenedor.appendChild(col);
    });

    renderizarControlesPaginacionMouses();
}

function renderizarControlesPaginacionMouses() {
    const paginador = document.getElementById('paginacion-mouses');
    paginador.innerHTML = '';

    const totalPaginas = Math.ceil(mousesGlobal.length / mousesPorPagina);
    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `btn btn-sm mx-1 ${i === paginaMouses ? 'btn-primary' : 'btn-secondary'}`;
        btn.addEventListener('click', () => {
            paginaMouses = i;
            renderizarPaginaMouses();
        });
        paginador.appendChild(btn);
    }
}

function mostrarSeccionTeclados() {
    document.getElementById('seccion-teclados').style.display = 'block';
    document.getElementById('seccion-mouses').style.display = 'none';
    mostrarTecladosPaginacion();
}

function mostrarSeccionMouses() {
    document.getElementById('seccion-teclados').style.display = 'none';
    document.getElementById('seccion-mouses').style.display = 'block';
    mostrarMousesPaginacion();
}

// console.log(carritoTest)

function eliminarDelLocalStorage(clave) {
    localStorage.removeItem(clave);
}


async function mostrarProductos() {
    console.log('Cargando productos...');

    const tbody = document.getElementById('tabla-productos');
    const spinner = document.getElementById('spinner');

    if (!tbody) return;

    if (spinner) spinner.style.display = 'block';
    tbody.innerHTML = '';

    try {
        const res = await fetch('http://localhost:3000/api/productos');
        if (!res.ok) throw new Error('Error al obtener productos');

        const productos = await res.json();
        console.log('Productos obtenidos:', productos);

        productos.forEach(producto => {
            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${producto.id_product}</td>
                <td>${producto.name}</td>
                <td>$${producto.price}</td>
                <td>${producto.active ? 'Sí' : 'No'}</td>
                <td>
                    <div class="form-check form-switch d-inline-block me-2">
                        <input class="form-check-input" type="checkbox" 
                               ${producto.active ? 'checked' : ''} 
                               onchange="toggleProductoEstado(${producto.id}, this.checked, this)"
                               title="${producto.active ? 'Desactivar producto' : 'Activar producto'}">
                    </div>
                    <a class="btn btn-sm btn-warning me-1" onclick="modificarProducto(${producto.id})">Modificar</a>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${producto.id})">Eliminar</button>
                </td>
            `;

            tbody.appendChild(fila);
        });

    } catch (err) {
        console.error(err);
        mostrarAlerta('Error al cargar productos', 'danger');
    } finally {
        if (spinner) spinner.style.display = 'none';
    }
}
// Función para manejar el cambio de estado del producto - MOMENTANEA
async function toggleProductoEstado(id, nuevoEstado) {
    try {
        // Obtenemos
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('token');

        const headers = {
            'Content-Type': 'application/json'
        };

        // Agregamos auth, no sé ya por que no funciona esto
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`http://localhost:3000/api/productos/${id}/toggle`, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify({ active: nuevoEstado })
        });

        console.log(res)

        if (!res.ok) throw new Error('Error al actualizar el estado del producto');

        // Actualizar la columna de estado en la tabla
        const fila = event.target.closest('tr');
        const columnaEstado = fila.children[3];
        columnaEstado.textContent = nuevoEstado ? 'Sí' : 'No';

        // Actualizar el tooltip del switch, al final funcionó :)
        event.target.title = nuevoEstado ? 'Desactivar producto' : 'Activar producto';

        mostrarAlerta(`Producto ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`, 'success');

    } catch (err) {
        console.error(err);
        mostrarAlerta('Error al cambiar el estado del producto', 'danger');

        // Revertir el switch si hubo error
        event.target.checked = !nuevoEstado;
    }
}

async function eliminarProducto(id) {

    try {
        //Obtener el token de admin
        const token = localStorage.getItem('adminToken');
        if (!token) {
            mostrarAlerta('No tienes un token de administrador. Por favor, inicia sesión de nuevo.', 'danger');
            return;
        }

        //Llamada a la API
        const res = await fetch(`http://localhost:3000/api/productos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }

        });

        //Manejo de respuestas HTTP
        if (res.status === 401) {
            mostrarAlerta('ERROR No autorizado. Inicia sesión como administrador.', 'danger');
            return;
        }
        if (res.status === 404) {
            mostrarAlerta(`ERROR Producto con ID ${id} no encontrado.`, 'danger');
            return;
        }
        if (!res.ok) {
            // otros errores de servidor
            const errorText = await res.text();
            mostrarAlerta(`Error al eliminar (status ${res.status}): ${errorText}`, 'danger');
            return;
        }

        //Éxito
        mostrarAlerta('OK Producto eliminado correctamente', 'success');
        mostrarProductos(); // recargamos tu tabla o galería

    } catch (error) {
        console.error('Error al eliminar producto:', error);
        mostrarAlerta('ALERT Ocurrió un error inesperado al eliminar el producto.', 'danger');
    }
}

//TICKET

function renderTicketPage() {
    const compraJSON = localStorage.getItem('ultimaCompra');
    if (!compraJSON) return;  // no hay nada que mostrar

    const { productos, total, fecha, cliente } = JSON.parse(compraJSON);

    // Poner nombre y fecha
    document.getElementById('nameTicket').textContent = cliente;
    document.getElementById('fechaCompleta').textContent = fecha;

    const tbody = document.getElementById('ticket-body');
    tbody.innerHTML = '';  // por si acaso

    productos.forEach(item => {
        const precio = parseFloat(item.price);
        const cantidad = item.cantidad || 1;
        const subtotal = precio * cantidad;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>${item.type}</td>
            <td>$${precio.toFixed(2)}</td>
            <td>${cantidad}</td>
            <td>$${subtotal.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });

    // Mostrar total al pie de tabla
    document.getElementById('ticket-total').textContent = `$${parseFloat(total).toFixed(2)}`;
}

function calcularTotalCarrito() {
    return carrito.reduce((acumulado, item) => {
        const precio = parseFloat(item.price);
        const cantidad = item.cantidad || 1;
        return acumulado + precio * cantidad;
    }, 0);
}

//MODIFICACIÖN
async function modificarProducto(id) {

    try {
        const token = localStorage.getItem('adminToken');
        console.log('Token de administrador:', token);
        const res = await fetch(`http://localhost:3000/api/productos/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al obtener el producto');
        const producto = await res.json();
        localStorage.setItem('productoParaModificar', JSON.stringify(producto));
        // Llevamos el id en la query string (creo que no es necesario igualmente)
        window.location.href = `modificaciones.html?id=${id}`;
    } catch (err) {
        console.error(err);
        mostrarAlerta('No se pudo preparar la modificación del producto.', 'danger');
    }

}

function cargarProductoParaModificar() {
    const productoJSON = localStorage.getItem('productoParaModificar');
    if (!productoJSON) {
        console.warn('No hay producto para modificar en localStorage');
        return;
    }
    const p = JSON.parse(productoJSON);

    console.log(p)

    // Campo oculto para el ID
    let inputId = document.getElementById('productoId');
    if (!inputId) {
        inputId = document.createElement('input');
        inputId.type = 'hidden';
        inputId.id = 'productoId';
        document.querySelector('form').prepend(inputId);
    }
    inputId.value = p.id;

    // Nombre
    const nombre = document.getElementById('nombre');
    if (nombre) nombre.value = p.name || '';

    // Descripción
    const descripcion = document.getElementById('descripcion');
    if (descripcion) descripcion.value = p.description || '';

    // Precio
    const precio = document.getElementById('precio');
    if (precio) precio.value = p.price || '';

    // Stock
    const stock = document.getElementById('stock');
    if (stock) stock.value = p.stock || '';

    // Activo
    const activo = document.getElementById('activo');
    if (activo) activo.value = String(p.active);

    // Tipo
    const tipo = document.getElementById('type');
    if (tipo) tipo.value = p.type || '';

    // Preview de imagen
    const fileInput = document.getElementById('imagen');
    if (fileInput) {
        const preview = document.createElement('img');
        preview.src = p.imageUrl;
        preview.alt = 'Imagen actual';
        preview.style.maxWidth = '200px';
        preview.style.display = 'block';
        preview.style.marginTop = '0.5rem';
        fileInput.parentNode.append(preview);
    }

    // Metadatos de creación y actualización
    const contenedor = document.querySelector('main.container') || document.body;
    const meta = document.createElement('p'); //creamos un parrafo "dinamico"
    meta.innerText = `Creado: ${new Date(p.createdAt).toLocaleString()} | Actualizado: ${new Date(p.updatedAt).toLocaleString()}`; //le asignamos el texto con las fechas
    contenedor.prepend(meta); // añadimos el parrafo antes de cualquier otro hijo, así el "meta" queda arriba/primero
}

async function guardarCambiosProducto(e) {
    e.preventDefault(); // evita que recargue la página

    const id = document.getElementById('productoId').value;
    const name = document.getElementById('nombre').value;
    const description = document.getElementById('descripcion').value;
    const price = document.getElementById('precio').value;
    const stock = document.getElementById('stock').value;
    const active = document.getElementById('activo').value === 'true';
    const token = localStorage.getItem('adminToken');

    const payload = {
        name,
        description,
        price,
        stock,
        active
    };

    console.log(payload)

    try {
        const res = await fetch(`http://localhost:3000/api/productos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Error al actualizar el producto');
        }

        mostrarAlerta('Producto actualizado con éxito', 'success');

        // Limpiamos y redirigimos
        localStorage.removeItem('productoParaModificar');
        window.location.href = 'dashboard.html';
    } catch (err) {
        console.error(err);
        mostrarAlerta('Error al guardar cambios: ' + err.message, 'danger');
    }
}

function acortarDescripcion(texto, maxCaracteres) {

    if (texto === null || texto === undefined) {
        return "Sin descripción disponible";
    }
    if (texto.length <= maxCaracteres) {
        return texto;
    }

    const textoRecortado = texto.slice(0, maxCaracteres);

    // Cortar en el último espacio para no partir palabras
    const ultimoEspacio = textoRecortado.lastIndexOf(" ");

    if (ultimoEspacio === -1) {
        return textoRecortado + "...";
    }

    return textoRecortado.slice(0, ultimoEspacio) + "...";
}


// ALTA PRODUCTIO
async function altaProducto(producto, token) {
    const res = await fetch('http://localhost:3000/api/productos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(producto)
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || 'Error al crear producto');
    }
    return res.json();
}

// manejar el submit del formulario
async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem('adminToken');
    if (!token) {
        ('Error en la sesión - TOKEN INVALIDO.');
        return;
    }

    const ahora = new Date();

    const fechaFormateada = ahora.toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const activeValue = document.getElementById('activo').value;
    const producto = {
        name: document.getElementById('nombre').value.trim(),
        description: document.getElementById('descripcion').value.trim(),
        price: parseFloat(document.getElementById('precio').value),
        stock: parseInt(document.getElementById('stock').value, 10),
        active: activeValue === 'true',
        imageUrl: document.getElementById('imagen').value.trim(),
        type: document.getElementById('tipoSwitch').checked ? 'teclado' : 'mouse',
        createdAt: fechaFormateada,
        updatedAt: fechaFormateada

    };

    console.log('Payload de altaProducto:', producto)

    try {
        const creado = await altaProducto(producto, token);
        console.log(creado)
        mostrarAlerta(`Producto "${creado.name}" creado con ID ${creado.id}`, 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html'; // redirigir al dashboard
        }, 2000);
        // Limpiar el formulario
        document.querySelector('form').reset();
    } catch (err) {
        console.log(creado)
        console.error(err);
        mostrarAlerta(`No se pudo crear el producto: ${err.message}`, 'danger');
    }
}

// funcion solo para vincular el evento
function initAltaFormulario() {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
}
