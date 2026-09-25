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
const seccionCarrito = document.querySelector("#seccion-carrito");
const tablaCarritos = document.querySelector("#tabla-carritos");
const listaCarritosContenedor = document.querySelector("#lista-carritos-contenedor");
const detallePedido = document.querySelector("#detalle-pedido");
const tablaDetalle = document.querySelector("#tabla-detalle");
const tituloPedido = document.querySelector("#titulo-pedido");
const totalPedido = document.querySelector("#total-pedido");
const mensajeCarrito = document.querySelector("#mensaje-carrito");
let productos = [];
let pedido = [];
let carritos = [];
let carritoSeleccionado = null;

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

async function mostrarCarritos() {
	seccionProductos.hidden = true;
	seccionCarrito.hidden = false;
	listaCarritosContenedor.hidden = false;
	detallePedido.hidden = true;
	tablaCarritos.innerHTML = "<tr><td colspan='3'>Cargando pedidos...</td></tr>";

	try {
		const respuesta = await fetch("https://fakestoreapi.com/carts/user/2");
		const datos = await respuesta.json();
		carritos = Array.isArray(datos) ? datos : [datos];
		mostrarTablaCarritos();
	} catch (error) {
		tablaCarritos.innerHTML = "<tr><td colspan='3'>No se pudieron cargar los pedidos.</td></tr>";
	}
}

function mostrarTablaCarritos() {
	tablaCarritos.innerHTML = "";

	if (carritos.length === 0) {
		tablaCarritos.innerHTML = "<tr><td colspan='3'>No hay pedidos para este usuario.</td></tr>";
		return;
	}

	carritos.forEach((carrito) => {
		const fila = document.createElement("tr");
		const fecha = carrito.date ? new Date(carrito.date).toLocaleDateString("es-CO") : "Sin fecha";
		fila.innerHTML = `<td>${carrito.id}</td><td>${fecha}</td><td><button class="boton-ver" type="button">Ver</button></td>`;
		fila.querySelector(".boton-ver").addEventListener("click", () => mostrarDetallePedido(carrito));
		tablaCarritos.appendChild(fila);
	});
}

function mostrarDetallePedido(carrito) {
	carritoSeleccionado = carrito;
	listaCarritosContenedor.hidden = true;
	detallePedido.hidden = false;
	tituloPedido.textContent = "Pedido " + carrito.id;
	mostrarTablaDetalle();
}

function mostrarTablaDetalle() {
	tablaDetalle.innerHTML = "";
	let total = 0;

	carritoSeleccionado.products.forEach((productoPedido) => {
		const producto = productos.find((item) => item.id === productoPedido.productId);
		if (!producto) return;

		const fila = document.createElement("tr");
		const subtotal = producto.price * productoPedido.quantity;
		total += subtotal;
		fila.innerHTML = `
			<td>${producto.title}</td>
			<td><input class="cantidad-producto" type="number" min="1" value="${productoPedido.quantity}" data-id="${producto.id}"></td>
			<td>$${producto.price.toFixed(2)}</td>
			<td>$${subtotal.toFixed(2)}</td>
		`;
		tablaDetalle.appendChild(fila);
	});

	totalPedido.textContent = "$" + total.toFixed(2);
}

function actualizarPedido() {
	const campos = tablaDetalle.querySelectorAll(".cantidad-producto");
	campos.forEach((campo) => {
		const producto = carritoSeleccionado.products.find((item) => item.productId === Number(campo.dataset.id));
		producto.quantity = Math.max(1, Number(campo.value) || 1);
	});
	mostrarTablaDetalle();
	mostrarMensajeCarrito("Pedido actualizado.", "exito");
}

function confirmarPedido() {
	mostrarMensajeCarrito("Pedido confirmado.", "exito");
}

function mostrarMensajeCarrito(texto, tipo) {
	mensajeCarrito.textContent = texto;
	mensajeCarrito.className = "mensaje " + tipo;
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
	mostrarCarritos();
});

function salirDeLaCuenta() {
	sessionStorage.removeItem("tokenShopOnline");
	seccionProductos.hidden = true;
	seccionCarrito.hidden = true;
	tarjetaLogin.hidden = false;
	pedido = [];
	cantidadCarrito.textContent = "0";
}

document.querySelector("#boton-salir").addEventListener("click", salirDeLaCuenta);
document.querySelector("#boton-salir-carrito").addEventListener("click", salirDeLaCuenta);
document.querySelector("#volver-productos").addEventListener("click", () => {
	seccionCarrito.hidden = true;
	seccionProductos.hidden = false;
});
document.querySelector("#seguir-comprando").addEventListener("click", () => {
	seccionCarrito.hidden = true;
	seccionProductos.hidden = false;
});
document.querySelector("#volver-carritos").addEventListener("click", () => {
	detallePedido.hidden = true;
	listaCarritosContenedor.hidden = false;
	mostrarMensajeCarrito("", "");
});
document.querySelector("#actualizar-pedido").addEventListener("click", actualizarPedido);
document.querySelector("#confirmar-pedido").addEventListener("click", confirmarPedido);
