from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User, Group
from rest_framework import status
from .permissions import IsAdmin
from .serializers import UsuarioSerializer


class UsuariosListCreate(APIView):
    """
    Lista usuários e cria novos.
    Apenas ADMIN pode usar.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        usuarios = User.objects.all().order_by('username')
        data = UsuarioSerializer(usuarios, many=True).data
        return Response(data)

    def post(self, request):
        username = request.data.get("username")
        first_name = request.data.get("first_name", "")
        password = request.data.get("password")
        role = request.data.get("role", "ATENDENTE")

        if User.objects.filter(username=username).exists():
            return Response({"detail": "Usuário já existe"}, status=400)

        user = User.objects.create_user(
            username=username,
            first_name=first_name,
            password=password
        )

        # Define o grupo (role)
        group, _ = Group.objects.get_or_create(name=role)
        user.groups.add(group)

        return Response(UsuarioSerializer(user).data, status=201)


class UsuarioUpdateDelete(APIView):
    """
    Atualiza ou deleta usuário específico.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "Usuário não encontrado"}, status=404)

        first_name = request.data.get("first_name", user.first_name)
        password = request.data.get("password", None)
        role = request.data.get("role", None)
        ativo = request.data.get("is_active", None)

        user.first_name = first_name

        if password:
            user.set_password(password)

        # altera o grupo (role)
        if role:
            user.groups.clear()
            group, _ = Group.objects.get_or_create(name=role)
            user.groups.add(group)

        if ativo is not None:
            user.is_active = ativo

        user.save()

        return Response(UsuarioSerializer(user).data)

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "Usuário não encontrado"}, status=404)

        user.delete()

        return Response({"detail": "Usuário removido"})
