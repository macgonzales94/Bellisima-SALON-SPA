// checkout.js
const API_BASE_URL = '/api';

let pedidoActual = null;

// Validar el token de autenticación
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'productos.html';
        return null;
    }
    return token;
}

// Función para cargar el carrito
async function cargarCarrito() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch('${API_BASE_URL}/carrito', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Error al cargar el carrito');

        carrito = await response.json();
        mostrarResumenCompra();
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar el carrito');
    }
}

// Mostrar mensajes de error
function mostrarError(mensaje) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-mensaje';
    errorDiv.textContent = mensaje;

    const form = document.querySelector('.checkout-form');
    form.insertBefore(errorDiv, form.firstChild);

    setTimeout(() => errorDiv.remove(), 3000);
}

function obtenerPedidoId() {
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get('pedidoId');
    if (!pedidoId) {
        window.location.href = 'productos.html';
        return null;
    }
    return pedidoId;
}

// Función para inicializar el checkout
async function inicializarCheckout() {
    const token = checkAuth();
    if (!token) return;

    try {
        const response = await fetch('${API_BASE_URL}/pedidos/crear-desde-carrito', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error al crear el pedido');
        }

        const { pedido } = await response.json();
        pedidoActual = pedido;

        // Mostrar código de pedido en la interfaz
        document.getElementById('codigoPedido').textContent = `Código de Pedido: ${pedido.codigoPedido}`;
        mostrarResumenCompra(pedido);

    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al inicializar el checkout: ' + error.message);
    }
}

// Función para mostrar el resumen de compra
function mostrarResumenCompra() {
    if (!carrito || !carrito.productos) return;

    const subtotal = carrito.productos.reduce((total, item) =>
        total + (item.precioUnitario * item.cantidad), 0);
    const envio = subtotal > 100 ? 0 : 10;
    const total = subtotal + envio;

    document.getElementById('subtotal').textContent = `S/. ${subtotal.toFixed(2)}`;
    document.getElementById('envio').textContent = `S/. ${envio.toFixed(2)}`;
    document.getElementById('total').textContent = `S/. ${total.toFixed(2)}`;

    const resumenProductos = document.getElementById('resumenProductos');
    resumenProductos.innerHTML = carrito.productos.map(item => `
        <div class="resumen-item">
            <span>${item.producto.nombre} x ${item.cantidad}</span>
            <span>S/. ${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
        </div>
    `).join('');
}

// Validar formulario
function validarFormulario() {
    const numero = document.getElementById('numeroTarjeta').value.replace(/\s/g, '');
    const cvv = document.getElementById('cvv').value;
    const [mes, anio] = document.getElementById('fechaVencimiento').value.split('/');
    const email = document.getElementById('email').value;

    if (!numero || numero.length < 13) throw new Error('Número de tarjeta inválido');
    if (!cvv || cvv.length < 3) throw new Error('CVV inválido');
    if (!mes || !anio || mes.length !== 2 || anio.length !== 2) {
        throw new Error('Fecha de vencimiento inválida');
    }
    if (!email || !email.includes('@')) throw new Error('Email inválido');

    return {
        card_number: numero,
        cvv,
        expiration_month: mes,
        expiration_year: '20' + anio,
        email
    };
}

// Obtener datos de dirección
function obtenerDireccion() {
    const direccion = {
        calle: document.getElementById('calle').value,
        ciudad: document.getElementById('ciudad').value,
        estado: document.getElementById('distrito').value,
        codigoPostal: document.getElementById('codigoPostal').value,
        telefono: document.getElementById('telefono').value
    };

    if (!direccion.calle || !direccion.ciudad || !direccion.estado ||
        !direccion.codigoPostal || !direccion.telefono) {
        throw new Error('Por favor complete todos los campos de dirección');
    }

    return direccion;
}

// Función para obtener la configuración de Culqi
async function obtenerConfigCulqi() {
    try {
        const response = await fetch('${API_BASE_URL}/pagos/config', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        return data.publicKey;
    } catch (error) {
        console.error('Error al obtener config:', error);
        throw new Error('Error al obtener configuración de pago');
    }
}

// Función para generar el token de Culqi
async function generarTokenCulqi(datosTargeta) {
    try {
        const response = await fetch('${API_BASE_URL}/pagos/generar-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(datosTargeta)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error al generar token');
        }

        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Error al procesar la tarjeta');
    }
}

// Función para procesar el pago
async function procesarPago() {
    if (!pedidoActual) {
        mostrarError('No se encontró información del pedido');
        return;
    }

    const btnPagar = document.getElementById('btnPagar');
    btnPagar.disabled = true;
    btnPagar.textContent = 'Procesando...';

    try {
        const datosTarjeta = validarFormulario();
        const direccion = obtenerDireccion();
        const token = await generarTokenCulqi(datosTarjeta);

        // Enviar pago con el código de pedido
        const response = await fetch('${API_BASE_URL}/pagos/procesar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                token,
                pedidoId: pedidoActual._id,
                codigoPedido: pedidoActual.codigoPedido, // Enviar el código
                direccionEnvio: direccion
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error al procesar el pago');
        }

        window.location.href = 'confirmacion.html';

    } catch (error) {
        console.error('Error:', error);
        mostrarError(error.message);
    } finally {
        btnPagar.disabled = false;
        btnPagar.textContent = 'Realizar Pago';
    }
}


// Cargar detalles del pedido
async function cargarPedido() {
    try {
        const pedidoId = obtenerPedidoId();
        if (!pedidoId) return;

        const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar el pedido');
        }

        pedidoActual = await response.json();
        mostrarResumenCompra(pedidoActual);
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar el pedido');
    }
}

// Función principal para manejar el pago
async function manejarPago() {
    const btnPagar = document.getElementById('btnPagar');
    btnPagar.disabled = true;
    btnPagar.textContent = 'Procesando...';

    try {
        // 1. Validar el formulario
        const datosTarjeta = validarFormulario();

        // 2. Obtener la configuración de Culqi
        const publicKey = await obtenerConfigCulqi();
        if (!publicKey) throw new Error('Error al obtener configuración');

        // 3. Generar el token de Culqi
        const token = await generarTokenCulqi(datosTarjeta);
        if (!token) throw new Error('No se pudo generar el token');

        // 4. Procesar el pago con el token
        const resultado = await procesarPago(token);

        // 5. Redireccionar a la página de confirmación
        window.location.href = 'confirmacion.html';

    } catch (error) {
        console.error('Error:', error);
        mostrarError(error.message);
    } finally {
        btnPagar.disabled = false;
        btnPagar.textContent = 'Realizar Pago';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    if (!localStorage.getItem('token')) {
        window.location.href = 'productos.html';
        return;
    }

    // Cargar carrito al iniciar
    cargarCarrito();
    

    // Listener para el botón de pago
    document.getElementById('btnPagar').addEventListener('click', manejarPago);

    // Formatear número de tarjeta (agregar espacios cada 4 dígitos)
    document.getElementById('numeroTarjeta').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = value;
    });

    // Formatear fecha de vencimiento (MM/YY)
    document.getElementById('fechaVencimiento').addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });

    // Formatear CVV (solo números, máximo 4 dígitos)
    document.getElementById('cvv').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });
});