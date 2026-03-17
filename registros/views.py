from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.db import transaction
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView, RetrieveAPIView
from django.contrib.auth.hashers import make_password

from .models import (
    Usuario, RegistroAcesso, Posto, HistoricoLotacao,
    Registro, RegistroEmissao, RegistroServico, RegistroInformacao
)
from .serializers import UsuarioSerializer, PostoSerializer, RegistroSerializer
from django.db.models import Count
from datetime import date
# ==========================================
# 1. AUTENTICAÇÃO E PRIMEIRO ACESSO
# ==========================================
class LoginView(APIView):
    permission_classes = [] 

    def post(self, request):
        login = request.data.get('login')
        senha = request.data.get('senha')
        
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        ip_maquina = x_forwarded_for.split(',')[0] if x_forwarded_for else request.META.get('REMOTE_ADDR')

        user = authenticate(username=login, password=senha)

        if not user:
            RegistroAcesso.objects.create(
                login_tentado=login, ip_maquina=ip_maquina, 
                status_sucesso=False, mensagem_falha="Credenciais inválidas"
            )
            return Response({"erro": "Credenciais inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

        RegistroAcesso.objects.create(
            usuario=user, login_tentado=login, ip_maquina=ip_maquina, 
            status_sucesso=True, mensagem_falha="OK"
        )

        if user.primeiro_acesso:
            return Response({
                "require_password_change": True,
                "mensagem": "Você deve alterar sua senha no primeiro acesso."
            }, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        lotacao_ativa = user.historico_lotacao.filter(status_lotacao='A').first()
        posto_atual = lotacao_ativa.posto.nome_posto if lotacao_ativa and lotacao_ativa.posto else "Nenhum posto vinculado"

        return Response({
            "token_access": str(refresh.access_token),
            "token_refresh": str(refresh),
            "nivel_acesso": user.nivel_acesso,
            "nome": user.nome_completo or user.username,
            "posto_atual": posto_atual
        }, status=status.HTTP_200_OK)

class TrocarSenhaPrimeiroAcessoView(APIView):
    permission_classes = [] 

    def post(self, request):
        login = request.data.get('login')
        senha_atual = request.data.get('senha_atual') 
        nova_senha = request.data.get('nova_senha')

        user = authenticate(username=login, password=senha_atual)
        if not user: return Response({"erro": "Credenciais inválidas."}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.primeiro_acesso: return Response({"erro": "Troca já realizada."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(nova_senha)
        user.primeiro_acesso = False 
        user.save()
        return Response({"mensagem": "Senha alterada com sucesso!"}, status=status.HTTP_200_OK)

# ==========================================
# 2. GESTÃO DE USUÁRIOS E POSTOS
# ==========================================
class GerenciarUsuariosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.nivel_acesso not in ['GERENTE', 'SUPERVISOR']:
            return Response({"erro": "Acesso negado."}, status=status.HTTP_403_FORBIDDEN)
        
        usuarios = Usuario.objects.all().order_by('nome_completo')
        return Response(UsuarioSerializer(usuarios, many=True).data)

    def post(self, request):
        if request.user.nivel_acesso != 'GERENTE':
            return Response({"erro": "Apenas Gerentes podem criar usuários."}, status=status.HTTP_403_FORBIDDEN)

        dados = request.data
        cpf, login, posto_id = dados.get('cpf'), dados.get('login'), dados.get('posto_id')

        if not cpf or not login: return Response({"erro": "CPF e Login obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                usuario = Usuario.objects.create(
                    username=login, nome_completo=dados.get('nome_completo'), cpf=cpf,
                    matricula=dados.get('matricula'), nivel_acesso=dados.get('nivel_acesso', 'ATENDENTE'),
                    password=make_password(cpf), primeiro_acesso=True
                )
                if posto_id:
                    HistoricoLotacao.objects.create(
                        usuario=usuario, posto_id=posto_id, status_lotacao='A', alocado_por=request.user
                    )
            return Response({"mensagem": "Usuário criado!"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ListarPostosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        postos = Posto.objects.filter(status='A').order_by('nome_posto')
        return Response(PostoSerializer(postos, many=True).data)

    def post(self, request):
        # Apenas Gerente pode cadastrar novos postos
        if request.user.nivel_acesso != 'GERENTE':
            return Response({"erro": "Acesso negado."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = PostoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TransferirPostoView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if request.user.nivel_acesso not in ['GERENTE', 'SUPERVISOR']:
            return Response({"erro": "Acesso negado."}, status=status.HTTP_403_FORBIDDEN)

        usuario_id, novo_posto_id = request.data.get('usuario_id'), request.data.get('novo_posto_id')

        try:
            usuario = Usuario.objects.get(id=usuario_id)
            with transaction.atomic():
                lotacao_atual = usuario.historico_lotacao.filter(status_lotacao='A').first()
                if lotacao_atual:
                    if lotacao_atual.posto.id == novo_posto_id:
                        return Response({"erro": "Já alocado neste posto."}, status=status.HTTP_400_BAD_REQUEST)
                    lotacao_atual.status_lotacao = 'I'
                    lotacao_atual.data_saida = timezone.now()
                    lotacao_atual.save()

                HistoricoLotacao.objects.create(usuario=usuario, posto_id=novo_posto_id, status_lotacao='A', alocado_por=request.user)
            return Response({"mensagem": "Transferido com sucesso!"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# ==========================================
# 3. FORMULÁRIO DE ATENDIMENTO
# ==========================================
class RegistrarAtendimentoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        dados = request.data
        tipo = dados.get("tipo_atendimento")
        
        lotacao_ativa = request.user.historico_lotacao.filter(status_lotacao='A').first()
        if not lotacao_ativa:
            return Response({"erro": "Nenhum posto vinculado."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                registro = Registro.objects.create(
                    atendente=request.user, posto=lotacao_ativa.posto, tipo_atendimento=tipo,
                    cpf=dados.get("cpf"), telefone=dados.get("telefone"), email=dados.get("email")
                )
                if tipo == "EMISSAO":
                    RegistroEmissao.objects.create(
                        registro=registro, nome=dados.get("nome"),
                        tipo_cartao=dados.get("tipo_cartao"), observacao=dados.get("observacao")
                    )
                elif tipo == "SERVICO":
                    RegistroServico.objects.create(registro=registro, servico_realizado=dados.get("servico_realizado"))
                elif tipo == "INFORMACAO":
                    RegistroInformacao.objects.create(registro=registro, informacao_passada=dados.get("informacao_passada"))

            return Response({"mensagem": "Sucesso!", "id_registro": registro.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Listagens básicas antigas
class ListarRegistros(ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Registro.objects.all().order_by('-data_hora_envio')
    serializer_class = RegistroSerializer

class DetalheRegistro(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Registro.objects.all()
    serializer_class = RegistroSerializer


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hoje = date.today()
        
        # Total por tipo (Geral)
        stats_geral = Registro.objects.values('tipo_atendimento').annotate(total=Count('id'))
        
        # Atendimentos de Hoje
        hoje_total = Registro.objects.filter(data_hora_envio__date=hoje).count()
        
        # Ranking de Postos
        ranking_postos = Registro.objects.values('posto__nome_posto').annotate(total=Count('id')).order_by('-total')

        return Response({
            "geral": stats_geral,
            "hoje_total": hoje_total,
            "ranking_postos": ranking_postos
        })


from django.db.models import Count
from datetime import date

# ==========================================
# VIEW PARA OS INDICADORES DO DASHBOARD
# ==========================================
class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        hoje = date.today()
        
        # Total por tipo (Geral)
        stats_geral = Registro.objects.values('tipo_atendimento').annotate(total=Count('id'))
        
        # Atendimentos de Hoje
        hoje_total = Registro.objects.filter(data_hora_envio__date=hoje).count()
        
        # Ranking de Postos
        ranking_postos = Registro.objects.values('posto__nome_posto').annotate(total=Count('id')).order_by('-total')

        return Response({
            "geral": stats_geral,
            "hoje_total": hoje_total,
            "ranking_postos": ranking_postos
        })










