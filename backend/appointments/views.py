from django.contrib.auth.models import User
from django.db import IntegrityError, transaction

from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAdminUser
)
from rest_framework.exceptions import ValidationError

from .models import Doctor, TimeSlot, Appointment

from .serializers import (
    DoctorSerializer,
    TimeSlotSerializer,
    RegisterSerializer,
    AppointmentSerializer,
    AdminPatientSerializer,
    AdminAppointmentSerializer
)


# ----------------------------------------
# Public API
# ----------------------------------------

# Display all doctors
@api_view(['GET'])
@permission_classes([AllowAny])
def doctor_list(request):
    doctors = Doctor.objects.all()
    serializer = DoctorSerializer(doctors, many=True)
    return Response(serializer.data)


# Display available appointment slots
@api_view(['GET'])
@permission_classes([AllowAny])
def available_slots(request):
    slots = TimeSlot.objects.filter(
        appointment__isnull=True
    )

    serializer = TimeSlotSerializer(slots, many=True)
    return Response(serializer.data)


# ----------------------------------------
# Patient registration and account details
# ----------------------------------------

# Register a new patient
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# Get logged-in user information
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_details(request):
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'is_admin': request.user.is_staff
    })


# ----------------------------------------
# Patient appointment management
# ----------------------------------------

# Book an appointment
class BookAppointmentView(generics.CreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        slot = serializer.validated_data['slot']

        # Check if the slot is already booked
        if Appointment.objects.filter(slot=slot).exists():
            raise ValidationError(
                "This time slot is already booked."
            )

        try:
            with transaction.atomic():
                serializer.save(patient=self.request.user)

        except IntegrityError:
            raise ValidationError(
                "This time slot is already booked."
            )


# View logged-in patient's appointments
class MyAppointmentsView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(
            patient=self.request.user
        ).order_by('slot__date', 'slot__time')


# Update an existing appointment
class UpdateAppointmentView(generics.UpdateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(
            patient=self.request.user
        )

    def perform_update(self, serializer):
        appointment = self.get_object()

        slot = serializer.validated_data.get(
            'slot', appointment.slot
        )

        # Check if another appointment uses this slot
        if Appointment.objects.filter(
            slot=slot
        ).exclude(id=appointment.id).exists():
            raise ValidationError(
                "This time slot is already booked."
            )

        try:
            with transaction.atomic():
                serializer.save()

        except IntegrityError:
            raise ValidationError(
                "This time slot is already booked."
            )


# Cancel an existing appointment
class CancelAppointmentView(generics.DestroyAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(
            patient=self.request.user
        )


# ----------------------------------------
# Administrator - Manage Doctors
# ----------------------------------------

# View and add doctors
class AdminDoctorListView(generics.ListCreateAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAdminUser]


# View, edit and delete a doctor
class AdminDoctorDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAdminUser]


# ----------------------------------------
# Administrator - Manage Time Slots
# ----------------------------------------

# View and create time slots
class AdminSlotListView(generics.ListCreateAPIView):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAdminUser]


# View, edit and delete a time slot
class AdminSlotDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAdminUser]


# ----------------------------------------
# Administrator - Manage Appointments
# ----------------------------------------

# View all patient appointments
class AdminAppointmentListView(generics.ListAPIView):
    queryset = Appointment.objects.all().order_by(
        'slot__date', 'slot__time'
    )

    serializer_class = AdminAppointmentSerializer
    permission_classes = [IsAdminUser]


# View, update and cancel patient appointments
class AdminAppointmentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Appointment.objects.all()
    serializer_class = AdminAppointmentSerializer
    permission_classes = [IsAdminUser]

    def perform_update(self, serializer):
        appointment = self.get_object()

        slot = serializer.validated_data.get(
            'slot', appointment.slot
        )

        patient = serializer.validated_data.get(
            'patient', appointment.patient
        )

        if patient.is_staff or patient.is_superuser:
            raise ValidationError(
                "Please select a patient account."
            )

        # Prevent double booking
        if Appointment.objects.filter(
            slot=slot
        ).exclude(id=appointment.id).exists():
            raise ValidationError(
                "This time slot is already booked."
            )

        try:
            with transaction.atomic():
                serializer.save()

        except IntegrityError:
            raise ValidationError(
                "This time slot is already booked."
            )


# ----------------------------------------
# Administrator - Manage Patients
# ----------------------------------------

# View all patient accounts
class AdminPatientListView(generics.ListAPIView):
    serializer_class = AdminPatientSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return User.objects.filter(
            is_staff=False,
            is_superuser=False
        )


# View, update and delete patient accounts
class AdminPatientDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = AdminPatientSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return User.objects.filter(
            is_staff=False,
            is_superuser=False
        )