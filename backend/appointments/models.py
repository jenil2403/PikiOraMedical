
from django.db import models
from django.contrib.auth.models import User


class Doctor(models.Model):
    name = models.CharField(max_length=100)
    specialisation = models.CharField(max_length=100)
    email = models.EmailField()

    def __str__(self):
        return self.name


class TimeSlot(models.Model):
    doctor = models.ForeignKey(
        Doctor, on_delete=models.CASCADE
    )
    date = models.DateField()
    time = models.TimeField()

    class Meta:
        unique_together = ('doctor', 'date', 'time')

    def __str__(self):
        return f"{self.doctor.name} - {self.date} - {self.time}"


class Appointment(models.Model):
    patient = models.ForeignKey(
        User, on_delete=models.CASCADE
    )
    slot = models.OneToOneField(
        TimeSlot, on_delete=models.CASCADE
    )
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.username} - {self.slot}"
