<?php

namespace Database\Seeders;

use App\Models\Book;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $books = [
            [
                'title' => 'Clean Code',
                'author' => 'Robert C. Martin',
                'isbn' => '9780132350884',
                'published_year' => 2008,
            ],
            [
                'title' => 'Design Patterns',
                'author' => 'Erich Gamma et al.',
                'isbn' => '9780201633610',
                'published_year' => 1994,
            ],
            [
                'title' => 'Refactoring',
                'author' => 'Martin Fowler',
                'isbn' => '9780201485677',
                'published_year' => 1999,
            ],
            [
                'title' => 'The Pragmatic Programmer',
                'author' => 'Andrew Hunt, David Thomas',
                'isbn' => '9780201616224',
                'published_year' => 1999,
            ],
            [
                'title' => 'Laravel: Up and Running',
                'author' => 'Matt Stauffer',
                'isbn' => '9781492076988',
                'published_year' => 2019,
            ],
            [
                'title' => 'Introduction to Algorithms',
                'author' => 'Thomas H. Cormen',
                'isbn' => '9780262033848',
                'published_year' => 2009,
            ],
            [
                'title' => 'The Clean Coder',
                'author' => 'Robert C. Martin',
                'isbn' => '9780137081073',
                'published_year' => 2011,
            ],
            [
                'title' => 'Code Complete',
                'author' => 'Steve McConnell',
                'isbn' => '9780735619678',
                'published_year' => 2004,
            ],
            [
                'title' => 'Head First Design Patterns',
                'author' => 'Eric Freeman',
                'isbn' => '9780596007126',
                'published_year' => 2004,
            ],
            [
                'title' => 'Eloquent JavaScript',
                'author' => 'Marijn Haverbeke',
                'isbn' => '9781593279509',
                'published_year' => 2018,
            ],
        ];

        foreach ($books as $book) {
            Book::updateOrCreate(
                ['isbn' => $book['isbn']],
                $book
            );
        }
    }
}

