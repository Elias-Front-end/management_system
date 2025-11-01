from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from .models import Treinamento, Turma, Recurso, Aluno, Matricula
from .serializers import (
    UserSerializer, TreinamentoSerializer, TurmaSerializer, 
    RecursoSerializer, AlunoSerializer, MatriculaSerializer,
    RecursoAlunoSerializer, AdminSerializer, AdminPasswordUpdateSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permissão customizada que permite apenas administradores
    modificarem dados, mas permite leitura para usuários autenticados
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_staff


class IsSuperAdminOnly(permissions.BasePermission):
    """
    Permissão customizada para permitir apenas super-administradores.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser


class IsAlunoOwner(permissions.BasePermission):
    """
    Permissão que permite apenas ao aluno acessar seus próprios dados
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Se o usuário é admin, pode acessar tudo
        if request.user.is_staff:
            return True
        
        # Se o objeto tem um campo 'aluno', verifica se é o aluno logado
        if hasattr(obj, 'aluno'):
            return hasattr(request.user, 'aluno_profile') and obj.aluno == request.user.aluno_profile
        
        # Se o objeto é um Aluno, verifica se é o próprio aluno
        if isinstance(obj, Aluno):
            return hasattr(request.user, 'aluno_profile') and obj == request.user.aluno_profile
        
        return False


class AdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar administradores.
    Apenas super-administradores podem acessar.
    """
    serializer_class = AdminSerializer
    permission_classes = [IsSuperAdminOnly]
    
    def get_queryset(self):
        """Retorna apenas usuários que são administradores (is_staff=True)"""
        return User.objects.filter(is_staff=True).order_by('-date_joined')
    
    def get_serializer_class(self):
        """Usar serializer específico para atualização de senha"""
        if self.action == 'update_password':
            return AdminPasswordUpdateSerializer
        return AdminSerializer
    
    def create(self, request, *args, **kwargs):
        """Criar novo administrador"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            admin = serializer.save()
            return Response({
                'message': 'Administrador criado com sucesso',
                'admin': AdminSerializer(admin).data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'error': f'Erro ao criar administrador: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """Atualizar administrador existente"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Não permitir que um admin edite um super-admin se ele não for super-admin
        if instance.is_superuser and not request.user.is_superuser:
            return Response({
                'error': 'Apenas super-administradores podem editar outros super-administradores'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Não permitir que um admin se remova o próprio acesso de super-admin
        if instance == request.user and instance.is_superuser:
            access_level = request.data.get('access_level')
            if access_level == 'admin':
                return Response({
                    'error': 'Você não pode remover seu próprio acesso de super-administrador'
                }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        try:
            admin = serializer.save()
            return Response({
                'message': 'Administrador atualizado com sucesso',
                'admin': AdminSerializer(admin).data
            })
        except Exception as e:
            return Response({
                'error': f'Erro ao atualizar administrador: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """Deletar administrador"""
        instance = self.get_object()
        
        # Não permitir que um admin delete um super-admin se ele não for super-admin
        if instance.is_superuser and not request.user.is_superuser:
            return Response({
                'error': 'Apenas super-administradores podem deletar outros super-administradores'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Não permitir auto-exclusão
        if instance == request.user:
            return Response({
                'error': 'Você não pode deletar sua própria conta'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Verificar se é o último super-admin
        if instance.is_superuser:
            super_admin_count = User.objects.filter(is_superuser=True).count()
            if super_admin_count <= 1:
                return Response({
                    'error': 'Não é possível deletar o último super-administrador do sistema'
                }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            username = instance.username
            instance.delete()
            return Response({
                'message': f'Administrador {username} foi removido com sucesso'
            })
        except Exception as e:
            return Response({
                'error': f'Erro ao deletar administrador: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def update_password(self, request, pk=None):
        """Atualizar senha de um administrador"""
        instance = self.get_object()
        
        # Não permitir que um admin altere senha de super-admin se ele não for super-admin
        if instance.is_superuser and not request.user.is_superuser:
            return Response({
                'error': 'Apenas super-administradores podem alterar senhas de outros super-administradores'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            password = serializer.validated_data['password']
            instance.set_password(password)
            instance.save()
            
            return Response({
                'message': 'Senha atualizada com sucesso'
            })
        except Exception as e:
            return Response({
                'error': f'Erro ao atualizar senha: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estatísticas dos administradores"""
        total_admins = User.objects.filter(is_staff=True).count()
        super_admins = User.objects.filter(is_superuser=True).count()
        regular_admins = total_admins - super_admins
        
        return Response({
            'total_admins': total_admins,
            'super_admins': super_admins,
            'regular_admins': regular_admins
        })


class TreinamentoViewSet(viewsets.ModelViewSet):
    queryset = Treinamento.objects.all()
    serializer_class = TreinamentoSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(nome__icontains=search) | Q(descricao__icontains=search)
            )
        return queryset.order_by('-created_at')

    @action(detail=True, methods=['get'])
    def recursos(self, request, pk=None):
        """Retorna recursos do treinamento (diretos e das turmas)"""
        treinamento = self.get_object()
        
        # Busca recursos diretos do treinamento e recursos das turmas do treinamento
        recursos = Recurso.objects.filter(
            Q(treinamento=treinamento) | Q(turma__treinamento=treinamento)
        ).select_related('turma', 'treinamento')
        
        # Se não é admin, aplica filtros de acesso
        if not request.user.is_staff:
            recursos = recursos.filter(draft=False)
        
        serializer = RecursoSerializer(recursos, many=True, context={'request': request})
        return Response(serializer.data)


class TurmaViewSet(viewsets.ModelViewSet):
    queryset = Turma.objects.select_related('treinamento').all()
    serializer_class = TurmaSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        treinamento_id = self.request.query_params.get('treinamento', None)
        search = self.request.query_params.get('search', None)
        
        if treinamento_id:
            queryset = queryset.filter(treinamento_id=treinamento_id)
        
        if search:
            queryset = queryset.filter(
                Q(nome__icontains=search) | Q(treinamento__nome__icontains=search)
            )
        
        return queryset.order_by('-data_inicio')

    @action(detail=True, methods=['get'])
    def recursos(self, request, pk=None):
        """Retorna recursos da turma"""
        turma = self.get_object()
        recursos = turma.recurso_set.all()
        
        # Se não é admin, aplica filtros de acesso
        if not request.user.is_staff:
            recursos = recursos.filter(draft=False)
            hoje = timezone.now().date()
            recursos = recursos.filter(
                Q(acesso_previo=True) | Q(turma__data_inicio__lte=hoje)
            )
        
        serializer = RecursoSerializer(recursos, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def alunos(self, request, pk=None):
        """Retorna alunos matriculados na turma"""
        turma = self.get_object()
        matriculas = turma.matricula_set.select_related('aluno').all()
        alunos = [matricula.aluno for matricula in matriculas]
        serializer = AlunoSerializer(alunos, many=True)
        return Response(serializer.data)


class RecursoViewSet(viewsets.ModelViewSet):
    queryset = Recurso.objects.select_related('turma', 'turma__treinamento', 'treinamento').all()
    serializer_class = RecursoSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        turma_id = self.request.query_params.get('turma', None)
        treinamento_id = self.request.query_params.get('treinamento', None)
        tipo = self.request.query_params.get('tipo', None)
        search = self.request.query_params.get('search', None)
        
        # Se não é admin, filtra recursos não-draft
        if not self.request.user.is_staff:
            queryset = queryset.filter(draft=False)
        
        if turma_id:
            queryset = queryset.filter(turma_id=turma_id)
        
        if treinamento_id:
            # Filtra recursos que pertencem diretamente ao treinamento
            # ou que pertencem a turmas deste treinamento
            queryset = queryset.filter(
                Q(treinamento_id=treinamento_id) | 
                Q(turma__treinamento_id=treinamento_id)
            )
        
        if tipo:
            queryset = queryset.filter(tipo_recurso=tipo)
        
        if search:
            queryset = queryset.filter(
                Q(nome_recurso__icontains=search) | Q(descricao_recurso__icontains=search)
            )
        
        return queryset.order_by('-created_at')

    def get_serializer_class(self):
        # Se não é admin, usa serializer específico para alunos
        if not self.request.user.is_staff and self.action in ['list', 'retrieve']:
            return RecursoAlunoSerializer
        return RecursoSerializer


class AlunoViewSet(viewsets.ModelViewSet):
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer
    permission_classes = [IsAlunoOwner]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Se não for admin, mostrar apenas o próprio aluno
        if not self.request.user.is_staff:
            if hasattr(self.request.user, 'aluno_profile'):
                queryset = queryset.filter(id=self.request.user.aluno_profile.id)
            else:
                queryset = queryset.none()
        else:
            # Admin pode buscar por nome ou email
            search = self.request.query_params.get('search', None)
            if search:
                queryset = queryset.filter(
                    Q(nome__icontains=search) | Q(email__icontains=search)
                )
        
        return queryset.order_by('nome')

    @action(detail=True, methods=['get'])
    def turmas(self, request, pk=None):
        """Retorna turmas do aluno"""
        aluno = self.get_object()
        
        # Verificar se o usuário pode acessar este aluno
        if not request.user.is_staff and (
            not hasattr(request.user, 'aluno_profile') or 
            request.user.aluno_profile.id != aluno.id
        ):
            return Response(
                {'error': 'Acesso negado'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        matriculas = Matricula.objects.filter(aluno=aluno).select_related('turma__treinamento')
        turmas_data = []
        
        for matricula in matriculas:
            turma = matricula.turma
            turma_data = {
                'id': turma.id,
                'nome': turma.nome,
                'data_inicio': turma.data_inicio,
                'data_conclusao': turma.data_conclusao,
                'link_acesso': turma.link_acesso,
                'treinamento_nome': turma.treinamento.nome,
                'treinamento': {
                    'id': turma.treinamento.id,
                    'nome': turma.treinamento.nome,
                    'descricao': turma.treinamento.descricao
                }
            }
            turmas_data.append(turma_data)
        
        return Response(turmas_data)

    @action(detail=True, methods=['get'])
    def recursos_disponiveis(self, request, pk=None):
        """Retorna recursos disponíveis para o aluno baseado em suas matrículas e regras de negócio"""
        aluno = self.get_object()
        
        # Verificar se o usuário pode acessar este aluno
        if not request.user.is_staff and (
            not hasattr(request.user, 'aluno_profile') or 
            request.user.aluno_profile.id != aluno.id
        ):
            return Response(
                {'error': 'Acesso negado'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Buscar turmas do aluno
        matriculas = Matricula.objects.filter(aluno=aluno).select_related('turma__treinamento')
        turmas_ids = [matricula.turma.id for matricula in matriculas]
        
        # Data atual
        hoje = timezone.now().date()
        
        # Buscar recursos das turmas matriculadas
        recursos = Recurso.objects.filter(
            turma_id__in=turmas_ids
        ).select_related('turma', 'turma__treinamento')
        
        recursos_disponiveis = []
        
        for recurso in recursos:
            turma = recurso.turma
            
            # Regra 1: Recursos em draft nunca são acessíveis para alunos
            if recurso.draft:
                continue
            
            # Regra 2: Antes da data de início da turma
            if turma.data_inicio > hoje:
                # Só pode acessar recursos marcados como "Acesso Prévio"
                if recurso.acesso_previo:
                    recursos_disponiveis.append(recurso)
            else:
                # Regra 3: Após a data de início da turma
                # Pode acessar todos os recursos que não estão em draft
                recursos_disponiveis.append(recurso)
        
        # Usar o serializer específico para alunos
        serializer = RecursoAlunoSerializer(recursos_disponiveis, many=True, context={'request': request})
        return Response(serializer.data)


class MatriculaViewSet(viewsets.ModelViewSet):
    queryset = Matricula.objects.select_related('aluno', 'turma', 'turma__treinamento').all()
    serializer_class = MatriculaSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        aluno_id = self.request.query_params.get('aluno', None)
        turma_id = self.request.query_params.get('turma', None)
        
        if aluno_id:
            queryset = queryset.filter(aluno_id=aluno_id)
        
        if turma_id:
            queryset = queryset.filter(turma_id=turma_id)
        
        return queryset.order_by('-data_matricula')


# Simple view to ensure CSRF cookie is set for SPA clients
@ensure_csrf_cookie
def get_csrf(request):
    return JsonResponse({'detail': 'CSRF cookie set'})


@method_decorator(csrf_exempt, name='dispatch')
class AuthViewSet(viewsets.ViewSet):
    """ViewSet para autenticação"""
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        profile_type = request.data.get('profile_type')  # 'admin' ou 'aluno'
        
        if not username or not password:
            return Response(
                {'error': 'Username e password são obrigatórios'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not profile_type or profile_type not in ['admin', 'aluno']:
            return Response(
                {'error': 'Tipo de perfil é obrigatório e deve ser "admin" ou "aluno"'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Primeiro tenta autenticar com username diretamente
        user = authenticate(username=username, password=password)
        
        # Se não conseguir, tenta buscar por nome do aluno
        if not user:
            try:
                aluno = Aluno.objects.get(nome__iexact=username)
                user = authenticate(username=aluno.user.username, password=password)
            except Aluno.DoesNotExist:
                pass
        
        if user:
            # Verificar se é aluno ou admin
            is_admin = user.is_staff
            has_aluno_profile = hasattr(user, 'aluno_profile')
            
            # Validar correspondência entre tipo selecionado e tipo real do usuário
            if profile_type == 'admin' and not is_admin:
                return Response(
                    {'error': 'Usuário não possui permissões de administrador'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if profile_type == 'aluno' and (is_admin or not has_aluno_profile):
                return Response(
                    {'error': 'Usuário não é um aluno cadastrado no sistema'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            login(request, user)
            
            user_data = UserSerializer(user).data
            
            # Se for aluno, buscar dados do perfil
            aluno_data = None
            if not is_admin and has_aluno_profile:
                aluno_data = AlunoSerializer(user.aluno_profile).data
            
            return Response({
                'user': user_data,
                'is_admin': is_admin,
                'aluno': aluno_data,
                'message': 'Login realizado com sucesso'
            })
        else:
            return Response(
                {'error': 'Credenciais inválidas'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def logout(self, request):
        logout(request)
        return Response({'message': 'Logout realizado com sucesso'})
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        if request.user.is_authenticated:
            user_data = UserSerializer(request.user).data
            is_admin = request.user.is_staff
            is_superuser = request.user.is_superuser
            
            # Se for aluno, buscar dados do perfil
            aluno_data = None
            if not is_admin and hasattr(request.user, 'aluno_profile'):
                aluno_data = AlunoSerializer(request.user.aluno_profile).data
            
            return Response({
                'user': user_data,
                'is_admin': is_admin,
                'is_superuser': is_superuser,
                'aluno': aluno_data
            })
        else:
            return Response(
                {'error': 'Usuário não autenticado'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
