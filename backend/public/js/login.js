document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('${API_BASE_URL}/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.mensaje || 'Error al iniciar sesión');
        }

        if (data.token) {
            localStorage.setItem('token', data.token);
            console.log('Token guardado:', data.token); // Para debugging
            
            // Redirigir según el rol
            if (data.usuario && data.usuario.rol === 'admin') {
                window.location.href = '../../pages/admin/dashboard.html';
            } else {
                window.location.href = '../../pages/cliente/dashboard.html';
            }
        } else {
            throw new Error('No se recibió el token de autenticación');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
});