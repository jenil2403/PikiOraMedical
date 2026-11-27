import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/doctors" element={<Doctors />} />

                <Route path="/appointments" element={<Appointments />} />

                <Route path="/register" element={<Register />} />

                <Route path="/login" element={<Login />} />

                <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;