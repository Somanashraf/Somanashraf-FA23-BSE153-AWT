@extends('layouts.app')

@section('content')
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h1 class="card-title h3 mb-3">Welcome to the Library Management System</h1>
                    <p class="card-text">
                        This system demonstrates a complete, RESTful Laravel application for managing
                        <strong>books</strong> and <strong>members</strong> with a modern Bootstrap 5 UI.
                    </p>
                    <p class="card-text">
                        Use the navigation bar above to browse books and members, or to add new records.
                    </p>
                    <div class="mt-3">
                        <a href="{{ route('books.index') }}" class="btn btn-primary me-2">View Books</a>
                        <a href="{{ route('members.index') }}" class="btn btn-outline-primary">View Members</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

