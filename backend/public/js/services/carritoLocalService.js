// js/services/carritoLocalService.js
const carritoLocalService = {
    // Guardar carrito en localStorage
    guardarCarrito: (productos) => {
        localStorage.setItem('carritoTemp', JSON.stringify(productos));
    },

    // Obtener carrito de localStorage
    obtenerCarrito: () => {
        const carrito = localStorage.getItem('carritoTemp');
        return carrito ? JSON.parse(carrito) : [];
    },

    // Limpiar carrito local
    limpiarCarrito: () => {
        localStorage.removeItem('carritoTemp');
    },

    // Agregar producto al carrito
    agregarProducto: (producto) => {
        const carrito = carritoLocalService.obtenerCarrito();
        const productoExistente = carrito.find(p => p.producto._id === producto._id);

        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            carrito.push({
                producto: producto,
                cantidad: 1
            });
        }

        carritoLocalService.guardarCarrito(carrito);
        return carrito;
    },

    // Verificar si hay carrito guardado
    hayCarritoGuardado: () => {
        return localStorage.getItem('carritoTemp') !== null;
    }
};