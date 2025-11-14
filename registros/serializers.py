from rest_framework import serializers
from .models import (
    Registro,
    RegistroEmissao,
    RegistroBiometria,
    RegistroInformacao,
    RegistroServico
)

class RegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registro
        fields = '__all__'

class EmissaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroEmissao
        fields = '__all__'

class BiometriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroBiometria
        fields = '__all__'

class InformacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroInformacao
        fields = '__all__'

class ServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroServico
        fields = '__all__'

class RegistroListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registro
        fields = [
            'id',
            'data_hora_envio',
            'login_atendente',
            'id_local_posto',
            'tipo_atendimento'
        ]
