import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Users from './Pages/Users/Users';
import Users2 from './Pages/Users/Users2';
import NavbarComponent from './Components/NavbarComponent';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RoleBasedUsers from './Pages/RoleBasedUsers/RoleBasedUsers';

function App() {
  return (
    <Router>
      <div className="App">
        <NavbarComponent />
        <ToastContainer />
        <Routes>
          <Route path="/users" element={<Users2 />} />
          <Route path="/users/rolebased" element={<RoleBasedUsers />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
