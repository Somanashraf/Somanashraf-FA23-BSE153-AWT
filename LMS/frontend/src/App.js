import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/Navbar';
import Home from './pages/Home';
import Books from './pages/Books';
import BookForm from './pages/BookForm';
import Members from './pages/Members';
import MemberForm from './pages/MemberForm';
import BorrowRecords from './pages/BorrowRecords';

function App() {
  return (
    <Router>
      <div className="App">
        <NavigationBar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/new" element={<BookForm />} />
            <Route path="/books/edit/:id" element={<BookForm />} />
            <Route path="/members" element={<Members />} />
            <Route path="/members/new" element={<MemberForm />} />
            <Route path="/members/edit/:id" element={<MemberForm />} />
            <Route path="/borrow-records" element={<BorrowRecords />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
