from rest_framework.pagination import PageNumberPagination
from math import ceil

class RegistroPagination(PageNumberPagination):
    page_size = 10                 # registros por página
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        response = super().get_paginated_response(data)
        # adiciona total_pages no JSON
        total = self.page.paginator.count
        page_size = self.get_page_size(self.request) or self.page_size
        total_pages = ceil(total / page_size)

        response.data['total_pages'] = total_pages
        response.data['page'] = self.page.number
        response.data['page_size'] = page_size
        return response
