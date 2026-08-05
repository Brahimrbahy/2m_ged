<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default settings
    |--------------------------------------------------------------------------
    |
    | Default values used when no value has been stored in the settings table.
    |
    */

    'app' => [
        'name' => env('APP_NAME', '2M GED'),
        'support_email' => 'support@example.com',
        'default_locale' => 'en',
        'date_format' => 'Y-m-d',
    ],

    'documents' => [
        'max_upload_size' => 25, // MB
        'allowed_file_types' => 'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,jpg,jpeg,png',
    ],

    'spaces' => [
        'default_visibility' => 'private',
        'user_storage_quota' => 1024, // MB
    ],

    'users' => [
        'allow_registration' => false,
        'default_role' => 'user',
        'require_email_verification' => true,
    ],
];
