<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    protected $token;

    /**
     * Crea una nueva instancia de notificación.
     */
    public function __construct($token)
    {
        $this->token = $token;
    }

    /**
     * Define los canales de entrega de la notificación.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Representación del correo de la notificación.
     */
    public function toMail($notifiable): MailMessage
{
    $url = url("/reset-password/{$this->token}?email={$notifiable->EMAIL_EST}");

    return (new MailMessage)
        ->subject('Restablecer Contraseña')
        ->line('Estás recibiendo este correo porque solicitaste un restablecimiento de contraseña.')
        ->action('Restablecer Contraseña', $url)
        ->line('Si no solicitaste un restablecimiento de contraseña, no se requiere ninguna acción adicional.');
}

}
