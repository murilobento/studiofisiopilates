<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark', 'min-h-screen' => true, 'h-full' => true])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Favicon moderno do Studio Fisiopilates -->
        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
        <link rel="icon" href="/favicon-64.png" type="image/png" sizes="64x64">
        <link rel="icon" href="/favicon.png" type="image/png" sizes="128x128">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        
        <!-- Meta tags para PWA e redes sociais -->
        <meta name="theme-color" content="#4ECDC4">
        <meta name="description" content="Studio Fisiopilates - Pilates clínico e fisioterapia em Regente Feijó, SP. Transformando vidas através do movimento consciente.">
        <meta property="og:title" content="Studio Fisiopilates - Pilates & Fisioterapia">
        <meta property="og:description" content="Descubra o equilíbrio perfeito entre corpo e mente. Tratamentos personalizados de pilates clínico e fisioterapia.">
        <meta property="og:image" content="/apple-touch-icon.png">
        <meta property="og:type" content="website">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        {{-- CSRF Token para requisições via fetch/Inertia --}}
        <meta name="csrf-token" content="{{ csrf_token() }}">

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased min-h-screen h-full">
        @inertia
    </body>
</html>
