
import { useState, useEffect } from 'react';
import axios from 'axios';

function MyAppointments() {

    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [slots, setSlots] = useState([]);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [reason, setReason] = useState('');

    const baseUrl = import.meta.env.VITE_API_URL;
    const token = sessionStorage.getItem('token');

    const config = {
        headers: {
            Authorization: `Token ${token}`
        }
    };


    // Load appointments when the page opens

    useEffect(() => {
        loadAppointments();
    }, []);


    // Get patient's appointments

    const loadAppointments = async () => {

        if (!token) {
            setError('Please login to view your appointments.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                `${baseUrl}/my-appointments/`,
                config
            );

            setAppointments(response.data);
            setError('');

        } catch (error) {
            console.log(error);
            setError('Unable to load appointments.');
        }

        setLoading(false);
    };


    // Open the edit appointment form

    const editAppointment = async (appointment) => {

        try {
            const doctorResponse = await axios.get(
                `${baseUrl}/doctors/`
            );

            const slotResponse = await axios.get(
                `${baseUrl}/slots/`
            );

            setDoctors(doctorResponse.data);
            setSlots(slotResponse.data);

            setEditingId(appointment.id);
            setSelectedSlot(appointment.slot);
            setReason(appointment.reason);

        } catch (error) {
            console.log(error);
            alert('Unable to load available time slots.');
        }
    };


    // Save the updated appointment

    const updateAppointment = async (event) => {

        event.preventDefault();

        if (reason.trim() === '') {
            alert('Please enter an appointment reason.');
            return;
        }

        try {
            await axios.patch(
                `${baseUrl}/update/${editingId}/`,
                {
                    slot: Number(selectedSlot),
                    reason: reason
                },
                config
            );

            alert('Appointment updated successfully!');

            setEditingId(null);
            setSelectedSlot('');
            setReason('');

            await loadAppointments();

        } catch (error) {
            console.log(error);
            alert('Unable to update appointment. Please check the selected time slot.');
        }
    };


    // Cancel editing

    const closeEditForm = () => {
        setEditingId(null);
        setSelectedSlot('');
        setReason('');
    };


    // Cancel an appointment

    const cancelAppointment = async (appointmentId) => {

        const confirmed = window.confirm(
            'Are you sure you want to cancel this appointment?'
        );

        if (!confirmed) {
            return;
        }

        try {
            await axios.delete(
                `${baseUrl}/cancel/${appointmentId}/`,
                config
            );

            setAppointments(previousAppointments =>
                previousAppointments.filter(
                    appointment => appointment.id !== appointmentId
                )
            );

            if (editingId === appointmentId) {
                closeEditForm();
            }

            alert('Appointment cancelled successfully!');

        } catch (error) {
            console.log(error);
            alert('Unable to cancel appointment.');
        }
    };


    // Display the doctor name

    const getDoctorName = (doctorId) => {

        const doctor = doctors.find(
            doctor => doctor.id === doctorId
        );

        if (doctor) {
            return doctor.name;
        }

        return 'Unknown Doctor';
    };


    return (

        <div className="appointments-page">

            <h1>My Appointments</h1>

            <p>View and manage your appointments.</p>

            {loading && <p>Loading appointments...</p>}

            {error && (
                <p className="error-message">{error}</p>
            )}

            {!loading && !error && appointments.length === 0 && (
                <p>You have no booked appointments.</p>
            )}


            {appointments.map(appointment => (

                <div
                    key={appointment.id}
                    className="appointment-card"
                >

                    <h2>{appointment.doctor_name}</h2>

                    <p>
                        <strong>Date:</strong> {appointment.date}
                    </p>

                    <p>
                        <strong>Time:</strong> {appointment.time}
                    </p>

                    <p>
                        <strong>Reason:</strong> {appointment.reason}
                    </p>

                    <p className="appointment-status">
                        Status: Booked
                    </p>


                    {/* Edit Appointment Form */}

                    {editingId === appointment.id ? (

                        <form
                            className="admin-form"
                            onSubmit={updateAppointment}
                        >

                            <h2>Edit Appointment</h2>

                            <label>Select Appointment Slot</label>

                            <select
                                value={selectedSlot}
                                onChange={event =>
                                    setSelectedSlot(event.target.value)
                                }
                                required
                            >

                                <option value={appointment.slot}>
                                    Current: {appointment.doctor_name}
                                    {' - '}
                                    {appointment.date}
                                    {' - '}
                                    {appointment.time}
                                </option>

                                {slots.map(slot => (

                                    <option
                                        key={slot.id}
                                        value={slot.id}
                                    >
                                        {getDoctorName(slot.doctor)}
                                        {' - '}
                                        {slot.date}
                                        {' - '}
                                        {slot.time}
                                    </option>

                                ))}

                            </select>


                            <label>Appointment Reason</label>

                            <textarea
                                value={reason}
                                onChange={event =>
                                    setReason(event.target.value)
                                }
                                required
                            />


                            <div className="form-buttons">

                                <button type="submit">
                                    Save Changes
                                </button>

                                <button
                                    type="button"
                                    className="close-button"
                                    onClick={closeEditForm}
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    ) : (

                        <div style={{ textAlign: 'center' }}>

                            <button
                                className="edit-button"
                                onClick={() =>
                                    editAppointment(appointment)
                                }
                            >
                                Edit Appointment
                            </button>

                            <button
                                className="delete-button"
                                onClick={() =>
                                    cancelAppointment(appointment.id)
                                }
                            >
                                Cancel Appointment
                            </button>

                        </div>

                    )}

                </div>

            ))}

        </div>
    );
}

export default MyAppointments;
