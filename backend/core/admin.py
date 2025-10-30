from django.contrib import admin
from .models import Treinamento, Turma, Recurso, Aluno, Matricula

@admin.register(Treinamento)
class TreinamentoAdmin(admin.ModelAdmin):
    list_display = ['nome', 'created_at', 'updated_at']
    search_fields = ['nome']
    list_filter = ['created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']

@admin.register(Turma)
class TurmaAdmin(admin.ModelAdmin):
    list_display = ['nome', 'treinamento', 'data_inicio', 'data_conclusao', 'link_acesso']
    search_fields = ['nome', 'treinamento__nome']
    list_filter = ['data_inicio', 'treinamento']
    readonly_fields = ['id', 'created_at', 'updated_at']

@admin.register(Recurso)
class RecursoAdmin(admin.ModelAdmin):
    list_display = ['nome_recurso', 'turma', 'tipo_recurso', 'acesso_previo', 'draft']
    search_fields = ['nome_recurso', 'turma__nome']
    list_filter = ['tipo_recurso', 'acesso_previo', 'draft', 'created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']

@admin.register(Aluno)
class AlunoAdmin(admin.ModelAdmin):
    list_display = ['nome', 'email', 'telefone', 'created_at']
    search_fields = ['nome', 'email']
    list_filter = ['created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']

@admin.register(Matricula)
class MatriculaAdmin(admin.ModelAdmin):
    list_display = ['aluno', 'turma', 'data_matricula']
    search_fields = ['aluno__nome', 'turma__nome']
    list_filter = ['data_matricula', 'turma__treinamento']
    readonly_fields = ['id', 'created_at', 'updated_at']
