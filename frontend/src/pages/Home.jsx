
import { Link } from 'react-router-dom';

function Home() {
    return (
        <main style={{ textAlign: 'center' }}>
            <h1>Welcome to Piki Ora Medical Centre</h1>
            <p>Book your medical appointment online.</p>

            <Link to="/doctors">
                View Doctors and Book
            </Link>
        </main>
    );
}

export default Home;
