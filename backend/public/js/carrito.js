// carrito.js
// Cargar carrito
const API_BASE_URL = '/api';

async function cargarCarrito() {
    if (isLoggedIn()) {
        await cargarCarritoServidor();
    } else {
        cargarCarritoTemporal();
    }
}

// Cargar carrito del servidor
async function cargarCarritoServidor() {
    try {
        const response = await fetch('${API_BASE_URL}/carrito', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const carrito = await response.json();
        mostrarCarrito(carrito);
        calcularTotales(carrito);
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar carrito');
    }
}

// Cargar carrito temporal
function cargarCarritoTemporal() {
    const carritoTemp = JSON.parse(localStorage.getItem('carritoTemp') || '[]');
    mostrarCarrito({ productos: carritoTemp });
    calcularTotales({ productos: carritoTemp });
}

// Mostrar modal de autenticación
function mostrarModalAuth() {
    const modalHTML = `
        <div id="authModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Para completar tu compra, inicia sesión o crea una cuenta</h2>
                <div class="auth-buttons">
                    <button onclick="mostrarLogin()" class="btn-primary">Iniciar sesión</button>
                    <button onclick="mostrarRegistro()" class="btn-secondary">Crear cuenta</button>
                </div>
                <div id="loginForm" style="display: none;">
                    <!-- Formulario de login -->
                </div>
                <div id="registroForm" style="display: none;">
                    <!-- Formulario de registro -->
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupModalListeners();
}

// Procesar pago
document.getElementById('btnProcederPago')?.addEventListener('click', () => {
    if (!isLoggedIn()) {
        mostrarModalAuth();
    } else {
        transferirCarritoYProceder();
    }
});

// Transferir carrito y proceder
async function transferirCarritoYProceder() {
    const carritoTemp = JSON.parse(localStorage.getItem('carritoTemp') || '[]');
    if (carritoTemp.length > 0) {
        await transferirCarritoAlServidor(carritoTemp);
    }
    window.location.href = 'checkout.html';
}