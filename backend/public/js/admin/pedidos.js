// frontend/js/admin/pedidos.js
const API_BASE_URL = '/api';

// Variables globales
let currentPage = 1;
const itemsPerPage = 10;
let totalPages = 1;
let currentOrders = [];

// Verificar autenticación
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login.html';
    }
    return token;
}

// Cargar pedidos
async function loadOrders(page = 1, status = '') {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/admin/pedidos?pagina=${page}&estado=${status}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        currentOrders = data.pedidos;
        totalPages = data.totalPaginas;
        displayOrders(data.pedidos);
        updatePagination();
    } catch (error) {
        console.error('Error cargando pedidos:', error);
        alert('Error al cargar pedidos');
    }
}

// Mostrar pedidos en la tabla
function displayOrders(pedidos) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = pedidos.map(pedido => `
        <tr>
            <td>${pedido._id}</td>
            <td>${pedido.usuario.nombre}</td>
            <td>${new Date(pedido.createdAt).toLocaleString()}</td>
            <td>S/. ${pedido.total.toFixed(2)}</td>
            <td>
                <span class="order-status status-${pedido.estado}">
                    ${pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                </span>
            </td>
            <td>${pedido.pago.metodo}</td>
            <td>
                <button onclick="viewOrderDetails('${pedido._id}')" class="btn-view">
                    Ver Detalles
                </button>
            </td>
        </tr>
    `).join('');
}

// Actualizar estado del pedido
async function updateOrderStatus(orderId, newStatus) {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/admin/pedidos/${orderId}/estado`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: newStatus })
        });

        if (response.ok) {
            loadOrders(currentPage);
            alert('Estado actualizado con éxito');
        } else {
            alert('Error al actualizar estado');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar estado');
    }
}

// Ver detalles del pedido
async function viewOrderDetails(orderId) {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
                
            }
        });
        const pedido = await response.json();
        
        // Llenar modal con detalles
        document.getElementById('orderId').textContent = pedido._id;
        document.getElementById('orderDate').textContent = new Date(pedido.createdAt).toLocaleString();
        document.getElementById('orderStatus').value = pedido.estado;
        document.getElementById('customerName').textContent = pedido.usuario.nombre;
        document.getElementById('customerEmail').textContent = pedido.usuario.email;
        document.getElementById('customerPhone').textContent = pedido.usuario.telefono || 'No disponible';
        
        // Mostrar productos
        document.getElementById('orderProducts').innerHTML = pedido.productos.map(item => `
            <tr>
                <td>${item.producto.nombre}</td>
                <td>${item.cantidad}</td>
                <td>S/. ${item.precioUnitario.toFixed(2)}</td>
                <td>S/. ${(item.cantidad * item.precioUnitario).toFixed(2)}</td>
            </tr>
        `).join('');

        // Mostrar totales
        document.getElementById('orderSubtotal').textContent = pedido.subtotal.toFixed(2);
        document.getElementById('orderShipping').textContent = pedido.costoEnvio.toFixed(2);
        document.getElementById('orderTotal').textContent = pedido.total.toFixed(2);

        // Mostrar modal
        document.getElementById('orderModal').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar detalles del pedido');
    }
}

// Event Listeners
document.getElementById('filterStatus').addEventListener('change', (e) => {
    loadOrders(1, e.target.value);
});

document.getElementById('searchOrder').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredOrders = currentOrders.filter(order => 
        order._id.toLowerCase().includes(searchTerm) ||
        order.usuario.nombre.toLowerCase().includes(searchTerm)
    );
    displayOrders(filteredOrders);
});

// Paginación
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadOrders(currentPage);
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadOrders(currentPage);
    }
});

// Cerrar modal
document.querySelector('.close').onclick = () => {
    document.getElementById('orderModal').style.display = 'none';
};

// Inicializar página
window.onload = () => {
    loadOrders();
};