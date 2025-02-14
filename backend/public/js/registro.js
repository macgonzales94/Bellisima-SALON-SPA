
const API_BASE_URL = '/api'; 

document.getElementById('registroForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        telefono: document.getElementById('telefono').value,
        direccion: {
            calle: document.getElementById('direccion').value
        }
    };

    try {
        const response = await fetch('${API_BASE_URL}/usuarios/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registro exitoso');
            window.location.href = 'login.html';
        } else {
            alert(data.mensaje || 'Error en el registro');
        }
    } catch (error) {
        alert('Error de conexión');
    }
});