@extends('layouts.app')

@section('content')
    <div class="row">
        <div class="col-lg-10 mx-auto">
            <h1 class="h3 mb-4">API Documentation</h1>

            <div class="card shadow-sm mb-4">
                <div class="card-body">
                    <h2 class="h5 mb-3">RESTful Principles</h2>
                    
                    <h3 class="h6 mt-3">Statelessness</h3>
                    <p>
                        This API adheres to the <strong>stateless</strong> constraint of REST. Each HTTP request contains 
                        all information necessary to process it. The server does not store client context between requests. 
                        Laravel's session handling is used only for flash messages in the web interface, not for API state.
                    </p>

                    <h3 class="h6 mt-3">Idempotency</h3>
                    <p>
                        <strong>Idempotent operations</strong> produce the same result regardless of how many times they are executed:
                    </p>
                    <ul>
                        <li><code>GET</code> - Always idempotent. Reading data multiple times produces the same result.</li>
                        <li><code>PUT</code> - Idempotent. Updating a resource with the same data multiple times results in the same state.</li>
                        <li><code>DELETE</code> - Idempotent. Deleting a resource multiple times has the same effect (resource is deleted).</li>
                        <li><code>POST</code> - NOT idempotent. Creating a resource multiple times would create multiple resources.</li>
                    </ul>
                </div>
            </div>

            <div class="card shadow-sm mb-4">
                <div class="card-body">
                    <h2 class="h5 mb-3">Books API Endpoints</h2>
                    
                    <table class="table table-bordered">
                        <thead class="table-light">
                            <tr>
                                <th>HTTP Method</th>
                                <th>URI</th>
                                <th>Action</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span class="badge bg-success">GET</span></td>
                                <td><code>/books</code></td>
                                <td>index</td>
                                <td>List all books (paginated)</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-success">GET</span></td>
                                <td><code>/books/create</code></td>
                                <td>create</td>
                                <td>Show form to create a new book</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-primary">POST</span></td>
                                <td><code>/books</code></td>
                                <td>store</td>
                                <td>Store a new book in the database</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-success">GET</span></td>
                                <td><code>/books/{id}</code></td>
                                <td>show</td>
                                <td>Display a specific book</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-success">GET</span></td>
                                <td><code>/books/{id}/edit</code></td>
                                <td>edit</td>
                                <td>Show form to edit a book</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-warning">PUT/PATCH</span></td>
                                <td><code>/books/{id}</code></td>
                                <td>update</td>
                                <td>Update a specific book</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-danger">DELETE</span></td>
                                <td><code>/books/{id}</code></td>
                                <td>destroy</td>
                                <td>Delete a specific book</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card shadow-sm mb-4">
                <div class="card-body">
                    <h2 class="h5 mb-3">Members API Endpoints</h2>
                    
                    <table class="table table-bordered">
                        <thead class="table-light">
                            <tr>
                                <th>HTTP Method</th>
                                <th>URI</th>
                                <th>Action</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span class="badge bg-success">GET</span></td>
                                <td><code>/members</code></td>
                                <td>index</td>
                                <td>List all members (paginated)</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-success">GET</span></td>
                                <td><code>/members/create</code></td>
                                <td>create</td>
                                <td>Show form to create a new member</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-primary">POST</span></td>
                                <td><code>/members</code></td>
                                <td>store</td>
                                <td>Store a new member in the database</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-success">GET</span></td>
                                <td><code>/members/{id}</code></td>
                                <td>show</td>
                                <td>Display a specific member</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-success">GET</span></td>
                                <td><code>/members/{id}/edit</code></td>
                                <td>edit</td>
                                <td>Show form to edit a member</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-warning">PUT/PATCH</span></td>
                                <td><code>/members/{id}</code></td>
                                <td>update</td>
                                <td>Update a specific member</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-danger">DELETE</span></td>
                                <td><code>/members/{id}</code></td>
                                <td>destroy</td>
                                <td>Delete a specific member</td>
                            </tr>
                            <tr>
                                <td><span class="badge bg-success">GET</span></td>
                                <td><code>/members/{id}/borrowed-books</code></td>
                                <td>borrowedBooks</td>
                                <td>List books borrowed by a member (hierarchical URI)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card shadow-sm mb-4">
                <div class="card-body">
                    <h2 class="h5 mb-3">Resource & URI Design</h2>
                    
                    <h3 class="h6 mt-3">Plural Nouns for Resources</h3>
                    <p>
                        All URIs use <strong>plural nouns</strong> to represent collections:
                    </p>
                    <ul>
                        <li><code>/books</code> - Collection of books</li>
                        <li><code>/members</code> - Collection of members</li>
                    </ul>

                    <h3 class="h6 mt-3">Hierarchical Structure</h3>
                    <p>
                        Nested resources demonstrate hierarchical relationships:
                    </p>
                    <ul>
                        <li><code>/members/{id}/borrowed-books</code> - Books belonging to a specific member</li>
                    </ul>

                    <h3 class="h6 mt-3">No Verbs in URIs</h3>
                    <p>
                        URIs represent resources, not actions. HTTP methods (GET, POST, PUT, DELETE) define the action.
                    </p>
                </div>
            </div>

            <div class="text-center mt-4">
                <a href="{{ route('home') }}" class="btn btn-primary">Back to Home</a>
            </div>
        </div>
    </div>
@endsection
