<?php

use App\Http\Controllers\BookController;
use App\Http\Controllers\MemberController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('home');
})->name('home');

Route::get('/api-documentation', function () {
    return view('api-documentation');
})->name('api.documentation');

Route::resource('books', BookController::class);
Route::resource('members', MemberController::class);

Route::get('members/{member}/borrowed-books', [MemberController::class, 'borrowedBooks'])
    ->name('members.borrowed-books');

