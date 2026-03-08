@extends('layouts.app')

@section('content')
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h3 mb-0">Members</h1>
        <a href="{{ route('members.create') }}" class="btn btn-success">Add Member</a>
    </div>

    @if ($members->isEmpty())
        <div class="alert alert-info">
            No members found. Start by adding a new member.
        </div>
    @else
        <div class="row row-cols-1 row-cols-md-3 g-4">
            @foreach ($members as $member)
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">{{ $member->name }}</h5>
                            <p class="card-text mb-1"><strong>Email:</strong> {{ $member->email }}</p>
                            <p class="card-text mb-3"><strong>Member Since:</strong> {{ $member->membership_date->format('M d, Y') }}</p>
                            <div class="mt-auto d-flex gap-2">
                                <a href="{{ route('members.show', $member) }}" class="btn btn-sm btn-outline-primary">View</a>
                                <a href="{{ route('members.edit', $member) }}" class="btn btn-sm btn-primary">Edit</a>
                                <form action="{{ route('members.destroy', $member) }}" method="POST" class="d-inline"
                                      onsubmit="return confirm('Are you sure you want to delete this member?');">
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
            {{ $members->links() }}
        </div>
    @endif
@endsection
