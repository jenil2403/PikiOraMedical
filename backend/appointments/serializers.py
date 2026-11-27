from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Doctor, TimeSlot, Appointment


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['id', 'name', 'specialisation', 'email']


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ['id', 'doctor', 'date', 'time']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(
        source='slot.doctor.name', read_only=True
    )
    date = serializers.DateField(
        source='slot.date', read_only=True
    )
    time = serializers.TimeField(
        source='slot.time', read_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'slot', 'reason',
            'created_at', 'doctor_name', 'date', 'time'
        ]
        read_only_fields = ['id', 'patient', 'created_at']

class AdminPatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'is_active'
        ]
        read_only_fields = ['id']


class AdminAppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(
        source='patient.username',
        read_only=True
    )

    doctor_name = serializers.CharField(
        source='slot.doctor.name',
        read_only=True
    )

    date = serializers.DateField(
        source='slot.date',
        read_only=True
    )

    time = serializers.TimeField(
        source='slot.time',
        read_only=True
    )

    class Meta:
        model = Appointment
        fields = [
            'id',
            'patient',
            'patient_name',
            'slot',
            'reason',
            'created_at',
            'doctor_name',
            'date',
            'time'
        ]
        read_only_fields = ['id', 'created_at']