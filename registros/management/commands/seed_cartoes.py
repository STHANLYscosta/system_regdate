from django.core.management.base import BaseCommand
from registros.models import TiposCartao

class Command(BaseCommand):
    help = 'Popula a tabela TiposCartao com os prefixos do sistema'

    def handle(self, *args, **kwargs):

        dados = [
            ('58','01','OPERACIONAL'),
            ('58','02','ESPECIAL'),
            ('58','03','ESCOLAR'),
            ('58','04','VALE TRANSPORTE'),
            ('58','05','SENIOR'),
            ('58','06','COMUM'),
            ('58','07','FUNC SISTEMA'),
            ('58','08','FISCAL TP'),
            ('58','09','CONS TUTELAR'),
            ('58','10','POLICIA CIVIL'),
            ('58','11','ESP CADEIRANTE'),
            ('58','12','IMMU'),
            ('58','13','SINETRAM'),
            ('58','14','STTRM'),
            ('58','15','FUNC INTEGRACAO'),
            ('58','16','F. TEMP GARAGEM'),
            ('58','17','INSS - EMPRESAS'),
            ('58','18','FUNC TEMP'),
            ('58','19','ESPECIAL (NC)'),
            ('58','20','ESP C/AC (NC)'),
            ('58','21','FUNC IBGE'),
            ('58','22','MANUTENCAO'),
            ('58','23','TERCEIRIZADO'),
            ('58','24','ESP C/AC'),
        ]

        for iss, cd, nome in dados:
            prefixo = f"{iss}.{cd}"
            TiposCartao.objects.get_or_create(
                iss_id=iss,
                cd_id=cd,
                prefixo=prefixo,
                nome_tipo=nome
            )

        self.stdout.write(self.style.SUCCESS("Tabela TiposCartao populada com sucesso!"))
