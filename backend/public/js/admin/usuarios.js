// Verificar autenticación
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login.html';
    }
    return token;
}

// Variables globales
let currentUserId = null;
const API_URL = 'http://localhost:3000/api';

// Modal de usuario
const modal = document.getElementById('userModal');
const modalTitle = document.getElementById('modalTitle');
const userForm = document.getElementById('userForm');

// Abrir modal para nuevo usuario
document.getElementById('newUserBtn').onclick = () => {
    currentUserId = null;
    modalTitle.textContent = 'Crear Nuevo Usuario';
    userForm.reset();
    document.getElementById('passwordGroup').style.display = 'block';
    modal.style.display = 'block';
};

// Búsqueda y filtros
document.getElementById('searchUser').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#usersTableBody tr');

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

document.getElementById('filterRole').addEventListener('change', (e) => {
    const role = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#usersTableBody tr');

    rows.forEach(row => {
        const rowRole = row.children[3].textContent.toLowerCase();
        row.style.display = !role || rowRole === role ? '' : 'none';
    });
});

// Cargar usuarios
async function loadUsers() {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }

        const data = await response.json();
        displayUsers(data.usuarios);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar usuarios: ' + error.message);
    }
}

// Mostrar usuarios en la tabla
function displayUsers(usuarios) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = usuarios.map(usuario => `
        <tr>
            <td>${usuario._id}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.email}</td>
            <td>${usuario.rol}</td>
            <td>
                <span class="user-status status-${usuario.activo ? 'active' : 'inactive'}">
                    ${usuario.activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>${new Date(usuario.createdAt).toLocaleDateString()}</td>
            <td class="action-buttons">
                <button onclick="editUser('${usuario._id}')" class="btn-edit">
                    Editar
                </button>
                <button onclick="toggleUserStatus('${usuario._id}', ${!usuario.activo})" 
                        class="btn-${usuario.activo ? 'delete' : 'edit'}">
                    ${usuario.activo ? 'Desactivar' : 'Activar'}
                </button>
            </td>
        </tr>
    `).join('');
}

// Editar usuario
async function editUser(userId) {
    const token = checkAuth();
    try {
        const response = await fetch(`${API_URL}/usuarios/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener usuario');
        }

        const usuario = await response.json();

        // Llenar formulario con datos existentes
        document.getElementById('nombre').value = usuario.nombre || '';
        document.getElementById('email').value = usuario.email || '';
        document.getElementById('telefono').value = usuario.telefono || '';
        document.getElementById('rol').value = usuario.rol || 'cliente';
        document.getElementById('estado').value = String(Boolean(usuario.activo));

        // Ocultar campo de contraseña en edición
        document.getElementById('passwordGroup').style.display = 'none';

        // Cambiar título del modal
        modalTitle.textContent = 'Editar Usuario';

        // Guardar el ID del usuario actual
        currentUserId = userId;

        // Mostrar modal
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar usuario: ' + error.message);
    }
}

// Crear usuario
async function createUser() {
    const token = checkAuth();
    try {
        const userData = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            telefono: document.getElementById('telefono').value,
            rol: document.getElementById('rol').value,
            activo: document.getElementById('estado').value === 'true'
        };

        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error al crear usuario');
        }

        alert('Usuario creado exitosamente');
        modal.style.display = 'none';
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear usuario: ' + error.message);
    }
}

// Actualizar usuario
async function updateUser(userId) {
    const token = checkAuth();
    try {
        const userData = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            rol: document.getElementById('rol').value,
            activo: document.getElementById('estado').value === 'true'
        };

        // Incluir contraseña solo si se proporcionó una nueva
        const password = document.getElementById('password').value;
        if (password.trim()) {
            userData.password = password;
        }

        const response = await fetch(`${API_URL}/usuarios/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error al actualizar usuario');
        }

        alert('Usuario actualizado exitosamente');
        modal.style.display = 'none';
        loadUsers();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar usuario: ' + error.message);
    }
}

// Cambiar estado del usuario
async function toggleUserStatus(userId, newStatus) {
    if (!confirm(`¿Estás seguro de ${newStatus ? 'activar' : 'desactivar'} este usuario?`)) return;

    const token = checkAuth();
    try {
        const response = await fetch(`${API_URL}/usuarios/${userId}/estado`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ activo: newStatus })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.mensaje || 'Error al actualizar estado del usuario');
        }

        loadUsers();
        alert(`Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar estado del usuario: ' + error.message);
    }
}

// Cerrar modal
document.querySelector('.close').onclick = () => {
    modal.style.display = 'none';
};

// Guardar usuario (actualizar o crear)
userForm.onsubmit = async (e) => {
    e.preventDefault();
    if (currentUserId) {
        await updateUser(currentUserId);
    } else {
        await createUser();
    }
};

// Cerrar modal al hacer clic fuera
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Inicializar página
window.onload = () => {
    loadUsers();
};