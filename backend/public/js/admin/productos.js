// frontend/js/admin/productos.js
const API_BASE_URL = '/api';

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
const API_URL = '${API_BASE_URL}';


// Modal de producto
const modal = document.getElementById('productModal');
const modalTitle = document.getElementById('modalTitle');
const productForm = document.getElementById('productForm');

// Abrir modal para nuevo producto
document.getElementById('addProductBtn').onclick = () => {
    currentProductId = null;
    modalTitle.textContent = 'Añadir Producto';
    productForm.reset();
    document.getElementById('previewImage').innerHTML = '';
    modal.style.display = 'block';
};

// Búsqueda y filtros
document.getElementById('searchProduct').addEventListener('input', (e) => {

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

// Vista previa de imagen
document.getElementById('imagen').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('previewImage');
            preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; margin-top: 10px;">`;
        }
        reader.readAsDataURL(file);
    }
});


// Cargar productos
async function loadProducts() {
    const token = checkAuth();
    try {
        const response = await fetch('${API_BASE_URL}/productos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar productos');
        }

        const data = await response.json();
        displayProducts(data.productos);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar productos: ' + error.message);
    }
}

// Mostrar productos en la tabla
function displayProducts(productos) {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = productos.map(producto => `
        <tr>
            <td>
                <img src="${producto.imagenes[0]?.url || '../../assets/img/placeholder.jpg'}" 
                     alt="${producto.nombre}"
                     style="width: 50px; height: 50px; object-fit: cover;">
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
            <td>
                <button onclick="editProduct('${producto._id}')" class="btn-edit">Editar</button>
                <button onclick="deleteProduct('${producto._id}')" class="btn-delete">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// Editar producto
async function editProduct(id) {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener producto');
        }

        const producto = await response.json();

        // Llenar formulario con datos existentes
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('marca').value = producto.marca;
        document.getElementById('categoria').value = producto.categoria;
        document.getElementById('precio').value = producto.precio;
        document.getElementById('stock').value = producto.stock;
        document.getElementById('descripcion').value = producto.descripcion;

        // Mostrar imagen actual si existe
        if (producto.imagenes && producto.imagenes[0]) {
            const preview = document.getElementById('previewImage');
            preview.innerHTML = `<img src="${producto.imagenes[0].url}" style="max-width: 200px; margin-top: 10px;">`;
        }

        // Cambiar el título del modal
        modalTitle.textContent = 'Editar Producto';

        // Guardar el ID del producto actual
        currentProductId = id;

        // Mostrar modal
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar producto: ' + error.message);
    }
}

// Crear producto
async function createProduct() {
    const token = checkAuth();
    try {
        const productData = {
            nombre: document.getElementById('nombre').value,
            marca: document.getElementById('marca').value,
            categoria: document.getElementById('categoria').value,
            precio: parseFloat(document.getElementById('precio').value),
            stock: parseInt(document.getElementById('stock').value),
            descripcion: document.getElementById('descripcion').value
        };

        const response = await fetch('${API_BASE_URL}/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error al crear producto');
        }

        alert('Producto creado exitosamente');
        modal.style.display = 'none';
        loadProducts();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear producto: ' + error.message);
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

// Cerrar modal
document.querySelector('.close').onclick = () => {
    modal.style.display = 'none';
};

// Guardar producto (actualizar o crear)
productForm.onsubmit = async (e) => {
    e.preventDefault();
    await createProduct();
};

// Actualizar producto
async function updateProduct(id) {
    const token = checkAuth();
    try {
        const productData = {
            nombre: document.getElementById('nombre').value,
            marca: document.getElementById('marca').value,
            categoria: document.getElementById('categoria').value,
            precio: parseFloat(document.getElementById('precio').value),
            stock: parseInt(document.getElementById('stock').value),
            descripcion: document.getElementById('descripcion').value
        };

        const response = await fetch(`${API_URL}/productos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error al actualizar producto');
        }

        alert('Producto actualizado exitosamente');
        modal.style.display = 'none';
        loadProducts();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar producto: ' + error.message);
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


// Inicializar página
window.onload = () => {
    loadProducts();
};