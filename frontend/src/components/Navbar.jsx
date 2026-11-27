import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get login information
    const token = sessionStorage.getItem('token');
    const username = sessionStorage.getItem('username');
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    // Logout function
    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('isAdmin');

        alert('Logout successful!');
        navigate('/login');
    };

    return (
        <nav>
            <h2>Piki Ora Medical Centre</h2>

            <Link to="/">Home</Link>

            {/* Administrator navigation */}
            {token && isAdmin && (
                <Link to="/admin">Admin Dashboard</Link>
            )}

            {/* Patient navigation */}
            {token && !isAdmin && (
                <>
                    <Link to="/doctors">Doctors</Link>
                    <Link to="/appointments">My Appointments</Link>
                </>
            )}

            {/* Visitor navigation */}
            {!token && (
                <>
                    <Link to="/doctors">Doctors</Link>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </>
            )}

            {/* Logout link */}
            {token && (
                <a href="/login" onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                }}>
                    Logout
                </a>
            )}

            {/* Welcome message */}
            {token && (
                <p>Welcome, {username}</p>
            )}
        </nav>
    );
}

export default Navbar;