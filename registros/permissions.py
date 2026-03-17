from rest_framework.permissions import BasePermission

def _get_user_role(user):
    groups = user.groups.all()
    if groups.exists():
        return groups[0].name.upper()
    return "ATENDENTE"


class IsAdmin(BasePermission):
    """
    Permite acesso apenas a usuários com grupo 'ADMIN' ou superusuário.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # superusuário sempre pode
        if user.is_superuser:
            return True

        role = _get_user_role(user)
        return role == "ADMIN"


class IsSupervisorOrAdmin(BasePermission):
    """
    Permite acesso a 'SUPERVISOR' ou 'ADMIN' ou superusuário.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # superusuário sempre pode
        if user.is_superuser:
            return True

        role = _get_user_role(user)
        return role in ["SUPERVISOR", "ADMIN"]
