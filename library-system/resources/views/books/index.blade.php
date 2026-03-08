@extends('layouts.app')

@section('content')
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h3 mb-0">Books</h1>
        <a href="{{ route('books.create') }}" class="btn btn-success">Add Book</a>
    </div>

    @if ($books->isEmpty())
        <div class="alert alert-info">
            No books found. Start by adding a new book.
        </div>
    @else
        <div class="row row-cols-1 row-cols-md-3 g-4">
            @foreach ($books as $book)
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">{{ $book->title }}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">{{ $book->author }}</h6>
                            <p class="card-text mb-1"><strong>ISBN:</strong> {{ $book->isbn }}</p>
                            <p class="card-text mb-3"><strong>Published:</strong> {{ $book->published_year }}</p>
                            <div class="mt-auto d-flex gap-2">
                                <a href="{{ route('books.show', $book) }}" class="btn btn-sm btn-outline-primary">View</a>
                                <a href="{{ route('books.edit', $book) }}" class="btn btn-sm btn-primary">Edit</a>
                                <form action="{{ route('books.destroy', $book) }}" method="POST" class="d-inline"
                                      onsubmit="return confirm('Are you sure you want to delete this book?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-sm btn-danger">Delete</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="mt-4">
            {{ $books->links() }}
        </div>
    @endif
@endsection

