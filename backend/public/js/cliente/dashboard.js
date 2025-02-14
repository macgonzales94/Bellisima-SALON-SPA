// js/cliente/dashboard.js
let userData = null;

// Verificar autenticación
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login.html';
    }
    return token;
}

// Cargar datos del usuario
async function cargarDatosUsuario() {
    const token = checkAuth();
    try {
        const response = await fetch('http://localhost:3000/api/usuarios/perfil', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        userData = await response.json();
        mostrarDatosPerfil(userData);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar datos del usuario');
    }
}

// Cargar pedidos
async function cargarPedidos() {
    const token = checkAuth();
    try {
        const response = await fetch('http://localhost:3000/api/pedidos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const pedidos = await response.json();
        
        // Separar pedidos pendientes y completados
        const pendientes = pedidos.filter(p => p.estado === 'pendiente');
        const historial = pedidos.filter(p => p.estado !== 'pendiente');
        
        mostrarPedidosPendientes(pendientes);
        mostrarHistorialPedidos(historial);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar pedidos');
    }
}

// Mostrar pedidos pendientes
function mostrarPedidosPendientes(pedidos) {
    const container = document.getElementById('listaPedidosPendientes');
    if (pedidos.length === 0) {
        container.innerHTML = '<p>No tienes pedidos pendientes</p>';
        return;
    }

    container.innerHTML = pedidos.map(pedido => `
        <div class="pedido-card">
            <div class="pedido-header">
                <span>Pedido #${pedido._id}</span>
                <span class="estado pendiente">Pendiente de pago</span>
            </div>
            <div class="pedido-body">
                <p>Total: S/. ${pedido.total.toFixed(2)}</p>
                <p>Fecha: ${new Date(pedido.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="pedido-footer">
                <button onclick="procesarPago('${pedido._id}')" class="btn-pagar">
                    Pagar ahora
                </button>
            </div>
        </div>
    `).join('');
}

// Procesar pago de pedido pendiente
async function procesarPago(pedidoId) {
    // Redirigir al checkout con el ID del pedido
    window.location.href = `../checkout.html?pedidoId=${pedidoId}`;
}

// Navegación entre secciones
document.querySelectorAll('.menu a[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = e.target.dataset.section;
        
        // Ocultar todas las secciones
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar la sección seleccionada
        document.getElementById(sectionId).classList.add('active');
        
        // Actualizar menú
        document.querySelectorAll('.menu a').forEach(a => {
            a.classList.remove('active');
        });
        e.target.classList.add('active');
    });
});

// Cerrar sesión
document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '../login.html';
});

// Inicializar
window.onload = () => {
    cargarDatosUsuario();
    cargarPedidos();
};