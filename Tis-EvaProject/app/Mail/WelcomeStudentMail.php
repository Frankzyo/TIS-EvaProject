<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WelcomeStudentMail extends Mailable
{
    use Queueable, SerializesModels;

    public $estudiante;
    public $password;

    /**
     * Create a new message instance.
     */
    public function __construct($estudiante, $password)
    {
        $this->estudiante = $estudiante;
        $this->password = $password;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Bienvenido al Sistema')
                    ->markdown('emails.welcome_student')
                    ->with([
                        'name' => $this->estudiante->NOMBRE_EST,
                        'email' => $this->estudiante->EMAIL_EST,
                        'password' => $this->password,
                    ]);
    }
}
