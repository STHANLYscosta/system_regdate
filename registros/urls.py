from django.urls import path
from .views import LoginView, RegistrarAtendimento
from .views import LoginView, RegistrarAtendimento, ListarRegistros
from .views import DetalheRegistro
from .dashboard_views import (
    DashboardTotalGeral,
    DashboardPorTipo,
    DashboardPorPosto,
    DashboardPorAtendente,
    DashboardPorDia,
    DashboardPorHora,
)


urlpatterns = [
    path('login/', LoginView.as_view()),
    path('registrar/', RegistrarAtendimento.as_view()),
    path('registros/', ListarRegistros.as_view()),
    path("registros/<int:pk>/", DetalheRegistro.as_view()),
    # ROTAS DO DASHBOARD
    path("dashboard/total-geral/", DashboardTotalGeral.as_view()),
    path("dashboard/tipo/", DashboardPorTipo.as_view()),
    path("dashboard/posto/", DashboardPorPosto.as_view()),
    path("dashboard/atendente/", DashboardPorAtendente.as_view()),
    path("dashboard/dia/", DashboardPorDia.as_view()),
    path("dashboard/hora/", DashboardPorHora.as_view()),

]
