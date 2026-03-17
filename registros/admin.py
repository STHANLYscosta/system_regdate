from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Usuario, RegistroAcesso, Posto, HistoricoLotacao,
    Registro, RegistroEmissao, RegistroServico, RegistroInformacao
)

class CustomUserAdmin(UserAdmin):
    model = Usuario
    fieldsets = UserAdmin.fieldsets + (
        ('Informações Corporativas', {
            'fields': ('nome_completo', 'cpf', 'matricula', 'data_nascimento', 'nome_mae', 'nivel_acesso', 'primeiro_acesso')
        }),
    )
    list_display = ['username', 'nome_completo', 'cpf', 'nivel_acesso', 'is_active']
    list_filter = ['nivel_acesso', 'is_active']
    search_fields = ['username', 'nome_completo', 'cpf']

class PostoAdmin(admin.ModelAdmin):
    list_display = ['nome_posto', 'status', 'responsavel']

admin.site.register(Usuario, CustomUserAdmin)
admin.site.register(RegistroAcesso)
admin.site.register(Posto, PostoAdmin)
admin.site.register(HistoricoLotacao)

# Nossos novos modelos de formulário
admin.site.register(Registro)
admin.site.register(RegistroEmissao)
admin.site.register(RegistroServico)
admin.site.register(RegistroInformacao)