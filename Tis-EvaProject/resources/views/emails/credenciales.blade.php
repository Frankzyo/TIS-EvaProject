<!-- resources/views/emails/credenciales.blade.php -->
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido al Sistema de Evaluación de Proyectos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .header {
            background-color: #0073e6;
            color: #fff;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }

        .header h1 {
            margin: 0;
        }

        .content {
            padding: 20px;
        }

        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 0.9em;
            color: #777;
        }

        .codepen-button {
            display: block;
            cursor: pointer;
            color: white;
            margin: 0 auto;
            position: relative;
            text-decoration: none;
            font-weight: 600;
            border-radius: 6px;
            overflow: hidden;
            padding: 3px;
            isolation: isolate;
            width: max-content;
        }

        .codepen-button::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 400%;
            height: 100%;
            background: linear-gradient(115deg, #4fcf70, #fad648, #a767e5, #12bcfe, #44ce7b);
            background-size: 25% 100%;
            animation: border-animation 0.75s linear infinite;
            animation-play-state: paused;
            translate: -5% 0%;
            transition: translate 0.25s ease-out;
        }

        .codepen-button:hover::before {
            animation-play-state: running;
            transition-duration: 0.75s;
            translate: 0% 0%;
        }

        @keyframes border-animation {
            to {
                transform: translateX(-25%);
            }
        }

        .codepen-button span {
            position: relative;
            display: block;
            padding: 1rem 1.5rem;
            font-size: 1.1rem;
            background: #000;
            border-radius: 3px;
            height: 100%;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Bienvenido al Sistema de Evaluación de Proyectos</h1>
        </div>
        <div class="content">
            <p>Hola {{ $name }},</p>
            <p>Nos complace darte la bienvenida al <strong>Sistema de Evaluación de Proyectos</strong>.
                A continuación, encontrarás tus credenciales de acceso:</p>
            <p><strong>Email:</strong> {{ $email }}</p>
            <p><strong>Contraseña:</strong> {{ $password }}</p>
            <p>Por razones de seguridad, te recomendamos que cambies tu contraseña al iniciar sesión por primera vez.</p>
            <a href="http://localhost:8000/login" class="codepen-button">
                <span>Iniciar sesión</span>
            </a>
        </div>
        <div class="footer">
            <p>Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.</p>
            <p>&copy; {{ date('Y') }} Sistema de Evaluación de Proyectos. Todos los derechos reservados.</p>
        </div>
    </div>
</body>

</html>