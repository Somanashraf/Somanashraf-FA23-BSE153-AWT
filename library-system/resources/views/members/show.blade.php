@extends('layouts.app')

@section('content')
    <div class="row justify-content-center">
        <div class="col-lg-6">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h1 class="h4 mb-3">Member Details</h1>

                    <div class="mb-3">
                        <label class="form-label fw-bold">Name</label>
                        <p class="form-control-plaintext">{{ $member->name }}</p>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-bold">Email</label>
                        <p class="form-control-plaintext">{{ $member->email }}</p>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-bold">Membership Date</label>
                        <p class="form-control-plaintext">{{ $member->membership_date->format('F d, Y') }}</p>
                    </div>

                    <div class="d-flex gap-2">
                        <a href="{{ route('members.index') }}" class="btn btn-secondary">Back to List</a>
                        <a href="{{ route('members.edit', $member) }}" class="btn btn-primary">Edit</a>
                        <form action="{{ route('members.destroy', $member) }}" method="POST" class="d-inline"
                              onsubmit="return confirm('Are you sure you want to delete this member?');">
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
