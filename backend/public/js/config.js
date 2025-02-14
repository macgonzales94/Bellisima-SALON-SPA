// frontend/js/config.js
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api'
};

// Función para hacer peticiones a la API
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, config);
        const contentType = response.headers.get('content-type');
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login.html';
                return;
            }
            
            let error;
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                error = new Error(data.mensaje || 'Error en la petición');
            } else {
                error = new Error('Error de conexión con el servidor');
            }
            throw error;
        }

        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return await response.text();
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
}