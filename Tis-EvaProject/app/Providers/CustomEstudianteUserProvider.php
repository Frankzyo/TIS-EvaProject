<?php

namespace App\Providers;

use Illuminate\Auth\EloquentUserProvider;
use Illuminate\Contracts\Auth\Authenticatable;

class CustomEstudianteUserProvider extends EloquentUserProvider
{
    public function retrieveByCredentials(array $credentials)
    {
        // Verifica que 'email' esté definido en las credenciales
        if (!isset($credentials['email'])) {
            return null;
        }
    
        // Crea la consulta en base al campo EMAIL_EST
        $query = $this->createModel()->newQuery();
    
        // Busca específicamente usando EMAIL_EST
        $query->where('EMAIL_EST', $credentials['email']);
    
        return $query->first();
    }
}
