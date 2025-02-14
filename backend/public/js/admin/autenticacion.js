// frontend/js/auth.js
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login.html';
        return null;
    }
    
    // Verificar si el token está expirado
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            window.location.href = '../login.html';
            return null;
        }
    } catch (e) {
        localStorage.removeItem('token');
        window.location.href = '../login.html';
        return null;
    }
    
    return token;
}

// Función helper para hacer peticiones autenticadas
async function fetchAuth(url, options = {}) {
    const token = checkAuth();
    if (!token) return;

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '../login.html';
                return;
            }
            const error = await response.json();
            throw new Error(error.mensaje || 'Error en la petición');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
}