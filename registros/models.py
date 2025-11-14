from django.db import models

class TiposCartao(models.Model):
    iss_id = models.CharField(max_length=2)
    cd_id = models.CharField(max_length=2)
    prefixo = models.CharField(max_length=5, unique=True)
    nome_tipo = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.prefixo} - {self.nome_tipo}"


class Registro(models.Model):
    data_hora_envio = models.DateTimeField(auto_now_add=True)
    login_atendente = models.CharField(max_length=50)
    id_local_posto = models.IntegerField()
    tipo_atendimento = models.CharField(max_length=30)

    def __str__(self):
        return f"{self.id} - {self.tipo_atendimento}"


class RegistroEmissao(models.Model):
    registro = models.OneToOneField(Registro, on_delete=models.CASCADE, primary_key=True)
    numero_cartao = models.CharField(max_length=20)
    tipo_cartao = models.CharField(max_length=50)
    via_cartao = models.CharField(max_length=20, default='1ª VIA')


class RegistroBiometria(models.Model):
    registro = models.OneToOneField(Registro, on_delete=models.CASCADE, primary_key=True)
    descricao = models.TextField(null=True, blank=True)
    tipo_cartao = models.CharField(max_length=50)
    tipo_biometria = models.CharField(max_length=40)
    cpf = models.CharField(max_length=11)
    numero_cartao = models.CharField(max_length=20)


class RegistroInformacao(models.Model):
    registro = models.OneToOneField(Registro, on_delete=models.CASCADE, primary_key=True)
    tipo_informacao = models.CharField(max_length=50)


class RegistroServico(models.Model):
    registro = models.OneToOneField(Registro, on_delete=models.CASCADE, primary_key=True)
    tipo_servico = models.CharField(max_length=50)
