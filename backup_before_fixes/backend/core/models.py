from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
import uuid
import os

def upload_to(instance, filename):
    """Generate upload path for files"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('recursos', filename)

class Treinamento(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(max_length=200, verbose_name="Nome")
    descricao = models.TextField(blank=True, null=True, verbose_name="Descrição")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Treinamento"
        verbose_name_plural = "Treinamentos"
        ordering = ['-created_at']

    def __str__(self):
        return self.nome

class Turma(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    treinamento = models.ForeignKey(Treinamento, on_delete=models.CASCADE, related_name='turmas')
    nome = models.CharField(max_length=200, verbose_name="Nome")
    data_inicio = models.DateField(verbose_name="Data de Início")
    data_conclusao = models.DateField(verbose_name="Data de Conclusão")
    link_acesso = models.URLField(blank=True, null=True, verbose_name="Link de Acesso")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Turma"
        verbose_name_plural = "Turmas"
        ordering = ['-data_inicio']

    def __str__(self):
        return f"{self.nome} - {self.treinamento.nome}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.data_inicio and self.data_conclusao and self.data_inicio >= self.data_conclusao:
            raise ValidationError("A data de início deve ser anterior à data de conclusão.")

class Recurso(models.Model):
    TIPO_CHOICES = [
        ('video', 'Vídeo'),
        ('arquivo_pdf', 'Arquivo PDF'),
        ('arquivo_zip', 'Arquivo ZIP'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Recurso pode estar vinculado a uma turma específica OU ao treinamento geral
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name='recursos', blank=True, null=True)
    treinamento = models.ForeignKey(Treinamento, on_delete=models.CASCADE, related_name='recursos', blank=True, null=True)
    tipo_recurso = models.CharField(max_length=20, choices=TIPO_CHOICES, verbose_name="Tipo do Recurso")
    acesso_previo = models.BooleanField(default=False, verbose_name="Acesso Prévio")
    draft = models.BooleanField(default=True, verbose_name="Rascunho")
    nome_recurso = models.CharField(max_length=200, verbose_name="Nome do Recurso")
    descricao_recurso = models.TextField(blank=True, null=True, verbose_name="Descrição do Recurso")
    arquivo = models.FileField(
        upload_to=upload_to,
        validators=[FileExtensionValidator(allowed_extensions=['mp4', 'avi', 'mov', 'pdf', 'zip'])],
        verbose_name="Arquivo"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Recurso"
        verbose_name_plural = "Recursos"
        ordering = ['-created_at']

    def __str__(self):
        if self.turma:
            return f"{self.nome_recurso} - {self.turma.nome}"
        elif self.treinamento:
            return f"{self.nome_recurso} - {self.treinamento.nome}"
        else:
            return self.nome_recurso

    def clean(self):
        from django.core.exceptions import ValidationError
        from django.utils import timezone
        
        # Validação: Recurso deve estar vinculado a turma OU treinamento, mas não ambos
        if self.turma and self.treinamento:
            raise ValidationError({
                'turma': 'Um recurso não pode estar vinculado a uma turma e um treinamento simultaneamente.',
                'treinamento': 'Um recurso não pode estar vinculado a uma turma e um treinamento simultaneamente.'
            })
        
        # Validação: Recurso deve estar vinculado a pelo menos uma entidade
        if not self.turma and not self.treinamento:
            raise ValidationError({
                'turma': 'Um recurso deve estar vinculado a uma turma ou a um treinamento.',
                'treinamento': 'Um recurso deve estar vinculado a uma turma ou a um treinamento.'
            })
        
        # Validação: Um recurso não pode ter acesso_previo=True e draft=True simultaneamente
        if self.acesso_previo and self.draft:
            raise ValidationError({
                'acesso_previo': 'Um recurso não pode ter "Acesso Prévio" e estar em "Rascunho" ao mesmo tempo.',
                'draft': 'Um recurso não pode ter "Acesso Prévio" e estar em "Rascunho" ao mesmo tempo.'
            })
        
        # Validação: Se a turma já iniciou, recursos com acesso_previo=True devem ser finalizados (draft=False)
        if self.turma and self.turma.data_inicio:
            hoje = timezone.now().date()
            turma_iniciada = hoje >= self.turma.data_inicio
            
            if turma_iniciada and self.acesso_previo and self.draft:
                raise ValidationError({
                    'draft': f'A turma "{self.turma.nome}" já iniciou. Recursos com "Acesso Prévio" devem estar finalizados (não podem estar em rascunho).'
                })
        
        # Validações de tipo de arquivo
        if self.tipo_recurso == 'video' and self.arquivo:
            if not self.arquivo.name.lower().endswith(('.mp4', '.avi', '.mov')):
                raise ValidationError("Para tipo vídeo, apenas arquivos MP4, AVI ou MOV são permitidos.")
        elif self.tipo_recurso == 'arquivo_pdf' and self.arquivo:
            if not self.arquivo.name.lower().endswith('.pdf'):
                raise ValidationError("Para tipo PDF, apenas arquivos PDF são permitidos.")
        elif self.tipo_recurso == 'arquivo_zip' and self.arquivo:
            if not self.arquivo.name.lower().endswith('.zip'):
                raise ValidationError("Para tipo ZIP, apenas arquivos ZIP são permitidos.")

class Aluno(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='aluno_profile')
    nome = models.CharField(max_length=200, verbose_name="Nome")
    email = models.EmailField(unique=True, verbose_name="Email")
    telefone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Telefone")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Aluno"
        verbose_name_plural = "Alunos"
        ordering = ['nome']

    def __str__(self):
        return self.nome

    def save(self, *args, **kwargs):
        # Sync email with User model
        if self.user:
            self.user.email = self.email
            self.user.save()
        super().save(*args, **kwargs)

class Matricula(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name='matriculas')
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE, related_name='matriculas')
    data_matricula = models.DateTimeField(auto_now_add=True, verbose_name="Data da Matrícula")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Matrícula"
        verbose_name_plural = "Matrículas"
        unique_together = ['turma', 'aluno']
        ordering = ['-data_matricula']

    def __str__(self):
        return f"{self.aluno.nome} - {self.turma.nome}"
