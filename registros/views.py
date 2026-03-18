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
        return Response(UsuarioSerializer(usuarios, many=True, context={'request': request}).data)

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

    def put(self, request):
        if request.user.nivel_acesso != 'GERENTE':
            return Response({"erro": "Apenas Gerentes podem editar usuários."}, status=status.HTTP_403_FORBIDDEN)

        dados = request.data
        usuario_id = dados.get('id')
        if not usuario_id:
            return Response({"erro": "ID do usuário não fornecido."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            usuario = Usuario.objects.get(id=usuario_id)
            with transaction.atomic():
                alteracoes = []

                def registrar_alt(campo, valor_antigo, valor_novo):
                    if str(valor_antigo) != str(valor_novo):
                        alteracoes.append(f"{campo}: {valor_novo}")

                # Atualizando dados do usuário
                if 'nome_completo' in dados: 
                    registrar_alt('Nome', usuario.nome_completo, dados['nome_completo'])
                    usuario.nome_completo = dados.get('nome_completo')
                if 'login' in dados: 
                    registrar_alt('Login', usuario.username, dados['login'])
                    usuario.username = dados.get('login')
                if 'cpf' in dados: 
                    registrar_alt('CPF', usuario.cpf, dados['cpf'])
                    usuario.cpf = dados.get('cpf')
                if 'matricula' in dados: 
                    registrar_alt('Matrícula', usuario.matricula, dados['matricula'])
                    usuario.matricula = dados.get('matricula')
                if 'nivel_acesso' in dados: 
                    registrar_alt('Acesso', usuario.nivel_acesso, dados['nivel_acesso'])
                    usuario.nivel_acesso = dados.get('nivel_acesso')
                if 'is_active' in dados:
                    novo_status = str(dados['is_active']).lower() in ['true', '1', 't']
                    registrar_alt('Ativo', usuario.is_active, novo_status)
                    usuario.is_active = novo_status
                
                # Permite forçar o reset da senha de volta para o CPF (opcionalidade útil pro gestor)
                if dados.get('resetar_senha') and 'cpf' in dados:
                    usuario.set_password(dados.get('cpf'))
                    usuario.primeiro_acesso = True
                    alteracoes.append("Senha Resetada")

                usuario.save()

                # Se mandar o posto_id junto da edição, verificar se precisa alterar lotação
                posto_id = dados.get('posto_id')
                if posto_id:
                    lotacao_atual = usuario.historico_lotacao.filter(status_lotacao='A').first()
                    if not lotacao_atual or lotacao_atual.posto.id != int(posto_id):
                        if lotacao_atual:
                            lotacao_atual.status_lotacao = 'I'
                            lotacao_atual.data_saida = timezone.now()
                            lotacao_atual.save()
                        HistoricoLotacao.objects.create(
                            usuario=usuario, posto_id=posto_id, status_lotacao='A', alocado_por=request.user
                        )
                        novo_posto_nome = Posto.objects.filter(id=posto_id).values_list('nome_posto', flat=True).first()
                        alteracoes.append(f"Posto: {novo_posto_nome}")

                if alteracoes:
                    from .models import LogAlteracaoUsuario
                    LogAlteracaoUsuario.objects.create(
                        quem_alterou=request.user,
                        usuario_afetado=usuario,
                        descricao="Atualizou: " + ", ".join(alteracoes)
                    )

            return Response({"mensagem": "Usuário atualizado com sucesso!"}, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            return Response({"erro": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ListarPostosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        postos = Posto.objects.all().order_by('nome_posto')
        return Response(PostoSerializer(postos, many=True).data)

    def post(self, request):
        if request.user.nivel_acesso not in ['GERENTE', 'SUPERVISOR']:
            return Response({"erro": "Apenas Gerentes ou Supervisores podem cadastrar novos postos."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = PostoSerializer(data=request.data)
        if serializer.is_valid():
            # Extract specific fields we manually want to enforce or get from the frontend request
            responsavel_id = request.data.get('responsavel_id')
            if responsavel_id:
                try:
                    responsavel = Usuario.objects.get(id=responsavel_id)
                    serializer.save(criado_por=request.user, atualizado_por=request.user, responsavel=responsavel)
                except Usuario.DoesNotExist:
                    return Response({"erro": "Usuário Responsável não encontrado."}, status=status.HTTP_404_NOT_FOUND)
            else:
                serializer.save(criado_por=request.user, atualizado_por=request.user)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        if request.user.nivel_acesso not in ['GERENTE', 'SUPERVISOR']:
            return Response({"erro": "Apenas Gerentes ou Supervisores podem alterar postos."}, status=status.HTTP_403_FORBIDDEN)
        
        posto_id = request.data.get('id')
        if not posto_id:
            return Response({"erro": "ID do posto não fornecido."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            posto = Posto.objects.get(id=posto_id)
            # Prevent non-managers from editing Virtual/Fixed core things if needed, but for now allow Supervisor+
            
            serializer = PostoSerializer(posto, data=request.data, partial=True)
            if serializer.is_valid():
                responsavel_id = request.data.get('responsavel_id')
                if responsavel_id:
                    try:
                        responsavel = Usuario.objects.get(id=responsavel_id)
                        serializer.save(atualizado_por=request.user, responsavel=responsavel)
                    except Usuario.DoesNotExist:
                        return Response({"erro": "Usuário Responsável não encontrado."}, status=status.HTTP_404_NOT_FOUND)
                else:
                    serializer.save(atualizado_por=request.user)
                    
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Posto.DoesNotExist:
            return Response({"erro": "Posto não encontrado."}, status=status.HTTP_404_NOT_FOUND)

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
                        tipo_cartao=dados.get("tipo_cartao"), 
                        cartao_impresso=dados.get("cartao_impresso", False),
                        via=dados.get("via", "1ª"),
                        observacao=dados.get("observacao")
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
        from django.db.models import Count, Q
        from django.db.models.functions import ExtractHour, TruncDate
        
        filtros = Q()
        
        data_inicio = request.GET.get('data_inicio')
        data_fim = request.GET.get('data_fim')
        postos = request.GET.get('postos')
        tipos = request.GET.get('tipos')
        atendentes = request.GET.get('atendentes')

        if data_inicio:
            filtros &= Q(data_hora_envio__date__gte=data_inicio)
        if data_fim:
            filtros &= Q(data_hora_envio__date__lte=data_fim)
        if postos:
            ids = [pid for pid in postos.split(',') if pid.strip()]
            if ids: filtros &= Q(posto_id__in=ids)
        if tipos:
            tps = [t for t in tipos.split(',') if t.strip()]
            if tps: filtros &= Q(tipo_atendimento__in=tps)
        if atendentes:
            atds = [aid for aid in atendentes.split(',') if aid.strip()]
            if atds: filtros &= Q(atendente_id__in=atds)

        qs = Registro.objects.filter(filtros)
        
        total_periodo = qs.count()
        stats_geral = qs.values('tipo_atendimento').annotate(total=Count('id'))
        por_hora = qs.annotate(hora=ExtractHour('data_hora_envio')).values('hora').annotate(total=Count('id')).order_by('hora')
        por_dia = qs.annotate(dia=TruncDate('data_hora_envio')).values('dia').annotate(total=Count('id')).order_by('dia')

        ranking_postos = qs.values('posto__nome_posto').annotate(
            total=Count('id'),
            emissao=Count('id', filter=Q(tipo_atendimento='EMISSAO')),
            servico=Count('id', filter=Q(tipo_atendimento='SERVICO')),
            informacao=Count('id', filter=Q(tipo_atendimento='INFORMACAO'))
        ).order_by('-total')[:10]

        ranking_atendentes = qs.values('atendente__nome_completo').annotate(
            total=Count('id'),
            emissao=Count('id', filter=Q(tipo_atendimento='EMISSAO')),
            servico=Count('id', filter=Q(tipo_atendimento='SERVICO')),
            informacao=Count('id', filter=Q(tipo_atendimento='INFORMACAO'))
        ).order_by('-total')[:10]

        return Response({
            "total_periodo": total_periodo,
            "geral": stats_geral,
            "por_hora": list(por_hora),
            "por_dia": list(por_dia),
            "ranking_postos": list(ranking_postos),
            "ranking_atendentes": list(ranking_atendentes)
        })# ==========================================
# 4. GESTÃO DE PERMISSÕES (GERENTE)
# ==========================================
class AtualizarPermissoesView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        if request.user.nivel_acesso != 'GERENTE':
            return Response({"erro": "Apenas Gerentes podem alterar permissões."}, status=status.HTTP_403_FORBIDDEN)
        
        usuarios_data = request.data.get('usuarios', [])
        if not isinstance(usuarios_data, list):
            return Response({"erro": "Formato inválido. Esperado 'usuarios' como lista."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                for item in usuarios_data:
                    user_id = item.get('id')
                    novo_nivel = item.get('nivel_acesso')
                    # Valida se o nível existe
                    niveis_validos = [n[0] for n in Usuario.NIVEIS_ACESSO]
                    if user_id and novo_nivel in niveis_validos:
                        # Exclui o próprio usuário logado caso ele tente rebaixar a si mesmo (opcional, mas recomendado)
                        if user_id != request.user.id:
                            Usuario.objects.filter(id=user_id).update(nivel_acesso=novo_nivel)
            return Response({"mensagem": "Permissões atualizadas com sucesso!"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_400_BAD_REQUEST)
# ==========================================
# 5. PERFIL DO USUÁRIO
# ==========================================
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Pega a lotação ativa
        lotacao_ativa = user.historico_lotacao.filter(status_lotacao='A').first()
        posto_atual = lotacao_ativa.posto.nome_posto if lotacao_ativa and lotacao_ativa.posto else "Nenhum posto vinculado"
        
        # Conta o total de atendimentos realizados por este usuário
        total_atendimentos = Registro.objects.filter(atendente=user).count()

        return Response({
            "id": user.id,
            "nome_completo": user.nome_completo,
            "cpf": user.cpf,
            "username": user.username,
            "nivel_acesso": user.nivel_acesso,
            "posto_atual": posto_atual,
            "total_atendimentos": total_atendimentos,
            "data_criacao": user.date_joined.strftime("%d/%m/%Y"),
            "foto_perfil": request.build_absolute_uri(user.foto_perfil.url) if user.foto_perfil else None,
            "foto_capa": request.build_absolute_uri(user.foto_capa.url) if user.foto_capa else None
        }, status=status.HTTP_200_OK)

    def put(self, request):
        user = request.user
        if 'foto_perfil' in request.FILES:
            user.foto_perfil = request.FILES['foto_perfil']
        if 'foto_capa' in request.FILES:
            user.foto_capa = request.FILES['foto_capa']
        user.save()
        
        return Response({
            "mensagem": "Fotos atualizadas",
            "foto_perfil": request.build_absolute_uri(user.foto_perfil.url) if user.foto_perfil else None,
            "foto_capa": request.build_absolute_uri(user.foto_capa.url) if user.foto_capa else None
        }, status=status.HTTP_200_OK)

