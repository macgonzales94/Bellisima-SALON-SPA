// scripts/copyFrontend.js
const fs = require('fs-extra');
const path = require('path');

const rutaFrontend = path.join(__dirname, '../../frontend');
const rutaPublic = path.join(__dirname, '../public');

// Lista de archivos y carpetas a copiar
const elementosACopiar = [
    { from: 'css', to: 'css' },
    { from: 'js', to: 'js' },
    { from: 'assets', to: 'assets' },
    { from: 'pages', to: 'pages' },
    { from: 'acerca.html', to: 'acerca.html' },
    { from: 'card.html', to: 'card.html' },
    { from: 'carrito.html', to: 'carrito.html' },
    {from: 'checkout.html', to: 'checkout.html' },
    {from: 'citas.html', to: 'citas.html' },
    {from: 'contacto.html', to: 'contacto.html' },
    { from: 'index.html', to: 'index.html' },
    {from: 'nosotros.html', to: 'nosotros.html' },
    { from: 'productos.html', to: 'productos.html' },
    {from: 'registro.html', to: 'registro.html' },
    {from: 'servicios.html', to: 'servicios.html' },
    {from: 'tratamientos.html', to: 'tratamientos.html' },
   
];

async function copiarFrontendAPublic() {
    try {
        // Asegurar que la carpeta public existe
        await fs.ensureDir(rutaPublic);

        // Copiar cada elemento
        for (const elemento of elementosACopiar) {
            const rutaOrigen = path.join(rutaFrontend, elemento.from);
            const rutaDestino = path.join(rutaPublic, elemento.to);

            if (await fs.pathExists(rutaOrigen)) {
                await fs.copy(rutaOrigen, rutaDestino);
                console.log(`Copiado: ${elemento.from} -> ${elemento.to}`);
            } else {
                console.warn(`Advertencia: ${elemento.from} no existe`);
            }
        }

        console.log('Frontend copiado exitosamente a public!');
    } catch (err) {
        console.error('Error copiando frontend:', err);
        process.exit(1);
    }
}

copiarFrontendAPublic();