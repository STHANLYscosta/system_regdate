from rest_framework import serializers
from .models import (
    Usuario, Posto, HistoricoLotacao,
    Registro, RegistroEmissao, RegistroServico, RegistroInformacao
)

class PostoSerializer(serializers.ModelSerializer):
    qtd_pessoas_ativas = serializers.SerializerMethodField()
    nome_responsavel = serializers.SerializerMethodField()

    class Meta:
        model = Posto
        fields = '__all__'

    def get_qtd_pessoas_ativas(self, obj):
        return obj.historicolotacao_set.filter(status_lotacao='A').count()
        
    def get_nome_responsavel(self, obj):
        return obj.responsavel.nome_completo or obj.responsavel.username if obj.responsavel else None

class UsuarioSerializer(serializers.ModelSerializer):
    posto_atual = serializers.SerializerMethodField()
    posto_atual_id = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'nome_completo', 'cpf', 'matricula', 'nivel_acesso', 'is_active', 'posto_atual', 'posto_atual_id', 'foto_perfil', 'foto_capa']

    def get_posto_atual(self, obj):
        lotacao = obj.historico_lotacao.filter(status_lotacao='A').first()
        return lotacao.posto.nome_posto if lotacao and lotacao.posto else None

    def get_posto_atual_id(self, obj):
        lotacao = obj.historico_lotacao.filter(status_lotacao='A').first()
        return lotacao.posto.id if lotacao and lotacao.posto else None

# Serializador básico para o histórico de formulários
class RegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registro
        fields = '__all__'