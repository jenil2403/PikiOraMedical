from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from . import views


urlpatterns = [

    # Public API
    path('doctors/', views.doctor_list),
    path('slots/', views.available_slots),

    # Patient account
    path('register/', views.RegisterView.as_view()),
    path('login/', obtain_auth_token),
    path('user/', views.user_details),

    # Patient appointments
    path('book/', views.BookAppointmentView.as_view()),
    path('my-appointments/', views.MyAppointmentsView.as_view()),
    path('update/<int:pk>/', views.UpdateAppointmentView.as_view()),
    path('cancel/<int:pk>/', views.CancelAppointmentView.as_view()),

    # Administrator - Doctors
    path('admin/doctors/', views.AdminDoctorListView.as_view()),
    path('admin/doctors/<int:pk>/', views.AdminDoctorDetailView.as_view()),

    # Administrator - Time slots
    path('admin/slots/', views.AdminSlotListView.as_view()),
    path('admin/slots/<int:pk>/', views.AdminSlotDetailView.as_view()),

    # Administrator - Appointments
    path('admin/appointments/', views.AdminAppointmentListView.as_view()),
    path('admin/appointments/<int:pk>/', views.AdminAppointmentDetailView.as_view()),

    # Administrator - Patients
    path('admin/patients/', views.AdminPatientListView.as_view()),
    path('admin/patients/<int:pk>/', views.AdminPatientDetailView.as_view()),

]