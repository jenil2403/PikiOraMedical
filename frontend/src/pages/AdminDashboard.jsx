import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {

    const [doctors, setDoctors] = useState([]);
    const [slots, setSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);

    const [error, setError] = useState('');
    const [section, setSection] = useState('doctors');
    const [formData, setFormData] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const baseUrl = import.meta.env.VITE_API_URL;
    const token = sessionStorage.getItem('token');

    const config = {
        headers: {
            Authorization: `Token ${token}`
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Load all administrator data
    const loadData = async () => {

        if (!token) {
            setError('Please login as an administrator.');
            return;
        }

        try {
            const doctorResponse = await axios.get(
                `${baseUrl}/admin/doctors/`, config
            );

            const slotResponse = await axios.get(
                `${baseUrl}/admin/slots/`, config
            );

            const appointmentResponse = await axios.get(
                `${baseUrl}/admin/appointments/`, config
            );

            const patientResponse = await axios.get(
                `${baseUrl}/admin/patients/`, config
            );

            setDoctors(doctorResponse.data);
            setSlots(slotResponse.data);
            setAppointments(appointmentResponse.data);
            setPatients(patientResponse.data);

            setError('');

        } catch (error) {
            console.log(error);
            setError('Unable to access administrator dashboard.');
        }
    };

    // Change management section
    const changeSection = (newSection) => {
        setSection(newSection);
        setShowForm(false);
        setEditingId(null);
        setFormData({});
    };

    // Open form for a new record
    const addRecord = () => {

        setEditingId(null);

        if (section === 'doctors') {
            setFormData({
                name: '',
                specialisation: '',
                email: ''
            });
        }

        if (section === 'slots') {
            setFormData({
                doctor: '',
                date: '',
                time: ''
            });
        }

        setShowForm(true);
    };

    // Open form for editing
    const editRecord = (record) => {

        setEditingId(record.id);

        if (section === 'doctors') {
            setFormData({
                name: record.name,
                specialisation: record.specialisation,
                email: record.email
            });
        }

        if (section === 'slots') {
            setFormData({
                doctor: record.doctor,
                date: record.date,
                time: record.time
            });
        }

        if (section === 'appointments') {
            setFormData({
                patient: record.patient,
                slot: record.slot,
                reason: record.reason
            });
        }

        if (section === 'patients') {
            setFormData({
                username: record.username,
                email: record.email,
                first_name: record.first_name,
                last_name: record.last_name,
                is_active: record.is_active
            });
        }

        setShowForm(true);
    };

    // Update form values
    const handleChange = (event) => {

        const name = event.target.name;

        const value = event.target.type === 'checkbox'
            ? event.target.checked
            : event.target.value;

        setFormData(previousData => ({
            ...previousData,
            [name]: value
        }));
    };

    // Save new or updated record
    const saveRecord = async (event) => {

        event.preventDefault();

        try {
            if (editingId === null) {

                await axios.post(
                    `${baseUrl}/admin/${section}/`,
                    formData,
                    config
                );

                alert('Record added successfully!');

            } else {

                await axios.patch(
                    `${baseUrl}/admin/${section}/${editingId}/`,
                    formData,
                    config
                );

                alert('Record updated successfully!');
            }

            setShowForm(false);
            setEditingId(null);
            setFormData({});

            loadData();

        } catch (error) {
            console.log(error);

            alert(
                'Unable to save record. Please check your details.'
            );
        }
    };

    // Delete or cancel a record
    const deleteRecord = async (id) => {

        let message = 'Are you sure you want to delete this record?';

        if (section === 'doctors') {
            message = 'Deleting this doctor will also delete their time slots and appointments. Continue?';
        }

        if (section === 'slots') {
            message = 'Deleting this time slot will also delete its appointment, if booked. Continue?';
        }

        if (section === 'patients') {
            message = 'Deleting this patient will also delete their appointments. Continue?';
        }

        if (section === 'appointments') {
            message = 'Are you sure you want to cancel this appointment?';
        }

        const confirmed = window.confirm(message);

        if (!confirmed) {
            return;
        }

        try {
            await axios.delete(
                `${baseUrl}/admin/${section}/${id}/`,
                config
            );

            alert('Record removed successfully!');

            setShowForm(false);
            loadData();

        } catch (error) {
            console.log(error);
            alert('Unable to remove record.');
        }
    };

    // Find doctor name
    const getDoctorName = (doctorId) => {

        const doctor = doctors.find(
            doctor => doctor.id === doctorId
        );

        return doctor ? doctor.name : doctorId;
    };

    // Find patient username
    const getPatientName = (patientId) => {

        const patient = patients.find(
            patient => patient.id === patientId
        );

        return patient ? patient.username : patientId;
    };

    return (
        <div className="admin-page">

            <h1>Administrator Dashboard</h1>
            <p>Manage Piki Ora Medical Centre.</p>

            {error ? (
                <p className="error-message">{error}</p>
            ) : (
                <>
                    <div className="admin-summary">

                        <div className="summary-card">
                            <h2>{doctors.length}</h2>
                            <p>Doctors</p>
                        </div>

                        <div className="summary-card">
                            <h2>{slots.length}</h2>
                            <p>Time Slots</p>
                        </div>

                        <div className="summary-card">
                            <h2>{appointments.length}</h2>
                            <p>Appointments</p>
                        </div>

                        <div className="summary-card">
                            <h2>{patients.length}</h2>
                            <p>Patients</p>
                        </div>

                    </div>

                    <div className="admin-menu">

                        <button onClick={() => changeSection('doctors')}>
                            Manage Doctors
                        </button>

                        <button onClick={() => changeSection('slots')}>
                            Manage Time Slots
                        </button>

                        <button onClick={() => changeSection('appointments')}>
                            Manage Appointments
                        </button>

                        <button onClick={() => changeSection('patients')}>
                            Manage Patients
                        </button>

                    </div>

                    {/* Add and Edit Form */}

                    {showForm && (
                        <div className="admin-section">

                            <h2>
                                {editingId === null
                                    ? 'Add New Record'
                                    : 'Edit Record'}
                            </h2>

                            <form
                                className="admin-form"
                                onSubmit={saveRecord}
                            >

                                {section === 'doctors' && (
                                    <>
                                        <label>Doctor Name</label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />

                                        <label>Specialisation</label>
                                        <input
                                            name="specialisation"
                                            value={formData.specialisation}
                                            onChange={handleChange}
                                            required
                                        />

                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </>
                                )}

                                {section === 'slots' && (
                                    <>
                                        <label>Doctor</label>

                                        <select
                                            name="doctor"
                                            value={formData.doctor}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">
                                                Select Doctor
                                            </option>

                                            {doctors.map(doctor => (
                                                <option
                                                    key={doctor.id}
                                                    value={doctor.id}
                                                >
                                                    {doctor.name}
                                                </option>
                                            ))}
                                        </select>

                                        <label>Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            required
                                        />

                                        <label>Time</label>
                                        <input
                                            type="time"
                                            name="time"
                                            value={formData.time}
                                            onChange={handleChange}
                                            required
                                        />
                                    </>
                                )}

                                {section === 'appointments' && (
                                    <>
                                        <label>Patient</label>

                                        <select
                                            name="patient"
                                            value={formData.patient}
                                            onChange={handleChange}
                                            required
                                        >
                                            {patients.map(patient => (
                                                <option
                                                    key={patient.id}
                                                    value={patient.id}
                                                >
                                                    {patient.username}
                                                </option>
                                            ))}
                                        </select>

                                        <label>Time Slot</label>

                                        <select
                                            name="slot"
                                            value={formData.slot}
                                            onChange={handleChange}
                                            required
                                        >
                                            {slots.filter(slot =>
                                                !appointments.some(appointment =>
                                                    appointment.slot === slot.id &&
                                                    appointment.id !== editingId
                                                )
                                            ).map(slot => (
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

                                        <label>Reason</label>

                                        <textarea
                                            name="reason"
                                            value={formData.reason}
                                            onChange={handleChange}
                                            required
                                        />
                                    </>
                                )}

                                {section === 'patients' && (
                                    <>
                                        <label>Username</label>
                                        <input
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                        />

                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />

                                        <label>First Name</label>
                                        <input
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                        />

                                        <label>Last Name</label>
                                        <input
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                        />

                                        <label>
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                checked={formData.is_active}
                                                onChange={handleChange}
                                            />
                                            Active Account
                                        </label>
                                    </>
                                )}

                                <div className="form-buttons">

                                    <button type="submit">
                                        Save Record
                                    </button>

                                    <button
                                        type="button"
                                        className="close-button"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </form>
                        </div>
                    )}

                    {/* Manage Doctors */}

                    {section === 'doctors' && (
                        <div className="admin-section">

                            <h2>Manage Doctors</h2>

                            <button
                                className="add-button"
                                onClick={addRecord}
                            >
                                Add Doctor
                            </button>

                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Specialisation</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {doctors.map(doctor => (
                                        <tr key={doctor.id}>

                                            <td>{doctor.id}</td>
                                            <td>{doctor.name}</td>
                                            <td>{doctor.specialisation}</td>
                                            <td>{doctor.email}</td>

                                            <td>
                                                <button
                                                    className="edit-button"
                                                    onClick={() => editRecord(doctor)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() => deleteRecord(doctor.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Manage Time Slots */}

                    {section === 'slots' && (
                        <div className="admin-section">

                            <h2>Manage Time Slots</h2>

                            <button
                                className="add-button"
                                onClick={addRecord}
                            >
                                Add Time Slot
                            </button>

                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Doctor</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {slots.map(slot => (
                                        <tr key={slot.id}>

                                            <td>{slot.id}</td>
                                            <td>{getDoctorName(slot.doctor)}</td>
                                            <td>{slot.date}</td>
                                            <td>{slot.time}</td>

                                            <td>
                                                <button
                                                    className="edit-button"
                                                    onClick={() => editRecord(slot)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() => deleteRecord(slot.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Manage Appointments */}

                    {section === 'appointments' && (
                        <div className="admin-section">

                            <h2>Manage Appointments</h2>

                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Reason</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {appointments.map(appointment => (
                                        <tr key={appointment.id}>

                                            <td>{appointment.id}</td>
                                            <td>{getPatientName(appointment.patient)}</td>
                                            <td>{appointment.doctor_name}</td>
                                            <td>{appointment.date}</td>
                                            <td>{appointment.time}</td>
                                            <td>{appointment.reason}</td>

                                            <td>
                                                <button
                                                    className="edit-button"
                                                    onClick={() => editRecord(appointment)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() => deleteRecord(appointment.id)}
                                                >
                                                    Cancel
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Manage Patients */}

                    {section === 'patients' && (
                        <div className="admin-section">

                            <h2>Manage Patients</h2>

                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {patients.map(patient => (
                                        <tr key={patient.id}>

                                            <td>{patient.id}</td>
                                            <td>{patient.username}</td>
                                            <td>{patient.email}</td>

                                            <td>
                                                {patient.is_active
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </td>

                                            <td>
                                                <button
                                                    className="edit-button"
                                                    onClick={() => editRecord(patient)}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() => deleteRecord(patient.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </>
            )}

        </div>
    );
}

export default AdminDashboard;
