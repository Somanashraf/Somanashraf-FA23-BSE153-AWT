@extends('layouts.app')

@section('content')
    <div class="row justify-content-center">
        <div class="col-lg-6">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h1 class="h4 mb-3">Book Details</h1>

                    <div class="mb-3">
                        <label class="form-label fw-bold">Title</label>
                        <p class="form-control-plaintext">{{ $book->title }}</p>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-bold">Author</label>
                        <p class="form-control-plaintext">{{ $book->author }}</p>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-bold">ISBN</label>
                        <p class="form-control-plaintext">{{ $book->isbn }}</p>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-bold">Published Year</label>
                        <p class="form-control-plaintext">{{ $book->published_year }}</p>
                    </div>

                    <div class="d-flex gap-2">
                        <a href="{{ route('books.index') }}" class="btn btn-secondary">Back to List</a>
                        <a href="{{ route('books.edit', $book) }}" class="btn btn-primary">Edit</a>
                        <form action="{{ route('books.destroy', $book) }}" method="POST" class="d-inline"
                              onsubmit="return confirm('Are you sure you want to delete this book?');">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn btn-danger">Delete</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
