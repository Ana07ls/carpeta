const SUPABASE_URL = "https://ktmrzdbwvwohxemmdgbq.supabase.co";
const SUPABASE_CLAVE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bXJ6ZGJ3dndvaHhlbW1kZ2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMjc5OTMsImV4cCI6MjEwODYwMzk5M30.piisKhGQEPWW1sbicjjkm3X_9xAv0lk7lbs-lkWU9GY";

const { createClient } = window.supabase;

const clienteDB = createClient(
    SUPABASE_URL,
    SUPABASE_CLAVE
);

const form = document.getElementById("formProducto");
const idProducto = document.getElementById("idProducto");
const nombre = document.getElementById("nombre");
const descripcion = document.getElementById("descripcion");
const costo = document.getElementById("costo");
const imagen = document.getElementById("imagen");
const buscador = document.getElementById("buscador");
const lista = document.getElementById("listaProductos");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardar = document.getElementById("btnGuardar");

let todosLosProductos = [];

document.addEventListener("DOMContentLoaded", cargarProductos);
buscador.addEventListener("input", filtrarProductos);
form.addEventListener("submit", guardarProducto);
btnCancelar.addEventListener("click", cancelarEdicion);

async function cargarProductos() {
    const { data, error } = await clienteDB
        .from("productos_deposito")
        .select("*")
        .order("nombre");

    if (error) {
        console.error("Error al cargar:", error.message);
        lista.innerHTML = '<p class="text-danger text-center w-100">Error al cargar los productos.</p>';
        return;
    }

    todosLosProductos = data;
    mostrarProductos(data);
}

function mostrarProductos(productos) {
    lista.innerHTML = "";

    if (productos.length === 0) {
        lista.innerHTML = '<p class="text-muted text-center w-100">No se encontraron productos.</p>';
        return;
    }

    productos.forEach(prod => {
        const col = document.createElement("div");
        col.className = "col";

        const tarjeta = document.createElement("div");
        tarjeta.className = "card h-100 shadow-sm";

        const foto = document.createElement("img");
        foto.className = "card-img-top p-3";
        foto.alt = "Imagen de " + prod.nombre;
        foto.style.height = "200px";
        foto.style.objectFit = "contain";
        foto.src = prod.imagen || "https://placehold.co/300x200?text=Depósito";

        const cardBody = document.createElement("div");
        cardBody.className = "card-body d-flex flex-column";

        const titulo = document.createElement("h5");
        titulo.className = "card-title";
        titulo.textContent = prod.nombre;

        const texto = document.createElement("p");
        texto.className = "card-text text-muted small";
        texto.textContent = prod.descripcion || "Sin descripción";

        const precio = document.createElement("p");
        precio.className = "fw-bold text-success mt-auto";
        precio.textContent = "$" + Number(prod.costo).toFixed(2) + " MXN";

        const acciones = document.createElement("div");
        acciones.className = "d-flex gap-2 mt-2";

        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.className = "btn btn-sm btn-outline-primary w-50";
        btnEditar.textContent = "Editar";
        btnEditar.addEventListener("click", () => editarProducto(prod.id));

        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.className = "btn btn-sm btn-outline-danger w-50";
        btnEliminar.textContent = "Eliminar";
        btnEliminar.addEventListener("click", () => eliminarProducto(prod.id));

        acciones.append(btnEditar, btnEliminar);
        cardBody.append(titulo, texto, precio, acciones);
        tarjeta.append(foto, cardBody);
        col.appendChild(tarjeta);
        lista.appendChild(col);
    });
}

function filtrarProductos() {
    const texto = buscador.value.toLowerCase().trim();

    const filtrados = todosLosProductos.filter(prod =>
        prod.nombre.toLowerCase().includes(texto) ||
        (prod.descripcion || "").toLowerCase().includes(texto)
    );

    mostrarProductos(filtrados);
}

async function guardarProducto(e) {
    e.preventDefault();

    const datos = {
        nombre: nombre.value.trim(),
        descripcion: descripcion.value.trim() || null,
        costo: Number(costo.value),
        imagen: imagen.value.trim() || null
    };

    if (!datos.nombre || costo.value === "" || !Number.isFinite(datos.costo) || datos.costo < 0) {
        alert("Escribe un nombre y un costo válido.");
        return;
    }

    btnGuardar.disabled = true;

    try {
        let error;

        if (idProducto.value) {
            ({ error } = await clienteDB
                .from("productos_deposito")
                .update(datos)
                .eq("id", idProducto.value));
        } else {
            ({ error } = await clienteDB
                .from("productos_deposito")
                .insert([datos]));
        }

        if (error) {
            alert("Error al guardar: " + error.message);
            return;
        }

        alert("Producto guardado correctamente.");

        form.reset();
        idProducto.value = "";
        btnCancelar.hidden = true;
        btnGuardar.textContent = "Guardar producto";

        await cargarProductos();

    } finally {
        btnGuardar.disabled = false;
    }
}

async function editarProducto(id) {
    const prod = todosLosProductos.find(elemento => String(elemento.id) === String(id));

    if (!prod) {
        alert("No se encontró el producto.");
        return;
    }

    idProducto.value = prod.id;
    nombre.value = prod.nombre;
    descripcion.value = prod.descripcion || "";
    costo.value = prod.costo;
    imagen.value = prod.imagen || "";

    btnCancelar.hidden = false;
    btnGuardar.textContent = "Actualizar producto";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function cancelarEdicion() {
    form.reset();
    idProducto.value = "";
    btnCancelar.hidden = true;
    btnGuardar.textContent = "Guardar producto";
}

async function eliminarProducto(id) {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) {
        return;
    }

    const { error } = await clienteDB
        .from("productos_deposito")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Error al eliminar: " + error.message);
    } else {
        alert("Producto eliminado correctamente.");
        await cargarProductos();
    }
}