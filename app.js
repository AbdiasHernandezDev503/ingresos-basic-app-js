/* 
  Abdías de Jesús Martínez Hernández
  Yanci Arely Pineda Linares
  Katherine Noemy Vega Arriaza
*/

// Selección de elementos
const tituloFecha = document.querySelector(".budget-title span");
const ingresosEl = document.querySelector(".pill-value.pos");
const egresosEl = document.querySelector(".pill-value.neg");
const porcentajeEl = document.querySelector(".kpi-chip");
const saldoDisponibleEl = document.getElementById("saldoDisponible");

const tipoInput = document.querySelector("select");
const descInput = document.querySelector('input[placeholder="Descripción"]');
const montoInput = document.querySelector('input[placeholder="Monto"]');
const btnAgregar = document.querySelector(".btn");

const listaIngresos = document.querySelector(".tab-content.ingresos .items");
const listaEgresos = document.querySelector(".tab-content.egresos .items");

// Datos
let ingresos = [], egresos = [];

// Funcion para que guardemos en el LocalStorage (Funcionalidad adicional)
function guardarDatosLocalStorage() {
  localStorage.setItem("ingresos", JSON.stringify(ingresos));
  localStorage.setItem("egresos", JSON.stringify(egresos));
}

function cargarDatosLocalStorage() {
  ingresos = JSON.parse(localStorage.getItem("ingresos")) || [];
  egresos = JSON.parse(localStorage.getItem("egresos")) || [];
}

// Utilidades
function obtenerTotales() {
  return {
    totalIngresos: ingresos.reduce((acc, i) => acc + i.monto, 0),
    totalEgresos: egresos.reduce((acc, i) => acc + i.monto, 0),
  };
}

function resetFormulario() {
  descInput.value = "";
  montoInput.value = "";
  tipoInput.selectedIndex = 0;
}

function mostrarModalValidacion(mensaje) {
  document.getElementById("validacionMsg").textContent = mensaje;
  new bootstrap.Modal(document.getElementById("validacionModal")).show();
}

// Renderizado
function renderizarLista(lista, datos, clase) {
  lista.innerHTML = "";
  const { totalIngresos } = obtenerTotales();
  datos.forEach((item) => {
    const porcentaje =
      clase === "neg" && totalIngresos > 0
        ? ((item.monto * 100) / totalIngresos).toFixed(2) + "%"
        : "";
    lista.innerHTML += `
      <li class="row">
        <span class="name">${item.descripcion}</span>
        <span class="amount ${clase}">${
      clase === "pos" ? "+" : "-"
    }${item.monto.toFixed(2)}</span>
        ${porcentaje ? `<span class="badge">${porcentaje}</span>` : ""}
      </li>`;
  });
}

function renderizar() {
  renderizarLista(listaIngresos, ingresos, "pos");
  renderizarLista(listaEgresos, egresos, "neg");
  const { totalIngresos, totalEgresos } = obtenerTotales();
  const saldo = totalIngresos - totalEgresos;
  ingresosEl.textContent = `+${totalIngresos.toFixed(2)}`;
  egresosEl.textContent = `-${totalEgresos.toFixed(2)}`;
  porcentajeEl.textContent =
    totalIngresos > 0
      ? `${((totalEgresos * 100) / totalIngresos).toFixed(2)}%`
      : "0%";
  saldoDisponibleEl.textContent = `${saldo >= 0 ? "+" : "-"}${Math.abs(
    saldo
  ).toFixed(2)}`;
}

// Validaciones
function validarTransaccion(tipo, descripcion, monto) {
  const { totalIngresos, totalEgresos } = obtenerTotales();
  if (tipo !== "INGRESO" && tipo !== "EGRESO")
    return "Seleccione el tipo de transacción";
  if (!descripcion) return "Ingrese la descripción";

  if (descripcion.length < 3)
    return "La descripción debe tener al menos 3 caracteres";

  if (isNaN(monto) || monto <= 0) return "Ingrese un monto válido mayor a 0";

  if (tipo === "EGRESO") {
    if (totalIngresos === 0) return "Debe agregar ingresos antes de egresos";

    if (monto > totalIngresos - totalEgresos)
      return "Los egresos no pueden superar los ingresos disponibles";

  }

  return null;
}

// Eventos
btnAgregar.addEventListener("click", () => {
  const tipo = tipoInput.value;
  const descripcion = descInput.value.trim();
  const monto = parseFloat(montoInput.value);

  const error = validarTransaccion(tipo, descripcion, monto);
  if (error) return mostrarModalValidacion(error);

  const transaccion = { descripcion, monto };
  if (tipo === "INGRESO") {
    ingresos.push(transaccion);

    // Seleccionar la tab ingresos cuando se agrega dicho tipo
    document.getElementById("tab-ingresos").checked = true; 
  } else {
    egresos.push(transaccion);

    // Seleccionar la tab de egresos cuando se agrega el tipo correspondiente
    document.getElementById("tab-egresos").checked = true; 
  }

  guardarDatosLocalStorage();
  resetFormulario();
  renderizar();
});

// Inicialización
tituloFecha.textContent = new Date()
  .toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  .replace(/^\w/, (c) => c.toUpperCase());

cargarDatosLocalStorage()
renderizar();
