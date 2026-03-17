from django.db import models
from django.contrib.auth.models import AbstractUser

# ==========================================
# 1. MODELOS DE USUÁRIO E ACESSO
# ==========================================

class Usuario(AbstractUser):
    NIVEIS_ACESSO = [
        ('ATENDENTE', 'Atendente'),
        ('ATENDENTE_II', 'Atendente II'),
        ('SUPERVISOR', 'Supervisor'),
        ('GERENTE', 'Gerente'),
    ]
    
    nome_completo = models.CharField(max_length=150)
    cpf = models.CharField(max_length=11, unique=True)
    matricula = models.CharField(max_length=20, unique=True, null=True, blank=True)
    data_nascimento = models.DateField(null=True, blank=True)
    nome_mae = models.CharField(max_length=150, null=True, blank=True)
    
    nivel_acesso = models.CharField(max_length=20, choices=NIVEIS_ACESSO, default='ATENDENTE')
    primeiro_acesso = models.BooleanField(default=True)
    
    # O AbstractUser já traz: username (que será o login), password, is_active (para Status A/I), date_joined (data_criacao)
    
    def __str__(self):
        return f"{self.username} - {self.nivel_acesso}"


class RegistroAcesso(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)
    login_tentado = models.CharField(max_length=50)
    ip_maquina = models.GenericIPAddressField(null=True, blank=True)
    data_hora = models.DateTimeField(auto_now_add=True)
    status_sucesso = models.BooleanField(default=False)
    mensagem_falha = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        status = "SUCESSO" if self.status_sucesso else "FALHA"
        return f"{self.data_hora} - {self.login_tentado} - {status}"


# ==========================================
# 2. MODELOS DE POSTO E LOTAÇÃO
# ==========================================

class Posto(models.Model):
    nome_posto = models.CharField(max_length=100)
    endereco = models.TextField(null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    responsavel = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='postos_gerenciados')
    status = models.CharField(max_length=1, choices=[('A', 'Ativo'), ('I', 'Inativo')], default='A')
    criado_em = models.DateTimeField(auto_now_add=True)
    criado_por = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='postos_criados')

    def __str__(self):
        return self.nome_posto


class HistoricoLotacao(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='historico_lotacao')
    posto = models.ForeignKey(Posto, on_delete=models.CASCADE)
    data_entrada = models.DateTimeField(auto_now_add=True)
    data_saida = models.DateTimeField(null=True, blank=True)
    status_lotacao = models.CharField(max_length=1, choices=[('A', 'Ativo'), ('I', 'Inativo')], default='A')
    alocado_por = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='alocacoes_feitas')

    class Meta:
        # REGRA DE NEGÓCIO: O PostgreSQL garante que um usuário só tenha UMA lotação "Ativa" (A) por vez
        constraints = [
            models.UniqueConstraint(
                fields=['usuario'],
                condition=models.Q(status_lotacao='A'),
                name='unique_active_lotacao_per_user'
            )
        ]


# ==========================================
# 3. MODELOS DE ATENDIMENTO (ATUALIZADOS)
# ==========================================

class Registro(models.Model):
    TIPO_CHOICES = [
        ('EMISSAO', 'Emissão'),
        ('SERVICO', 'Serviço'),
        ('INFORMACAO', 'Informação'),
    ]
    
    # Controle de Sistema (Automático pelo Backend)
    data_hora_envio = models.DateTimeField(auto_now_add=True)
    atendente = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    posto = models.ForeignKey(Posto, on_delete=models.SET_NULL, null=True)
    tipo_atendimento = models.CharField(max_length=20, choices=TIPO_CHOICES)

    # Dados Comuns a todos os 3 botões
    cpf = models.CharField(max_length=11)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)

    def __str__(self):
        return f"{self.data_hora_envio.strftime('%d/%m/%Y %H:%M')} - {self.tipo_atendimento} - CPF: {self.cpf}"


class RegistroEmissao(models.Model):
    TIPOS_CARTAO_CHOICES = [
        ('VALE TRANSPORTE', 'Vale Transporte'),
        ('COMUM', 'Comum'),
        ('ESCOLAR', 'Escolar'),
        ('ESC GRATUIDADE', 'Escolar Gratuidade'),
        ('PCD', 'PCD'),
        ('FUNC SISTEMA', 'Func. Sistema'),
        ('IMMU', 'IMMU'),
        ('FUNCIONAL', 'Funcional'),
        ('IDOSO', 'Idoso'),
        ('SINETRAM', 'Sinetram'),
        ('P SOCIAL', 'P. Social'),
    ]
    registro = models.OneToOneField(Registro, on_delete=models.CASCADE, primary_key=True)
    nome = models.CharField(max_length=150)
    tipo_cartao = models.CharField(max_length=30, choices=TIPOS_CARTAO_CHOICES)
    observacao = models.CharField(max_length=100, null=True, blank=True)


class RegistroServico(models.Model):
    registro = models.OneToOneField(Registro, on_delete=models.CASCADE, primary_key=True)
    servico_realizado = models.CharField(max_length=200)


class RegistroInformacao(models.Model):
    registro = models.OneToOneField(Registro, on_delete=models.CASCADE, primary_key=True)
    informacao_passada = models.CharField(max_length=200)