from rest_framework import serializers
from .models import (
    Registro,
    RegistroEmissao,
    RegistroBiometria,
    RegistroInformacao,
    RegistroServico
)

# =========================
# SERIALIZER DETALHADO
# =========================
class RegistroDetalhadoSerializer(serializers.ModelSerializer):
    emissao = serializers.SerializerMethodField()
    biometria = serializers.SerializerMethodField()
    informacao = serializers.SerializerMethodField()
    servico = serializers.SerializerMethodField()

    class Meta:
        model = Registro
        fields = [
            'id',
            'data_hora_envio',
            'login_atendente',
            'id_local_posto',
            'tipo_atendimento',
            'emissao',
            'biometria',
            'informacao',
            'servico',
        ]

    # -------- EMISSÃO --------
    def get_emissao(self, obj):
        try:
            r = RegistroEmissao.objects.get(registro=obj)
            return {
                "numero_cartao": r.numero_cartao,
                "tipo_cartao": r.tipo_cartao,
            }
        except RegistroEmissao.DoesNotExist:
            return None

    # -------- BIOMETRIA --------
    def get_biometria(self, obj):
        try:
            r = RegistroBiometria.objects.get(registro=obj)
            return {
                "cpf": r.cpf,
                "numero_cartao": r.numero_cartao,
                "tipo_cartao": r.tipo_cartao,
                "tipo_biometria": r.tipo_biometria,
                "descricao": r.descricao,
            }
        except RegistroBiometria.DoesNotExist:
            return None

    # -------- INFORMAÇÃO --------
    def get_informacao(self, obj):
        try:
            r = RegistroInformacao.objects.get(registro=obj)
            return {
                "tipo_informacao": r.tipo_informacao,
            }
        except RegistroInformacao.DoesNotExist:
            return None

    # -------- SERVIÇO --------
    def get_servico(self, obj):
        try:
            r = RegistroServico.objects.get(registro=obj)
            return {
                "tipo_servico": r.tipo_servico,
            }
        except RegistroServico.DoesNotExist:
            return None

# =========================
# SERIALIZER LISTAGEM SIMPLES
# =========================
class RegistroListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registro
        fields = [
            'id',
            'data_hora_envio',
            'login_atendente',
            'id_local_posto',
            'tipo_atendimento',
        ]
