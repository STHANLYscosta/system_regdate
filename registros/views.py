from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import *
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from .models import Registro
from .serializers import RegistroListSerializer
# ------------------------------------
# LOGIN SIMPLES
# ------------------------------------
class LoginView(APIView):
    def post(self, request):
        login = request.data.get('login')
        senha = request.data.get('senha')

        user = authenticate(username=login, password=senha)

        if not user:
            return Response({"erro": "Credenciais inválidas"}, status=401)

        return Response({"mensagem": "Login OK"}, status=200)


# ------------------------------------
# API PRINCIPAL: /registrar/
# ------------------------------------
class RegistrarAtendimento(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tipo = request.data.get("tipo_atendimento")

        # login_atendente vem do usuário logado (request.user)
        login_atendente = request.user.username  

        registro = Registro.objects.create(
            login_atendente=login_atendente,
            id_local_posto=request.data.get("id_local_posto"),
            tipo_atendimento=tipo
        )

        # 🔹 EMISSAO
        if tipo == "EMISSAO":
            numero = request.data.get("numero_cartao")
            prefixo = numero[0:2] + "." + numero[2:4]
            tipo_cartao = TiposCartao.objects.filter(prefixo=prefixo).first()
            RegistroEmissao.objects.create(
                registro=registro,
                numero_cartao=numero,
                tipo_cartao=tipo_cartao.nome_tipo if tipo_cartao else "NÃO IDENTIFICADO"
            )

        # 🔹 BIOMETRIA
        if tipo == "BIOMETRIA":
            numero = request.data.get("numero_cartao")
            prefixo = numero[0:2] + "." + numero[2:4]
            tipo_cartao = TiposCartao.objects.filter(prefixo=prefixo).first()
            RegistroBiometria.objects.create(
                registro=registro,
                descricao=request.data.get("descricao"),
                tipo_biometria=request.data.get("tipo_biometria"),
                cpf=request.data.get("cpf"),
                numero_cartao=numero,
                tipo_cartao=tipo_cartao.nome_tipo if tipo_cartao else "NÃO IDENTIFICADO"
            )

        # 🔹 INFORMACAO
        if tipo == "INFORMACAO":
            RegistroInformacao.objects.create(
                registro=registro,
                tipo_informacao=request.data.get("tipo_informacao")
            )

        # 🔹 SERVICO
        if tipo == "SERVICO":
            RegistroServico.objects.create(
                registro=registro,
                tipo_servico=request.data.get("tipo_servico")
            )

        return Response({"status": "OK", "id_registro": registro.id}, status=201)

class ListarRegistros(ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Registro.objects.all().order_by('-data_hora_envio')
    serializer_class = RegistroListSerializer