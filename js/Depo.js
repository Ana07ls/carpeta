const SUPABASE_URL = "https://ktmrzdbwvwohxemmdgbq.supabase.co";
const SUPABASE_CLAVE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bXJ6ZGJ3dndvaHhlbW1kZ2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMjc5OTMsImV4cCI6MjEwODYwMzk5M30.piisKhGQEPWW1sbicjjkm3X_9xAv0lk7lbs-lkWU9GY";

const { createClient } = window.supabase;

const clienteDB = createClient(
    SUPABASE_URL,
    SUPABASE_CLAVE
);

const formPedido = document.getElementById("formPedido");
const idPedido = document.getElementById("idPedido");
const nombreCliente = document.getElementById("nombreCliente");
const direcEntrega = document.getElementById("direcEntrega");
const numCelular = document.getElementById("numCelular");
const pedido = document.getElementById("pedido");
const fechaPedido = document.getElementById("fechaPedido");
const buscador = document.getElementById("buscador");
const listaPedidos = document.getElementById("listaPedidos");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardar = document.getElementById("btnGuardar");

let todosLosPedidos = [];

document.addEventListener("DOMContentLoaded", cargarPedidos);

buscador.addEventListener("input", filtrarPedidos);

formPedido.addEventListener("submit", guardarPedido);

btnCancelar.addEventListener("click", cancelarEdicion);


async function cargarPedidos() {
    const { data, error } = await clienteDB
        .from("deposito_sanchez")
        .select("*")
        .order("fechapedido", { ascending: false });

    if (error) {
        console.error("Error al cargar:", error.message);
        listaPedidos.textContent = "Error al cargar los pedidos.";
        return;
    }

    todosLosPedidos = data;
    mostrarPedidos(data);
}


function mostrarPedidos(pedidos) {
    listaPedidos.innerHTML = "";

    if (pedidos.length === 0) {
        listaPedidos.innerHTML =
            '<p class="sin-resultados">No se encontraron pedidos.</p>';
        return;
    }

    pedidos.forEach(producto => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "pedido-tarjeta";

        const info = document.createElement("div");
        info.className = "pedido-info";

        const titulo = document.createElement("div");
        titulo.className = "pedido-nombre";
        titulo.textContent = producto.nombrecliente;

        const direccion = document.createElement("p");
        direccion.textContent =
            "Dirección:" + (producto.direcentrega || "Sin dirección");

        const celular = document.createElement("p");
        celular.textContent =
            "Celular:" + (producto.numcelular || "Sin número");

        const productos = document.createElement("p");
        productos.textContent =
            "Pedido:" + (producto.pedido || "Sin productos");

        const fecha = document.createElement("p");
        fecha.textContent =
            "Fecha: " + (producto.fechapedido
                ? new Date(producto.fechapedido + "T00:00:00")
                    .toLocaleDateString("es-MX")
                : "Sin fecha");   
                
        const acciones = document.createElement("div");
        acciones.className = "pedido-acciones";

        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.className = "btn-editar";
        btnEditar.textContent = "Editar";
        btnEditar.addEventListener("click", () => {
            editarPedido(producto.id);
        });

        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.className = "btn-eliminar";
        btnEliminar.textContent = "Eliminar";
        btnEliminar.addEventListener("click", () => {
            eliminarPedido(producto.id);
        });

        acciones.append(btnEditar, btnEliminar);
        info.append(titulo, direccion, celular, productos, fecha, acciones);
        tarjeta.appendChild(info);
        listaPedidos.appendChild(tarjeta);
    });
}


//Buscar Pedidos
function filtrarPedidos() {
    const texto = buscador.value.toLowerCase().trim();

    const filtrados = todosLosPedidos.filter(producto =>
        (producto.nombrecliente || "").toLowerCase().includes(texto) ||
        (producto.direcentrega || "").toLowerCase().includes(texto) ||
        (producto.pedido || "").toLowerCase().includes(texto)
    );

    mostrarPedidos(filtrados);
}



async function guardarPedido(e) {
    e.preventDefault();

    const datos = {
        nombrecliente: nombreCliente.value.trim(),
        direcentrega: direcEntrega.value.trim(),
        numcelular: numCelular.value.trim().replace(/\D/g, ""),
        pedido: pedido.value.trim(),
        fechapedido: fechaPedido.value.trim(),
    };

    if (!/^\d{10}$/.test(datos.numcelular)) {
        alert("Escribe un número de celular válido de 10 dígitos (solo números).");
        return;
    }

    btnGuardar.disabled = true;

    try {
        let error;

        if (idPedido.value) {
            ({ error } = await clienteDB
                .from("deposito_sanchez")
                .update(datos)
                .eq("id", idPedido.value));
        } else {

            ({ error } = await clienteDB
                .from("deposito_sanchez")
                .insert([datos]));
        }

        if (error) {
            alert("Error al guardar: " + error.message);
            return;
        }

        alert("Pedido guardado correctamente.");

        formPedido.reset();
        idPedido.value = "";
        btnCancelar.hidden = true;
        btnGuardar.textContent = "Confirmar y guardar pedido";

        await cargarPedidos();

    } finally {
        btnGuardar.disabled = false;
    }
}


async function editarPedido(id) {
    const producto = todosLosPedidos.find(
        pedido => String(pedido.id) === String(id)
    );

    if (!producto) {
        alert("No se encontró el pedido.");
        return;
    }

    idPedido.value = producto.id;
    nombreCliente.value = producto.nombrecliente;
    direcEntrega.value = producto.direcentrega || "";
    numCelular.value = producto.numcelular || "";
    pedido.value = producto.pedido || "";
    fechaPedido.value = producto.fechapedido || "";

    btnCancelar.hidden = false;
    btnGuardar.textContent = "Actualizar pedido";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function cancelarEdicion() {
    formPedido.reset();
    idPedido.value = "";
    btnCancelar.hidden = true;
    btnGuardar.textContent = "Confirmar y guardar pedido";
}


async function eliminarPedido(id) {
    if (!confirm("¿Seguro que quieres eliminar este pedido?")) {
        return;
    }

    const { error } = await clienteDB
        .from("deposito_sanchez")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Error al eliminar: " + error.message);
    } else {
        alert("Pedido eliminado correctamente.");
        await cargarPedidos();
    }
}
