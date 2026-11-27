
import { useState, useEffect } from 'react';
import axios from 'axios';

function Doctors() {
    const [doctors, setDoctors] = useState([]);
    const [slots, setSlots] = useState([]);
    const [error, setError] = useState('');

    const baseUrl = import.meta.env.VITE_API_URL;

    useEffect(() => {
        axios.get(`${baseUrl}/doctors/`)
            .then(response => {
                setDoctors(response.data);
            })
            .catch(error => {
                console.log(error);
                setError('Unable to load doctors.');
            });

        axios.get(`${baseUrl}/slots/`)
            .then(response => {
                setSlots(response.data);
            })
            .catch(error => {
                console.log(error);
                setError('Unable to load time slots.');
            });
    }, [baseUrl]);

    const bookAppointment = async (slotId) => {
        const token = sessionStorage.getItem('token');

        if (!token) {
            alert('Please login before booking an appointment.');
            return;
        }

        const reason = prompt('Please enter your reason for the appointment:');

        if (!reason || !reason.trim()) {
            return;
        }

        try {
            await axios.post(
                `${baseUrl}/book/`,
                {
                    slot: slotId,
                    reason: reason.trim()
                },
                {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                }
            );

            alert('Appointment booked successfully!');

            setSlots(previousSlots =>
                previousSlots.filter(slot => slot.id !== slotId)
            );

        } catch (error) {
            console.log(error);

            if (error.response?.status === 401) {
                alert('Please login again.');
            } else if (error.response?.status === 400) {
                alert('Unable to book. This slot may already be booked.');
            } else {
                alert('Unable to book appointment. Please try again.');
            }
        }
    };

    return (
        <div className="doctors-page">
            <h1>Our Doctors</h1>

            {error && <p>{error}</p>}

            {doctors.map(doctor => (
                <div key={doctor.id} className="doctor-card">
                    <h2>{doctor.name}</h2>
                    <p>{doctor.specialisation}</p>
                    <p>{doctor.email}</p>

                    <h3>Available Appointments</h3>

                    {slots.filter(slot => slot.doctor === doctor.id)
                        .map(slot => (
                            <div key={slot.id} className="slot">
                                <p>{slot.date} | {slot.time}</p>

                                <button
                                    className="book-button"
                                    onClick={() => bookAppointment(slot.id)}
                                >
                                    Book Appointment
                                </button>
                            </div>
                        ))}

                    {!slots.some(slot => slot.doctor === doctor.id) && (
                        <p>No appointments available.</p>
                    )}
                </div>
            ))}
        </div>
    );
}

export default Doctors;
