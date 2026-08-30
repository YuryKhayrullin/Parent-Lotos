<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ParentProfile;
use App\Models\Child;
use App\Models\Achievement;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $parent = ParentProfile::firstOrCreate(['phone' => '79057877454'], [
            'yclients_client_id' => 1234,
            'name' => 'Test Parent',
        ]);

        $child = Child::firstOrCreate(['yclients_visitor_id' => 5678], [
            'parent_id' => $parent->id,
            'name' => 'Test Child',
            'birth_year' => 2015,
            'group_name' => 'Advanced Swimmers',
        ]);

        Achievement::firstOrCreate(['id' => '1'], [
            'child_id' => $child->id,
            'title' => 'Fastest Lap',
            'description' => 'Completed 50m in 45 seconds',
            'date' => '2026-08-30',
        ]);
    }
}
