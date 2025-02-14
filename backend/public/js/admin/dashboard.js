// frontend/js/admin/dashboard.js
const API_BASE_URL = '/api'

// Verificar autenticación
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login.html';
    }
    return token;
 }
 
 // Cargar estadísticas del dashboard
 async function loadDashboardStats() {
    const token = checkAuth();
    try {
        const response = await fetch('${API_BASE_URL}/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        document.getElementById('totalVentas').textContent = `S/. ${data.estadisticas.ventasTotales.toFixed(2)}`;
        document.getElementById('pedidosPendientes').textContent = data.estadisticas.pedidosPendientes;
        document.getElementById('totalProductos').textContent = data.estadisticas.productos;
        document.getElementById('totalUsuarios').textContent = data.estadisticas.usuarios;
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
 }
 
 // Cargar pedidos recientes
 async function loadRecentOrders() {
    const token = checkAuth();
    try {
        const response = await fetch('${API_BASE_URL}/admin/pedidos?limite=5', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        const tbody = document.getElementById('recentOrdersTable');
        tbody.innerHTML = data.pedidos.map(pedido => `
            <tr>
                <td>${pedido._id}</td>
                <td>${pedido.usuario.nombre}</td>
                <td>S/. ${pedido.total.toFixed(2)}</td>
                <td>
                    <select onchange="updateOrderStatus('${pedido._id}', this.value)">
                        <option value="pendiente" ${pedido.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="procesando" ${pedido.estado === 'procesando' ? 'selected' : ''}>Procesando</option>
                        <option value="enviado" ${pedido.estado === 'enviado' ? 'selected' : ''}>Enviado</option>
                        <option value="entregado" ${pedido.estado === 'entregado' ? 'selected' : ''}>Entregado</option>
                    </select>
                </td>
                <td>${new Date(pedido.createdAt).toLocaleString()}</td>
                <td>
                    <button onclick="viewOrderDetails('${pedido._id}')">Ver</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error cargando pedidos:', error);
    }
 }
 
 // Actualizar estado de pedido
 async function updateOrderStatus(orderId, newStatus) {
    const token = checkAuth();
    try {
        await fetch(`${API_BASE_URL}/admin/pedidos/${orderId}/estado`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ estado: newStatus })
        });
        loadRecentOrders();
    } catch (error) {
        console.error('Error actualizando estado:', error);
    }
 }
 
 // Cerrar sesión
 document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '../login.html';
 });
 
 // Inicializar dashboard
 window.addEventListener('load', () => {
    loadDashboardStats();
    loadRecentOrders();
    setInterval(loadDashboardStats, 60000); // Actualizar cada minuto
 });