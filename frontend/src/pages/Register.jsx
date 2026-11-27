
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const baseUrl = import.meta.env.VITE_API_URL;

    const handleRegister = async (event) => {
        event.preventDefault();
        setMessage('');

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        try {
            await axios.post(
                `${baseUrl}/register/`,
                {
                    username,
                    email,
                    password
                }
            );

            alert('Registration successful! Please login.');
            navigate('/login');

        } catch (error) {
            if (error.response?.data) {
                setMessage(
                    Object.values(error.response.data)
                        .flat()
                        .join(' ')
                );
            } else {
                setMessage('Unable to connect to the server.');
            }
        }
    };

    return (
        <div className="login-container">
            <h2>Patient Registration</h2>

            <form onSubmit={handleRegister}>

                <label>Username</label>
                <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <label>Email</label>
                <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

                <label>Confirm Password</label>
                <input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                <button type="submit">Register</button>

            </form>

            <p className="error-message">{message}</p>

            <p>
                Already have an account?{' '}
                <Link to="/login">Login</Link>
            </p>

        </div>
    );
}

export default Register;
