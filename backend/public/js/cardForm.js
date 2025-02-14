let precioBase = 0;

function abrirFormulario(producto, precio) {
    precioBase = precio;
    document.getElementById('productoInfo').innerText = `Producto: ${producto}`;
    actualizarCosto();
    document.getElementById('modalCompra').style.display = 'flex';
}

function cerrarFormulario() {
    document.getElementById('modalCompra').style.display = 'none';
}

function actualizarCosto() {
    let cantidad = parseInt(document.getElementById('cantidad').value) || 1;
    let total = (precioBase * cantidad) + 15;
    document.getElementById('totalCompra').innerText = `Total: S/${total} (Incluye delivery)`;
}

function confirmarCompra() {
    document.getElementById('modalCompra').style.display = 'none';
    document.getElementById('compraConfirmada').style.display = 'flex';
}

function cerrarConfirmacion() {
    document.getElementById('compraConfirmada').style.display = 'none';
}
