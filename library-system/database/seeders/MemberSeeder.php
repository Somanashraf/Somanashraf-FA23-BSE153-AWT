<?php

namespace Database\Seeders;

use App\Models\Member;
use Illuminate\Database\Seeder;

class MemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $members = [
            [
                'name' => 'Alice Johnson',
                'email' => 'alice@example.com',
                'membership_date' => now()->subYears(2)->toDateString(),
            ],
            [
                'name' => 'Bob Smith',
                'email' => 'bob@example.com',
                'membership_date' => now()->subYear()->toDateString(),
            ],
            [
                'name' => 'Carol Davis',
                'email' => 'carol@example.com',
                'membership_date' => now()->subMonths(6)->toDateString(),
            ],
            [
                'name' => 'David Garcia',
                'email' => 'david@example.com',
                'membership_date' => now()->subMonths(3)->toDateString(),
            ],
            [
                'name' => 'Eve Martinez',
                'email' => 'eve@example.com',
                'membership_date' => now()->subMonth()->toDateString(),
            ],
            [
                'name' => 'Frank Wilson',
                'email' => 'frank@example.com',
                'membership_date' => now()->subMonths(8)->toDateString(),
            ],
            [
                'name' => 'Grace Lee',
                'email' => 'grace@example.com',
                'membership_date' => now()->subMonths(4)->toDateString(),
            ],
            [
                'name' => 'Henry Brown',
                'email' => 'henry@example.com',
                'membership_date' => now()->subMonths(10)->toDateString(),
            ],
            [
                'name' => 'Iris Chen',
                'email' => 'iris@example.com',
                'membership_date' => now()->subWeeks(2)->toDateString(),
            ],
            [
                'name' => 'Jack Taylor',
                'email' => 'jack@example.com',
                'membership_date' => now()->subDays(5)->toDateString(),
            ],
        ];

        foreach ($members as $member) {
            Member::updateOrCreate(
                ['email' => $member['email']],
                $member
            );
        }
    }
}

