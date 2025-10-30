from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TreinamentoViewSet, TurmaViewSet, RecursoViewSet, 
    AlunoViewSet, MatriculaViewSet, AuthViewSet, get_csrf
)

router = DefaultRouter()
router.register(r'treinamentos', TreinamentoViewSet)
router.register(r'turmas', TurmaViewSet)
router.register(r'recursos', RecursoViewSet)
router.register(r'alunos', AlunoViewSet)
router.register(r'matriculas', MatriculaViewSet)
router.register(r'auth', AuthViewSet, basename='auth')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/csrf/', get_csrf),
]