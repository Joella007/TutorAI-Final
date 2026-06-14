<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', '*'],

    'allowed_methods' => ['*'],

    // 👈 ICI, on met l'adresse EXACTE de votre frontend (sans / à la fin)
    'allowed_origins' => ['https://tutor-ai-final.vercel.app', 'http://localhost:8080'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // 👈 ICI, on remet à TRUE car votre système d'authentification en a besoin !
    'supports_credentials' => true, 
];