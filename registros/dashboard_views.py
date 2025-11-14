from datetime import datetime
from django.db.models import Count
from django.utils.dateparse import parse_date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Registro


def aplicar_filtros(request, queryset):
    params = request.query_params

    data_ini = params.get("data_ini")
    data_fim = params.get("data_fim")
    posto = params.get("posto")
    atendente = params.get("atendente")
    tipo = params.get("tipo")

    if data_ini:
        dt_ini = parse_date(data_ini)
        if dt_ini:
            queryset = queryset.filter(data_hora_envio__date__gte=dt_ini)

    if data_fim:
        dt_fim = parse_date(data_fim)
        if dt_fim:
            queryset = queryset.filter(data_hora_envio__date__lte=dt_fim)

    if posto:
        queryset = queryset.filter(id_local_posto=posto)

    if atendente:
        queryset = queryset.filter(login_atendente__icontains=atendente)

    if tipo:
        queryset = queryset.filter(tipo_atendimento=tipo)

    return queryset


# ==========================
# KPI GERAL
# ==========================
class DashboardTotalGeral(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = aplicar_filtros(request, Registro.objects.all())

        total = queryset.count()

        return Response({ "total": total })


# ==========================
# ATENDIMENTOS POR TIPO
# ==========================
class DashboardPorTipo(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = aplicar_filtros(request, Registro.objects.all())

        dados = (
            queryset
            .values("tipo_atendimento")
            .annotate(total=Count("id"))
            .order_by("tipo_atendimento")
        )

        return Response(list(dados))


# ==========================
# ATENDIMENTOS POR POSTO
# ==========================
class DashboardPorPosto(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = aplicar_filtros(request, Registro.objects.all())

        dados = (
            queryset
            .values("id_local_posto")
            .annotate(total=Count("id"))
            .order_by("id_local_posto")
        )

        return Response(list(dados))


# ==========================
# ATENDIMENTOS POR ATENDENTE
# ==========================
class DashboardPorAtendente(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = aplicar_filtros(request, Registro.objects.all())

        dados = (
            queryset
            .values("login_atendente")
            .annotate(total=Count("id"))
            .order_by("login_atendente")
        )

        return Response(list(dados))


# ==========================
# ATENDIMENTOS POR DIA
# ==========================
class DashboardPorDia(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = aplicar_filtros(request, Registro.objects.all())

        dados = (
            queryset
            .extra(select={"dia": "date(data_hora_envio)"})
            .values("dia")
            .annotate(total=Count("id"))
            .order_by("dia")
        )

        return Response(list(dados))


# ==========================
# ATENDIMENTOS POR HORA
# ==========================
class DashboardPorHora(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = aplicar_filtros(request, Registro.objects.all())

        dados = (
            queryset
            .extra(select={"hora": "extract(hour from data_hora_envio)"})
            .values("hora")
            .annotate(total=Count("id"))
            .order_by("hora")
        )

        return Response(list(dados))
