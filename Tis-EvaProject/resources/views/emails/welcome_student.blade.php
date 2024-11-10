@component('mail::message')
# 🎉 Bienvenido, {{ $name }} 🎉

¡Nos complace darte la bienvenida al **Sistema de evaluación de proyectos**! A continuación, encontrarás tus credenciales de acceso.

@component('mail::panel')
### Tus Credenciales de Acceso
- **Correo:** {{ $email }}
- **Contraseña:** {{ $password }}
@endcomponent

@component('mail::button', ['url' => 'http://localhost:8000'])
Iniciar Sesión
@endcomponent

---

### 🚨 Importante
Por motivos de seguridad, te recomendamos cambiar tu contraseña la primera vez que inicies sesión. Puedes hacer esto en la configuración de tu cuenta.

Si tienes alguna duda o necesitas ayuda, no dudes en contactarnos. ¡Estamos aquí para ayudarte!

Gracias por unirte a nosotros,  
El equipo de **Sistema de evaluación de proyectos**

@component('mail::footer')
Si recibiste este correo por error, ignóralo.
@endcomponent
@endcomponent
