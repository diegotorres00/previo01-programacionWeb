const formulario = document.querySelector("#formulario-login");
const contrasena = document.querySelector("#contrasena");
const botonMostrar = document.querySelector("#boton-mostrar");
const botonEntrar = document.querySelector("#boton-entrar");
const mensaje = document.querySelector("#mensaje");

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
		mostrarMensaje("Inicio de sesion correcto. Bienvenido, " + usuario + ".", "exito");
	} catch (error) {
		mostrarMensaje("No se pudo iniciar sesion. Intente nuevamente.", "error");
	} finally {
		cambiarEstadoBoton(false);
	}
}

function cambiarEstadoBoton(estaCargando) {
	botonEntrar.disabled = estaCargando;
	botonEntrar.textContent = estaCargando ? "Validando..." : "Iniciar sesion";
}

function mostrarMensaje(texto, tipo) {
	mensaje.textContent = texto;
	mensaje.className = "mensaje " + tipo;
}
