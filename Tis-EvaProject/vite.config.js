import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'], // Archivo de entrada principal de tu app React
            refresh: true,
        }),
        react(),
    ],
    esbuild: {
        loader: 'jsx', // Configura el loader para JSX
    },
    resolve: {
        alias: {
            '@': '/resources/js', // Alias para la carpeta de recursos
        },
    },
    build: {
        outDir: 'public/build', // Directorio de salida para los archivos compilados
        rollupOptions: {
            input: 'resources/js/app.jsx', // Archivo de entrada de tu app React
        },
        minify: 'terser', // Usa Terser para minificación en producción
    },
    server: {
        hmr: true, // Habilita Hot Module Replacement para desarrollo
    },
});
