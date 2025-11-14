from django.urls import path
from .views import LoginView, RegistrarAtendimento
from .views import LoginView, RegistrarAtendimento, ListarRegistros

urlpatterns = [
    path('login/', LoginView.as_view()),
    path('registrar/', RegistrarAtendimento.as_view()),
    path('registros/', ListarRegistros.as_view()),  # NOVA ROTA
]
