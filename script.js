// ================================================================
// MERCADO ALBION · PROYECTO FINAL DE JAVASCRIPT
// Catálogo, filtros, carrito, localStorage, formulario y DolarAPI.
// ================================================================

// 1. CATÁLOGO: los productos se guardan en un array de objetos.
const productos = [
  { id: 1, nombre: "Miel de campo", categoria: "dulces", detalle: "500 g · de Esperanza, Santa Fe", precio: 6500, stock: 12, emoji: "🍯", fondo: "fondo-amarillo" },
  { id: 2, nombre: "Dulce de leche artesanal", categoria: "dulces", detalle: "450 g · receta tradicional", precio: 5200, stock: 8, emoji: "🍮", fondo: "fondo-crema" },
  { id: 3, nombre: "Yerba mate orgánica", categoria: "infusiones", detalle: "1 kg · con palo, estacionada", precio: 7800, stock: 15, emoji: "🧉", fondo: "fondo-verde" },
  { id: 4, nombre: "Té en hebras frutal", categoria: "infusiones", detalle: "100 g · frutos rojos e hibisco", precio: 4300, stock: 10, emoji: "🫖", fondo: "fondo-rosa" },
  { id: 5, nombre: "Café de especialidad", categoria: "infusiones", detalle: "250 g · tostado medio, en grano", precio: 9900, stock: 6, emoji: "☕", fondo: "fondo-marron" },
  { id: 6, nombre: "Mix energético", categoria: "frutos-secos", detalle: "300 g · maní, pasas y nueces", precio: 6900, stock: 9, emoji: "🥜", fondo: "fondo-arena" },
  { id: 7, nombre: "Almendras tostadas", categoria: "frutos-secos", detalle: "200 g · sin sal", precio: 8400, stock: 0, emoji: "🌰", fondo: "fondo-arena" },
  { id: 8, nombre: "Granola casera", categoria: "almacen", detalle: "400 g · avena, miel y semillas", precio: 5600, stock: 11, emoji: "🥣", fondo: "fondo-crema" },
  { id: 9, nombre: "Aceite de oliva extra virgen", categoria: "almacen", detalle: "500 ml · de San Juan", precio: 12500, stock: 5, emoji: "🫒", fondo: "fondo-verde" },
  { id: 10, nombre: "Mermelada de frutilla", categoria: "dulces", detalle: "390 g · de Coronda, Santa Fe", precio: 4800, stock: 7, emoji: "🍓", fondo: "fondo-rosa" },
  { id: 11, nombre: "Pasas de uva", categoria: "frutos-secos", detalle: "250 g · morochas, sin semilla", precio: 3900, stock: 9, emoji: "🍇", fondo: "fondo-arena" },
  { id: 12, nombre: "Arroz yamaní", categoria: "almacen", detalle: "1 kg · integral, de Entre Ríos", precio: 3200, stock: 14, emoji: "🍚", fondo: "fondo-crema" }
];

// 2. ELEMENTOS DEL HTML.
const contenedorProductos = document.querySelector("#productos");
const buscador = document.querySelector("#buscador");
const filtros = document.querySelector("#filtros");
const mensajeSinResultados = document.querySelector("#sin-resultados");
const contadorCarrito = document.querySelector("#contador-carrito");
const panelCarrito = document.querySelector("#carrito");
const velo = document.querySelector("#velo");
const listaCarrito = document.querySelector("#lista-carrito");
const mensajeCarritoVacio = document.querySelector("#carrito-vacio");
const totalCarrito = document.querySelector("#total-carrito");
const totalCheckout = document.querySelector("#total-checkout");
const formulario = document.querySelector("#form-compra");
const cotizacionDolar = document.querySelector("#cotizacion-dolar");
const estadoCotizacion = document.querySelector("#cotizacion-estado");

// 3. ESTADO DE LA TIENDA.
let categoriaActiva = "todos";
let carrito = cargarCarrito();
let cotizacionVenta = null;

// Formato de moneda argentina: $ 12.500.
const formatoPesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0
});

function formatearPesos(valor) {
  return formatoPesos.format(valor).replace("$", "$ ");
}

// 4. TAREA 1: dibujar los productos desde el array.
function mostrarProductos(lista) {
  contenedorProductos.innerHTML = "";

  lista.forEach((producto) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "producto";
    tarjeta.dataset.id = producto.id;
    tarjeta.dataset.categoria = producto.categoria;

    if (producto.stock === 0) {
      tarjeta.classList.add("agotado");
    }

    const imagen = document.createElement("div");
    imagen.className = `producto-imagen ${producto.fondo}`;
    imagen.textContent = producto.emoji;

    const informacion = document.createElement("div");
    informacion.className = "producto-info";

    const categoria = document.createElement("span");
    categoria.className = "producto-categoria";
    categoria.textContent = nombreCategoria(producto.categoria);

    const nombre = document.createElement("h3");
    nombre.className = "producto-nombre";
    nombre.textContent = producto.nombre;

    const detalle = document.createElement("p");
    detalle.className = "producto-detalle";
    detalle.textContent = producto.detalle;

    const precio = document.createElement("p");
    precio.className = "producto-precio";
    precio.append(document.createTextNode(formatearPesos(producto.precio)));

    const precioUsd = document.createElement("span");
    precioUsd.className = "precio-usd";
    precioUsd.textContent = cotizacionVenta
      ? `≈ US$ ${(producto.precio / cotizacionVenta).toFixed(2).replace(".", ",")}`
      : "≈ US$ —";
    precio.append(precioUsd);

    const boton = document.createElement("button");
    boton.className = "btn-agregar";
    boton.type = "button";
    boton.dataset.accion = "agregar";
    boton.textContent = producto.stock === 0 ? "Sin stock" : "Agregar al carrito";
    boton.disabled = producto.stock === 0;

    informacion.append(categoria, nombre, detalle, precio, boton);
    tarjeta.append(imagen, informacion);
    contenedorProductos.append(tarjeta);
  });

  mensajeSinResultados.classList.toggle("oculto", lista.length !== 0);
}

function nombreCategoria(categoria) {
  const nombres = {
    dulces: "Dulces",
    infusiones: "Infusiones",
    "frutos-secos": "Frutos secos",
    almacen: "Almacén"
  };
  return nombres[categoria] || categoria;
}

// 5. TAREA 2: combinar filtro de categoría y buscador.
function aplicarFiltros() {
  const texto = buscador.value.trim().toLowerCase();

  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria =
      categoriaActiva === "todos" || producto.categoria === categoriaActiva;
    const coincideTexto = producto.nombre.toLowerCase().includes(texto);
    return coincideCategoria && coincideTexto;
  });

  mostrarProductos(productosFiltrados);
}

filtros.addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-categoria]");
  if (!boton) return;

  categoriaActiva = boton.dataset.categoria;

  filtros.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("activo", chip === boton);
  });

  aplicarFiltros();
});

buscador.addEventListener("input", aplicarFiltros);

// 6. TAREA 3: carrito y delegación de eventos.
function agregarAlCarrito(id) {
  const producto = productos.find((item) => item.id === id);
  if (!producto || producto.stock === 0) return;

  const productoEnCarrito = carrito.find((item) => item.id === id);

  if (productoEnCarrito) {
    if (productoEnCarrito.cantidad >= producto.stock) {
      return;
    }
    productoEnCarrito.cantidad++;
  } else {
    carrito.push({ id: producto.id, cantidad: 1 });
  }

  actualizarCarrito();
}

contenedorProductos.addEventListener("click", (evento) => {
  const boton = evento.target.closest('[data-accion="agregar"]');
  if (!boton) return;

  const tarjeta = boton.closest(".producto");
  agregarAlCarrito(Number(tarjeta.dataset.id));
});

listaCarrito.addEventListener("click", (evento) => {
  const boton = evento.target.closest("[data-accion]");
  if (!boton) return;

  const item = boton.closest(".carrito-item");
  const id = Number(item.dataset.id);
  const accion = boton.dataset.accion;
  const productoEnCarrito = carrito.find((producto) => producto.id === id);

  if (!productoEnCarrito) return;

  if (accion === "sumar") {
    const producto = productos.find((item) => item.id === id);
    if (productoEnCarrito.cantidad < producto.stock) {
      productoEnCarrito.cantidad++;
    }
  } else if (accion === "restar") {
    productoEnCarrito.cantidad--;
    if (productoEnCarrito.cantidad <= 0) {
      carrito = carrito.filter((producto) => producto.id !== id);
    }
  } else if (accion === "quitar") {
    carrito = carrito.filter((producto) => producto.id !== id);
  }

  actualizarCarrito();
});

function dibujarCarrito() {
  listaCarrito.innerHTML = "";

  carrito.forEach((item) => {
    const producto = productos.find((elemento) => elemento.id === item.id);
    if (!producto) return;

    const fila = document.createElement("li");
    fila.className = "carrito-item";
    fila.dataset.id = producto.id;

    const emoji = document.createElement("span");
    emoji.className = "carrito-item-emoji";
    emoji.textContent = producto.emoji;

    const informacion = document.createElement("div");
    informacion.className = "carrito-item-info";

    const nombre = document.createElement("p");
    nombre.className = "carrito-item-nombre";
    nombre.textContent = producto.nombre;

    const precio = document.createElement("p");
    precio.className = "carrito-item-precio";
    precio.textContent = `${formatearPesos(producto.precio)} c/u`;
    informacion.append(nombre, precio);

    const cantidad = document.createElement("div");
    cantidad.className = "cantidad";

    const restar = crearBotonCantidad("−", "restar");
    const numero = document.createElement("span");
    numero.textContent = item.cantidad;
    const sumar = crearBotonCantidad("+", "sumar");
    cantidad.append(restar, numero, sumar);

    const quitar = crearBotonCantidad("🗑", "quitar");
    quitar.className = "btn-quitar";
    quitar.setAttribute("aria-label", `Quitar ${producto.nombre}`);

    fila.append(emoji, informacion, cantidad, quitar);
    listaCarrito.append(fila);
  });
}

function crearBotonCantidad(texto, accion) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.dataset.accion = accion;
  boton.textContent = texto;
  return boton;
}

function calcularTotal() {
  return carrito.reduce((total, item) => {
    const producto = productos.find((elemento) => elemento.id === item.id);
    return total + (producto ? producto.precio * item.cantidad : 0);
  }, 0);
}

function actualizarCarrito() {
  dibujarCarrito();

  const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);
  const total = calcularTotal();

  contadorCarrito.textContent = cantidadTotal;
  totalCarrito.textContent = formatearPesos(total);
  totalCheckout.textContent = formatearPesos(total);
  mensajeCarritoVacio.classList.toggle("oculto", carrito.length !== 0);

  contadorCarrito.classList.remove("salto");
  // Reiniciar la animación del contador cuando cambia la cantidad.
  void contadorCarrito.offsetWidth;
  contadorCarrito.classList.add("salto");

  guardarCarrito();
}

// 7. TAREA 4: abrir y cerrar el panel lateral.
function abrirCarrito() {
  panelCarrito.classList.add("abierto");
  velo.classList.add("visible");
}

function cerrarCarrito() {
  panelCarrito.classList.remove("abierto");
  velo.classList.remove("visible");
}

document.querySelector("#btn-carrito").addEventListener("click", abrirCarrito);
document.querySelector("#btn-cerrar-carrito").addEventListener("click", cerrarCarrito);
velo.addEventListener("click", cerrarCarrito);

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") cerrarCarrito();
});

document.querySelector("#btn-vaciar").addEventListener("click", () => {
  carrito = [];
  actualizarCarrito();
});

document.querySelector("#btn-finalizar").addEventListener("click", () => {
  cerrarCarrito();
});

// 8. TAREA 5: guardar y recuperar el carrito con localStorage.
function guardarCarrito() {
  try {
    localStorage.setItem("carritoMercadoAlbion", JSON.stringify(carrito));
  } catch (error) {
    console.error("No se pudo guardar el carrito:", error);
  }
}

function cargarCarrito() {
  try {
    const datosGuardados = localStorage.getItem("carritoMercadoAlbion");
    if (!datosGuardados) return [];

    const datos = JSON.parse(datosGuardados);
    if (!Array.isArray(datos)) return [];

    // Se descartan productos inexistentes o cantidades incorrectas.
    return datos.filter((item) => {
      const producto = productos.find((elemento) => elemento.id === item.id);
      return producto &&
        Number.isInteger(item.cantidad) &&
        item.cantidad > 0 &&
        item.cantidad <= producto.stock;
    });
  } catch (error) {
    console.warn("El carrito guardado no era válido. Se inicia vacío.", error);
    return [];
  }
}

// 9. TAREA 6: validación del formulario de compra.
function mostrarError(campo, mensaje) {
  const input = document.querySelector(`#${campo}`);
  const error = document.querySelector(`#error-${campo}`);

  input.classList.toggle("invalido", mensaje !== "");
  error.textContent = mensaje;
}

function validarFormulario() {
  let formularioValido = true;

  const nombre = document.querySelector("#nombre").value.trim();
  const email = document.querySelector("#email").value.trim();
  const telefono = document.querySelector("#telefono").value.replace(/\s/g, "");
  const entrega = document.querySelector("#entrega").value;
  const direccion = document.querySelector("#direccion").value.trim();
  const terminos = document.querySelector("#terminos").checked;

  const errores = {
    nombre: nombre.length < 3 ? "Ingresá al menos 3 letras." : "",
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Ingresá un email válido." : "",
    telefono: !/^\d{8,}$/.test(telefono) ? "Ingresá al menos 8 números." : "",
    entrega: entrega === "" ? "Elegí cómo querés recibir tu pedido." : "",
    direccion: entrega === "envio" && direccion === "" ? "Ingresá la dirección de entrega." : "",
    terminos: !terminos ? "Tenés que aceptar que te contactemos." : ""
  };

  Object.entries(errores).forEach(([campo, mensaje]) => {
    mostrarError(campo, mensaje);
    if (mensaje !== "") formularioValido = false;
  });

  return formularioValido;
}

// Al corregir un campo, su mensaje de error desaparece.
["nombre", "email", "telefono", "entrega", "direccion"].forEach((id) => {
  const campo = document.querySelector(`#${id}`);
  campo.addEventListener("input", () => {
    mostrarError(id, "");
  });
  campo.addEventListener("change", () => {
    mostrarError(id, "");
  });
});

document.querySelector("#terminos").addEventListener("change", () => {
  mostrarError("terminos", "");
});

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (carrito.length === 0) {
    abrirCarrito();
    mensajeCarritoVacio.textContent = "Agregá al menos un producto antes de confirmar tu compra.";
    return;
  }

  if (!validarFormulario()) return;

  const nombre = document.querySelector("#nombre").value.trim().split(" ")[0];
  const total = formatearPesos(calcularTotal());
  const detalleExitoso = document.querySelector("#compra-exitosa-detalle");

  detalleExitoso.textContent =
    `¡Gracias, ${nombre}! Tu pedido de ${total} está confirmado. Te contactaremos para coordinar la entrega.`;

  formulario.classList.add("oculto");
  document.querySelector("#compra-exitosa").classList.remove("oculto");

  carrito = [];
  actualizarCarrito();
  cerrarCarrito();
});

// 10. TAREA 7: consultar la cotización oficial del dólar.
async function obtenerCotizacionDolar() {
  cotizacionDolar.textContent = "Cargando…";
  cotizacionDolar.classList.add("cargando");
  cotizacionDolar.classList.remove("error");
  estadoCotizacion.textContent = "Consultando DolarAPI…";

  try {
    const respuesta = await fetch("https://dolarapi.com/v1/dolares/oficial");

    if (!respuesta.ok) {
      throw new Error("La API respondió con un error.");
    }

    const datos = await respuesta.json();

    if (typeof datos.venta !== "number" || datos.venta <= 0) {
      throw new Error("La cotización recibida no es válida.");
    }

    cotizacionVenta = datos.venta;
    cotizacionDolar.textContent = formatearPesos(cotizacionVenta);
    estadoCotizacion.textContent = "Precio de venta · actualizado desde DolarAPI";
    cotizacionDolar.classList.remove("cargando", "error");

    // Se vuelven a dibujar los productos para mostrar sus precios en dólares.
    aplicarFiltros();
  } catch (error) {
    console.error("No se pudo obtener la cotización:", error);
    cotizacionDolar.textContent = "No disponible";
    estadoCotizacion.textContent = "No se pudo cargar la cotización. La tienda sigue funcionando.";
    cotizacionDolar.classList.remove("cargando");
    cotizacionDolar.classList.add("error");
  }
}

// 11. INICIO: cargar el catálogo, el carrito guardado y la cotización.
mostrarProductos(productos);
actualizarCarrito();
obtenerCotizacionDolar();
