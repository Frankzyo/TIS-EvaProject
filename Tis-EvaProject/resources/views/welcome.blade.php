<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Laravel</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
    <!-- En tu archivo layouts/app.blade.php -->
    <!-- En layouts/app.blade.php -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- En layouts/app.blade.php -->
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">



    <!-- Vite -->
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])

</head>

<body class="font-sans antialiased dark:bg-black dark:text-white/50">
    <div id="app"></div> <!-- Aquí se montará el componente React -->

    <div class="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50">
        <!-- Aquí sigue tu contenido -->
    </div>

</body>

</html>
