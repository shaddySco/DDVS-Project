<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = App\Models\User::all();
echo "Users:\n";
foreach ($users as $u) {
    echo "ID: {$u->id}, Wallet: " . substr($u->wallet_address, 0, 6) . "..." . substr($u->wallet_address, -4) . ", Name: {$u->username}\n";
    foreach ($u->submissions as $s) {
        echo "  - Sub ID: {$s->id}, Title: {$s->title}, Status: {$s->ownership_status}\n";
    }
}
