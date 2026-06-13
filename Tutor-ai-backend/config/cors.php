<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', '*'], // On autorise toutes les routes API

    'allowed_methods' => ['*'], // On autorise GET, POST, PUT, DELETE...

    'allowed_origins' => ['*'], // 👈 L'ÉTOILE MAGIQUE : Autorise Vercel, Localhost, et n'importe quel appareil !

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], // On autorise tous les headers

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false, // 👈 DOIT ÊTRE À FALSE pour que l'étoile (*) fonctionne
];