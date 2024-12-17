import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
    esbuild: {
        loader: 'jsx',
    },
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    build: {
        outDir: 'public/build', // Asegúrate de que los archivos compilados se coloquen en el directorio 'public/build'
        rollupOptions: {
            input: 'resources/js/app.jsx', // Este es el archivo de entrada de tu app React
        },
        minify: 'terser', // Usa Terser para la minificación en producción
    },
});
