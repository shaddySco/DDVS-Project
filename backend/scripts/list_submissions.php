<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Submission;

$subs = Submission::all()->map(function($s) {
    return [
        'id' => $s->id,
        'title' => $s->title,
        'user_id' => $s->user_id,
        'ownership_status' => $s->ownership_status,
        'media_path' => $s->media_path,
        'repository_url' => $s->repository_url,
        'created_at' => (string) $s->created_at,
        'verified_at' => $s->verified_at ? (string) $s->verified_at : null,
    ];
});

echo $subs->toJson(JSON_PRETTY_PRINT);
