@extends('layouts.app')

@section('content')
    <div class="row justify-content-center">
        <div class="col-lg-8">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h1 class="h4 mb-3">Borrowed Books - {{ $member->name }}</h1>
                    
                    <p class="text-muted">
                        This demonstrates a hierarchical RESTful URI: 
                        <code>/members/{{ $member->id }}/borrowed-books</code>
                    </p>

                    @if (empty($borrowedBooks))
                        <div class="alert alert-info">
                            No borrowed books found for this member.
                        </div>
                    @else
                        <div class="list-group">
                            @foreach ($borrowedBooks as $book)
                                <div class="list-group-item">
                                    <h5>{{ $book->title }}</h5>
                                    <p class="mb-0">{{ $book->author }}</p>
                                </div>
                            @endforeach
                        </div>
                    @endif

                    <div class="mt-3">
                        <a href="{{ route('members.show', $member) }}" class="btn btn-secondary">Back to Member</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
