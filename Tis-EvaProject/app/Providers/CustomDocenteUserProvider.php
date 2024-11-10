<?php

namespace App\Providers;

use Illuminate\Auth\EloquentUserProvider;

class CustomDocenteUserProvider extends EloquentUserProvider
{
    public function retrieveByCredentials(array $credentials)
{
    if (!isset($credentials['EMAIL_DOCENTE'])) {
        return null;
    }

    $query = $this->createModel()->newQuery();
    $query->where('EMAIL_DOCENTE', $credentials['EMAIL_DOCENTE']);

    return $query->first();
}

}
