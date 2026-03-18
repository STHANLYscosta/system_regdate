from django.urls import path

# Importando todas as views do arquivo views.py
from .views import (
    LoginView, 
    TrocarSenhaPrimeiroAcessoView, 
    GerenciarUsuariosView,
    ListarPostosView,          
    TransferirPostoView,
    RegistrarAtendimentoView, # <- AQUI ESTÁ A CORREÇÃO DO ERRO
    ListarRegistros,
    DetalheRegistro
)

# Importando as views de Dashboard
from .dashboard_views import (
    DashboardTotalGeral,
    DashboardPorTipo,
    DashboardPorPosto,
    DashboardPorAtendente,
    DashboardPorDia,
    DashboardPorHora,
)

# Importando as views antigas de usuários (caso ainda esteja usando o users_views.py)
from .users_views import UsuariosListCreate, UsuarioUpdateDelete

from django.urls import path
from .views import (
    LoginView, 
    TrocarSenhaPrimeiroAcessoView, 
    GerenciarUsuariosView,
    ListarPostosView,          
    TransferirPostoView,
    RegistrarAtendimentoView,
    ListarRegistros,
    DetalheRegistro,
    DashboardStatsView,  # <--- ADICIONE ESTA LINHA AQUI
    AtualizarPermissoesView,
    UserProfileView
)

urlpatterns = [
    # ... as outras rotas que já tem ...
    path('api/dashboard-stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
]



urlpatterns = [
    # ==========================================
    # AUTENTICAÇÃO E ACESSO
    # ==========================================
    path('login/', LoginView.as_view(), name='login'),
    path('primeiro-acesso/', TrocarSenhaPrimeiroAcessoView.as_view(), name='primeiro_acesso'),

    # ==========================================
    # GESTÃO DE USUÁRIOS E POSTOS (GERENTE/SUPERVISOR)
    # ==========================================
    path('usuarios/', GerenciarUsuariosView.as_view(), name='gerenciar_usuarios'),
    path('usuarios/transferir/', TransferirPostoView.as_view(), name='transferir_posto'),
    path('postos/', ListarPostosView.as_view(), name='listar_postos'),
    
    # Rotas legadas de usuários (mantidas por segurança)
    path("usuarios/", UsuariosListCreate.as_view()),
    path("usuarios/<int:pk>/", UsuarioUpdateDelete.as_view()),

    # ==========================================
    # ATENDIMENTOS E REGISTROS (FORMULÁRIOS)
    # ==========================================
    path('registrar/', RegistrarAtendimentoView.as_view(), name='registrar_atendimento'),
    path('registros/', ListarRegistros.as_view()),
    path("registros/<int:pk>/", DetalheRegistro.as_view()),

    # ==========================================
    # DASHBOARDS
    # ==========================================
    path("dashboard/total-geral/", DashboardTotalGeral.as_view()),
    path("dashboard/tipo/", DashboardPorTipo.as_view()),
    path("dashboard/posto/", DashboardPorPosto.as_view()),
    path("dashboard/atendente/", DashboardPorAtendente.as_view()),
    path("dashboard/dia/", DashboardPorDia.as_view()),
    path("dashboard/hora/", DashboardPorHora.as_view()),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('permissoes/', AtualizarPermissoesView.as_view(), name='atualizar_permissoes'),
    path('perfil/', UserProfileView.as_view(), name='user_profile'),
]