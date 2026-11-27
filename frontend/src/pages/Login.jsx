
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const baseUrl = import.meta.env.VITE_API_URL;

    const handleLogin = async (event) => {
        event.preventDefault();
        setMessage('');

        try {
            // Login request
            const response = await fetch(
                `${baseUrl}/login/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok && data.token) {

                // Get logged-in user details
                const userResponse = await fetch(
                    `${baseUrl}/user/`,
                    {
                        headers: {
                            Authorization: `Token ${data.token}`
                        }
                    }
                );

                if (!userResponse.ok) {
                    setMessage('Unable to load user details.');
                    return;
                }

                const userData = await userResponse.json();

                // Save login information
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('username', userData.username);

                // Check if the user is an administrator
                if (userData.is_admin === true) {

                    sessionStorage.setItem('isAdmin', 'true');

                    alert('Administrator login successful!');

                    navigate('/admin');

                } else {

                    sessionStorage.setItem('isAdmin', 'false');

                    alert('Login successful!');

                    navigate('/doctors');
                }

            } else {
                setMessage('Invalid username or password.');
            }

        } catch (error) {
            console.log(error);
            setMessage('Unable to connect to the server.');
        }
    };

    return (
        <div className="login-container">

            <h2>Login</h2>

            <form onSubmit={handleLogin}>

                <label>Username</label>

                <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <label>Password</label>

                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Login</button>

            </form>

            <p>
                Don't have an account?{' '}
                <Link to="/register">Register</Link>
            </p>

            <p className="error-message">{message}</p>

        </div>
    );
}

export default Login;
