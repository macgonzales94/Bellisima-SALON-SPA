// frontend/js/admin/productos.js

// Verificar autenticación
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login.html';
    }
    return token;
 }
 
 // Variables globales
 let currentProductId = null;
 const API_URL = 'http://localhost:3000/api';
 
 // Cargar productos
 async function loadProducts() {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_URL}/productos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        displayProducts(data.productos);
    } catch (error) {
        console.error('Error cargando productos:', error);
        alert('Error al cargar productos');
    }
 }
 
 // Mostrar productos en la tabla
 function displayProducts(productos) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = productos.map(producto => `
        <tr>
            <td>
                <img src="${producto.imagenes[0]?.url || 'assets/placeholder.jpg'}" 
                     alt="${producto.nombre}"
                     class="product-img">
            </td>
            <td>${producto.nombre}</td>
            <td>${producto.categoria}</td>
            <td>S/. ${producto.precio.toFixed(2)}</td>
            <td>${producto.stock}</td>
            <td>
                <span class="status-${producto.activo ? 'active' : 'inactive'}">
                    ${producto.activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td class="action-buttons">
                <button onclick="editProduct('${producto._id}')" class="btn-edit">
                    Editar
                </button>
                <button onclick="deleteProduct('${producto._id}')" class="btn-delete">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join('');
 }
 
 // Modal de producto
 const modal = document.getElementById('productModal');
 const modalTitle = document.getElementById('modalTitle');
 const productForm = document.getElementById('productForm');
 
 // Abrir modal para nuevo producto
 document.getElementById('addProductBtn').onclick = () => {
    currentProductId = null;
    modalTitle.textContent = 'Añadir Producto';
    productForm.reset();
    modal.style.display = 'block';
 };
 
 // Cerrar modal
 document.querySelector('.close').onclick = () => {
    modal.style.display = 'none';
 };
 
 // Guardar producto
 productForm.onsubmit = async (e) => {
    e.preventDefault();
    const token = checkAuth();
 
    const formData = new FormData();
    formData.append('nombre', document.getElementById('nombre').value);
    formData.append('descripcion', document.getElementById('descripcion').value);
    formData.append('precio', document.getElementById('precio').value);
    formData.append('categoria', document.getElementById('categoria').value);
    formData.append('stock', document.getElementById('stock').value);
 
    const imageFile = document.getElementById('imagen').files[0];
    if (imageFile) {
        formData.append('imagen', imageFile);
    }
 
    try {
        const url = currentProductId 
            ? `${API_URL}/productos/${currentProductId}`
            : `${API_URL}/productos`;
            
        const method = currentProductId ? 'PUT' : 'POST';
 
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
 
        if (response.ok) {
            modal.style.display = 'none';
            loadProducts();
            alert(currentProductId ? 'Producto actualizado' : 'Producto creado');
        } else {
            const error = await response.json();
            alert(error.mensaje);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el producto');
    }
 };
 
 // Editar producto
 async function editProduct(productId) {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_URL}/productos/${productId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const producto = await response.json();
 
        currentProductId = productId;
        modalTitle.textContent = 'Editar Producto';
        
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('descripcion').value = producto.descripcion;
        document.getElementById('precio').value = producto.precio;
        document.getElementById('categoria').value = producto.categoria;
        document.getElementById('stock').value = producto.stock;
 
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el producto');
    }
 }
 
 // Eliminar producto
 async function deleteProduct(productId) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
 
    const token = checkAuth();
    try {
        const response = await fetch(`${API_URL}/productos/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
 
        if (response.ok) {
            loadProducts();
            alert('Producto eliminado');
        } else {
            const error = await response.json();
            alert(error.mensaje);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el producto');
    }
 }
 
 // Búsqueda y filtros
 document.getElementById('searchProduct').addEventListener('input', (e) => {
    // Implementar búsqueda en tiempo real
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#productsTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
 });
 
 document.getElementById('categoryFilter').addEventListener('change', (e) => {
    const category = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#productsTableBody tr');
    
    rows.forEach(row => {
        const rowCategory = row.children[2].textContent.toLowerCase();
        row.style.display = !category || rowCategory === category ? '' : 'none';
    });
 });
 
 // Inicializar página
 window.onload = () => {
    loadProducts();
 };