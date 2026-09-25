const formulario = document.querySelector("#formulario-login");
const contrasena = document.querySelector("#contrasena");
const botonMostrar = document.querySelector("#boton-mostrar");
const botonEntrar = document.querySelector("#boton-entrar");
const mensaje = document.querySelector("#mensaje");
const tarjetaLogin = document.querySelector(".tarjeta");
const seccionProductos = document.querySelector("#seccion-productos");
const listaProductos = document.querySelector("#lista-productos");
const listaCategorias = document.querySelector("#lista-categorias");
const textoBusqueda = document.querySelector("#texto-busqueda");
const mensajeProductos = document.querySelector("#mensaje-productos");
const cantidadCarrito = document.querySelector("#cantidad-carrito");
let productos = [];
let pedido = [];

botonMostrar.addEventListener("click", mostrarContrasena);
formulario.addEventListener("submit", iniciarSesion);

function mostrarContrasena() {
	if (contrasena.type === "password") {
		contrasena.type = "text";
		botonMostrar.textContent = "Ocultar";
	} else {
		contrasena.type = "password";
		botonMostrar.textContent = "Mostrar";
	}
}

async function iniciarSesion(evento) {
	evento.preventDefault();
	const datos = new FormData(formulario);
	const usuario = datos.get("usuario").trim();
	const clave = datos.get("contrasena");

	if (!usuario || !clave) {
		mostrarMensaje("Debe completar todos los campos.", "error");
		return;
	}

	cambiarEstadoBoton(true);

	try {
		const respuesta = await fetch("https://fakestoreapi.com/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username: usuario, password: clave })
		});

		const resultado = await respuesta.json();

		if (!respuesta.ok || !resultado.token) {
			throw new Error("Usuario o contraseña incorrectos.");
		}

		sessionStorage.setItem("tokenShopOnline", resultado.token);
		mostrarProductos();
	} catch (error) {
		mostrarMensaje("No se pudo iniciar sesion. Intente nuevamente.", "error");
	} finally {
		cambiarEstadoBoton(false);
	}
}

async function mostrarProductos() {
	tarjetaLogin.hidden = true;
	seccionProductos.hidden = false;
	mostrarMensajeProducto("Cargando productos...", "");

	try {
		const respuesta = await fetch("https://fakestoreapi.com/products");
		const datos = await respuesta.json();
		productos = Array.isArray(datos) ? datos : [datos];
		mostrarCategorias();
		mostrarListaProductos(productos);
		mostrarMensajeProducto("", "");
	} catch (error) {
		mostrarMensajeProducto("No se pudieron cargar los productos.", "error");
	}
}

function mostrarCategorias() {
	const categorias = ["Todas", ...new Set(productos.map((producto) => producto.category))];
	listaCategorias.innerHTML = "";

	categorias.forEach((categoria) => {
		const boton = document.createElement("button");
		boton.textContent = categoria;
		boton.type = "button";
		boton.addEventListener("click", () => filtrarCategoria(categoria));
		listaCategorias.appendChild(boton);
	});
}

function mostrarListaProductos(lista) {
	listaProductos.innerHTML = "";

	if (lista.length === 0) {
		mostrarMensajeProducto("No se encontraron productos.", "error");
		return;
	}

	lista.forEach((producto) => {
		const tarjeta = document.createElement("article");
		tarjeta.className = "producto";
		tarjeta.innerHTML = `
			<img src="${producto.image}" alt="${producto.title}">
			<h2>${producto.title}</h2>
			<p class="precio">$${producto.price.toFixed(2)}</p>
			<button class="boton-agregar" type="button">Agregar</button>
		`;
		tarjeta.querySelector(".boton-agregar").addEventListener("click", () => agregarAlPedido(producto));
		listaProductos.appendChild(tarjeta);
	});
}

function filtrarCategoria(categoria) {
	const botones = listaCategorias.querySelectorAll("button");
	botones.forEach((boton) => boton.classList.toggle("seleccionada", boton.textContent === categoria));
	const resultado = categoria === "Todas" ? productos : productos.filter((producto) => producto.category === categoria);
	mostrarListaProductos(resultado);
}

function buscarProductos() {
	const texto = textoBusqueda.value.toLowerCase().trim();
	const resultado = productos.filter((producto) => producto.title.toLowerCase().includes(texto));
	mostrarListaProductos(resultado);
}

function agregarAlPedido(producto) {
	pedido.push(producto);
	cantidadCarrito.textContent = pedido.length;
	mostrarMensajeProducto("Producto agregado al pedido.", "exito");
}

function mostrarMensajeProducto(texto, tipo) {
	mensajeProductos.textContent = texto;
	mensajeProductos.className = "mensaje " + tipo;
}

function cambiarEstadoBoton(estaCargando) {
	botonEntrar.disabled = estaCargando;
	botonEntrar.textContent = estaCargando ? "Validando..." : "Iniciar sesion";
}

function mostrarMensaje(texto, tipo) {
	mensaje.textContent = texto;
	mensaje.className = "mensaje " + tipo;
}

document.querySelector("#boton-buscar").addEventListener("click", buscarProductos);
document.querySelector("#boton-carrito").addEventListener("click", () => {
	mostrarMensajeProducto("El carrito se habilitara en la siguiente parte del proyecto.", "");
});
document.querySelector("#boton-salir").addEventListener("click", () => {
	sessionStorage.removeItem("tokenShopOnline");
	seccionProductos.hidden = true;
	tarjetaLogin.hidden = false;
	pedido = [];
	cantidadCarrito.textContent = "0";
});
