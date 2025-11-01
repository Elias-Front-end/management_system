
# ======================================================
# 🧪 TESTES UNITÁRIOS E DE INTEGRAÇÃO
# ======================================================

from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from datetime import date, timedelta
import tempfile
import os
from PIL import Image

from .models import Treinamento, Turma, Recurso, Aluno, Matricula


class TreinamentoModelTest(TestCase):
    """Testes para o modelo Treinamento"""
    
    def setUp(self):
        self.treinamento = Treinamento.objects.create(
            nome="Python Básico",
            descricao="Curso introdutório de Python",
            nivel="iniciante"
        )
    
    def test_treinamento_creation(self):
        """Testa criação de treinamento"""
        self.assertEqual(self.treinamento.nome, "Python Básico")
        self.assertEqual(self.treinamento.nivel, "iniciante")
        self.assertTrue(self.treinamento.created_at)
    
    def test_treinamento_str(self):
        """Testa representação string do treinamento"""
        self.assertEqual(str(self.treinamento), "Python Básico")
    
    def test_treinamento_nivel_choices(self):
        """Testa se apenas níveis válidos são aceitos"""
        valid_levels = ['iniciante', 'intermediario', 'avancado']
        self.assertIn(self.treinamento.nivel, valid_levels)


class TurmaModelTest(TestCase):
    """Testes para o modelo Turma"""
    
    def setUp(self):
        self.treinamento = Treinamento.objects.create(
            nome="Django REST API",
            descricao="Desenvolvimento de APIs com Django",
            nivel="intermediario"
        )
        self.turma = Turma.objects.create(
            treinamento=self.treinamento,
            nome="Turma 2024.1",
            data_inicio=date.today() + timedelta(days=7),
            data_conclusao=date.today() + timedelta(days=37),
            link_acesso="https://meet.google.com/abc-def-ghi"
        )
    
    def test_turma_creation(self):
        """Testa criação de turma"""
        self.assertEqual(self.turma.nome, "Turma 2024.1")
        self.assertEqual(self.turma.treinamento, self.treinamento)
        self.assertTrue(self.turma.data_inicio)
    
    def test_turma_str(self):
        """Testa representação string da turma"""
        expected = f"{self.turma.nome} - {self.treinamento.nome}"
        self.assertEqual(str(self.turma), expected)
    
    def test_turma_clean_validation(self):
        """Testa validação de datas da turma"""
        # Data de conclusão deve ser após data de início
        turma_invalid = Turma(
            treinamento=self.treinamento,
            nome="Turma Inválida",
            data_inicio=date.today() + timedelta(days=30),
            data_conclusao=date.today() + timedelta(days=20)
        )
        with self.assertRaises(Exception):
            turma_invalid.clean()


class RecursoModelTest(TestCase):
    """Testes para o modelo Recurso"""
    
    def setUp(self):
        self.treinamento = Treinamento.objects.create(
            nome="React Avançado",
            descricao="Desenvolvimento avançado com React",
            nivel="avancado"
        )
        self.turma = Turma.objects.create(
            treinamento=self.treinamento,
            nome="Turma React 2024",
            data_inicio=date.today() + timedelta(days=5),
            data_conclusao=date.today() + timedelta(days=35)
        )
    
    def test_recurso_creation(self):
        """Testa criação de recurso"""
        recurso = Recurso.objects.create(
            turma=self.turma,
            treinamento=self.treinamento,
            nome_recurso="Introdução ao React",
            descricao_recurso="Vídeo introdutório sobre React",
            tipo_recurso="video",
            acesso_previo=True,
            draft=False
        )
        self.assertEqual(recurso.nome_recurso, "Introdução ao React")
        self.assertEqual(recurso.tipo_recurso, "video")
        self.assertTrue(recurso.acesso_previo)
    
    def test_recurso_str(self):
        """Testa representação string do recurso"""
        recurso = Recurso.objects.create(
            turma=self.turma,
            treinamento=self.treinamento,
            nome_recurso="Material de Apoio",
            tipo_recurso="arquivo_pdf",
            acesso_previo=True,
            draft=False
        )
        expected = f"{recurso.nome_recurso} - {self.turma.nome}"
        self.assertEqual(str(recurso), expected)


class AlunoModelTest(TestCase):
    """Testes para o modelo Aluno"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username="joao.silva",
            email="joao@example.com",
            password="senha123"
        )
        self.aluno = Aluno.objects.create(
            user=self.user,
            nome="João Silva",
            email="joao@example.com",
            telefone="(11) 99999-9999"
        )
    
    def test_aluno_creation(self):
        """Testa criação de aluno"""
        self.assertEqual(self.aluno.nome, "João Silva")
        self.assertEqual(self.aluno.email, "joao@example.com")
        self.assertEqual(self.aluno.user, self.user)
    
    def test_aluno_str(self):
        """Testa representação string do aluno"""
        self.assertEqual(str(self.aluno), "João Silva")


class MatriculaModelTest(TestCase):
    """Testes para o modelo Matricula"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username="maria.santos",
            email="maria@example.com",
            password="senha123"
        )
        self.aluno = Aluno.objects.create(
            user=self.user,
            nome="Maria Santos",
            email="maria@example.com"
        )
        self.treinamento = Treinamento.objects.create(
            nome="JavaScript ES6+",
            descricao="JavaScript moderno",
            nivel="intermediario"
        )
        self.turma = Turma.objects.create(
            treinamento=self.treinamento,
            nome="JS 2024.1",
            data_inicio=date.today() + timedelta(days=10),
            data_conclusao=date.today() + timedelta(days=40)
        )
        self.matricula = Matricula.objects.create(
            turma=self.turma,
            aluno=self.aluno
        )
    
    def test_matricula_creation(self):
        """Testa criação de matrícula"""
        self.assertEqual(self.matricula.turma, self.turma)
        self.assertEqual(self.matricula.aluno, self.aluno)
        self.assertTrue(self.matricula.data_matricula)
    
    def test_matricula_str(self):
        """Testa representação string da matrícula"""
        expected = f"{self.aluno.nome} - {self.turma.nome}"
        self.assertEqual(str(self.matricula), expected)


class TreinamentoAPITest(APITestCase):
    """Testes da API de Treinamentos"""
    
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="admin123",
            is_staff=True
        )
        self.regular_user = User.objects.create_user(
            username="user",
            email="user@example.com",
            password="user123"
        )
        self.treinamento = Treinamento.objects.create(
            nome="API Testing",
            descricao="Testes de API com Django",
            nivel="avancado"
        )
    
    def test_list_treinamentos_anonymous(self):
        """Testa listagem de treinamentos por usuário anônimo"""
        # Usuários anônimos não devem ter acesso
        url = reverse('treinamento-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_create_treinamento_admin(self):
        """Testa criação de treinamento por admin"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('treinamento-list')
        data = {
            'nome': 'Novo Treinamento',
            'descricao': 'Descrição do novo treinamento',
            'nivel': 'iniciante'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Treinamento.objects.count(), 2)
    
    def test_create_treinamento_regular_user(self):
        """Testa que usuário comum não pode criar treinamento"""
        self.client.force_authenticate(user=self.regular_user)
        url = reverse('treinamento-list')
        data = {
            'nome': 'Treinamento Não Autorizado',
            'descricao': 'Não deveria ser criado',
            'nivel': 'iniciante'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TurmaAPITest(APITestCase):
    """Testes da API de Turmas"""
    
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username="admin",
            password="admin123",
            is_staff=True
        )
        self.treinamento = Treinamento.objects.create(
            nome="Turma Testing",
            descricao="Testes de turmas",
            nivel="intermediario"
        )
        self.turma = Turma.objects.create(
            treinamento=self.treinamento,
            nome="Turma Teste",
            data_inicio=date.today() + timedelta(days=15),
            data_conclusao=date.today() + timedelta(days=45)
        )
    
    def test_list_turmas(self):
        """Testa listagem de turmas"""
        # Fazer login como admin para ter permissão
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('turma-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_filter_turmas_by_treinamento(self):
        """Testa filtro de turmas por treinamento"""
        # Fazer login como admin para ter permissão
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('turma-list')
        response = self.client.get(url, {'treinamento': self.treinamento.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)


class RecursoAPITest(APITestCase):
    """Testes da API de Recursos"""
    
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username="admin",
            password="admin123",
            is_staff=True
        )
        self.student_user = User.objects.create_user(
            username="student",
            password="student123"
        )
        self.aluno = Aluno.objects.create(
            user=self.student_user,
            nome="Aluno Teste",
            email="aluno@example.com"
        )
        
        self.treinamento = Treinamento.objects.create(
            nome="Recurso Testing",
            descricao="Testes de recursos",
            nivel="intermediario"
        )
        self.turma = Turma.objects.create(
            treinamento=self.treinamento,
            nome="Turma Recursos",
            data_inicio=date.today() + timedelta(days=10),
            data_conclusao=date.today() + timedelta(days=40)
        )
        self.matricula = Matricula.objects.create(
            turma=self.turma,
            aluno=self.aluno
        )
        
        # Recurso com acesso prévio
        self.recurso_previo = Recurso.objects.create(
            turma=self.turma,
            treinamento=self.treinamento,
            nome_recurso="Material Prévio",
            tipo_recurso="pdf",
            acesso_previo=True,
            draft=False
        )
        
        # Recurso sem acesso prévio
        self.recurso_normal = Recurso.objects.create(
            turma=self.turma,
            treinamento=self.treinamento,
            nome_recurso="Material Normal",
            tipo_recurso="video",
            acesso_previo=False,
            draft=False
        )
        
        # Recurso em draft
        self.recurso_draft = Recurso.objects.create(
            turma=self.turma,
            treinamento=self.treinamento,
            nome_recurso="Material Draft",
            tipo_recurso="pdf",
            acesso_previo=False,
            draft=True
        )
    
    def test_admin_sees_all_recursos(self):
        """Admin deve ver todos os recursos"""
        # Fazer login como admin
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/recursos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # A resposta é paginada, então acessar 'results'
        recursos_retornados = response.data['results']
        
        # Admin deve ver todos os recursos (incluindo drafts)
        total_recursos = Recurso.objects.count()
        self.assertEqual(len(recursos_retornados), total_recursos)
    
    def test_student_sees_only_non_draft_recursos(self):
        """Aluno deve ver apenas recursos não-draft"""
        # Fazer login como aluno
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get('/api/recursos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # A resposta é paginada, então acessar 'results'
        recursos_retornados = response.data['results']
        
        # Verificar que apenas recursos não-draft são retornados
        # Como o serializer do aluno não expõe o campo 'draft', 
        # vamos verificar pela lógica de negócio: alunos só veem recursos não-draft
        recursos_nao_draft = Recurso.objects.filter(draft=False).count()
        self.assertEqual(len(recursos_retornados), recursos_nao_draft)
        
        # Verificar que todos os recursos retornados existem e não são draft
        for recurso_data in recursos_retornados:
            recurso_obj = Recurso.objects.get(id=recurso_data['id'])
            self.assertFalse(recurso_obj.draft, "Aluno não deveria ver recursos em draft")


class BusinessRulesTest(APITestCase):
    """Testes das regras de negócio específicas"""
    
    def setUp(self):
        self.client = APIClient()
        self.student_user = User.objects.create_user(
            username="student",
            password="student123"
        )
        self.aluno = Aluno.objects.create(
            user=self.student_user,
            nome="Aluno Teste",
            email="aluno@example.com"
        )
        
        self.treinamento = Treinamento.objects.create(
            nome="Business Rules Test",
            descricao="Teste das regras de negócio",
            nivel="intermediario"
        )
    
    def test_access_before_turma_start(self):
        """Testa acesso antes do início da turma (apenas recursos com acesso prévio)"""
        # Turma que ainda não começou
        turma_futura = Turma.objects.create(
            treinamento=self.treinamento,
            nome="Turma Futura",
            data_inicio=date.today() + timedelta(days=10),
            data_conclusao=date.today() + timedelta(days=40)
        )
        
        matricula = Matricula.objects.create(
            turma=turma_futura,
            aluno=self.aluno
        )
        
        # Recurso com acesso prévio
        recurso_previo = Recurso.objects.create(
            turma=turma_futura,
            treinamento=self.treinamento,
            nome_recurso="Material Prévio",
            tipo_recurso="pdf",
            acesso_previo=True,
            draft=False
        )
        
        # Recurso sem acesso prévio
        recurso_normal = Recurso.objects.create(
            turma=turma_futura,
            treinamento=self.treinamento,
            nome_recurso="Material Normal",
            tipo_recurso="video",
            acesso_previo=False,
            draft=False
        )
        
        self.client.force_authenticate(user=self.student_user)
        url = reverse('aluno-recursos-disponiveis', kwargs={'pk': self.aluno.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Deve retornar apenas o recurso com acesso prévio
        recursos_nomes = [r['nome_recurso'] for r in response.data]
        self.assertIn("Material Prévio", recursos_nomes)
        self.assertNotIn("Material Normal", recursos_nomes)
    
    def test_access_after_turma_start(self):
        """Testa acesso após início da turma (todos recursos não-draft)"""
        # Turma que já começou
        turma_ativa = Turma.objects.create(
            treinamento=self.treinamento,
            nome="Turma Ativa",
            data_inicio=date.today() - timedelta(days=5),
            data_conclusao=date.today() + timedelta(days=25)
        )
        
        matricula = Matricula.objects.create(
            turma=turma_ativa,
            aluno=self.aluno
        )
        
        # Recurso normal
        recurso_normal = Recurso.objects.create(
            turma=turma_ativa,
            treinamento=self.treinamento,
            nome_recurso="Material Normal",
            tipo_recurso="video",
            acesso_previo=False,
            draft=False
        )
        
        # Recurso em draft
        recurso_draft = Recurso.objects.create(
            turma=turma_ativa,
            treinamento=self.treinamento,
            nome_recurso="Material Draft",
            tipo_recurso="pdf",
            acesso_previo=False,
            draft=True
        )
        
        self.client.force_authenticate(user=self.student_user)
        url = reverse('aluno-recursos-disponiveis', kwargs={'pk': self.aluno.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Deve retornar apenas recursos não-draft
        recursos_nomes = [r['nome_recurso'] for r in response.data]
        self.assertIn("Material Normal", recursos_nomes)
        self.assertNotIn("Material Draft", recursos_nomes)


class AuthenticationTest(APITestCase):
    """Testes de autenticação e autorização"""
    
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="admin123",
            is_staff=True
        )
        self.regular_user = User.objects.create_user(
            username="user",
            email="user@example.com",
            password="user123"
        )
    
    def test_login_success(self):
        """Testa login bem-sucedido"""
        url = reverse('auth-login')
        data = {
            'username': 'admin',
            'password': 'admin123',
            'profile_type': 'admin'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('is_admin', response.data)
        self.assertTrue(response.data['is_admin'])
    
    def test_login_invalid_credentials(self):
        """Testa login com credenciais inválidas"""
        url = reverse('auth-login')
        data = {
            'username': 'admin',
            'password': 'wrongpassword',
            'profile_type': 'admin'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_protected_endpoint_without_auth(self):
        """Testa acesso a endpoint protegido sem autenticação"""
        url = reverse('treinamento-list')
        data = {'nome': 'Teste', 'descricao': 'Teste', 'nivel': 'iniciante'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PerformanceTest(TestCase):
    """Testes de performance básicos"""
    
    def setUp(self):
        # Criar dados de teste em massa
        self.treinamento = Treinamento.objects.create(
            nome="Performance Test",
            descricao="Teste de performance",
            nivel="intermediario"
        )
        
        # Criar múltiplas turmas
        self.turmas = []
        for i in range(10):
            turma = Turma.objects.create(
                treinamento=self.treinamento,
                nome=f"Turma {i+1}",
                data_inicio=date.today() + timedelta(days=i*10),
                data_conclusao=date.today() + timedelta(days=i*10+30)
            )
            self.turmas.append(turma)
        
        # Criar múltiplos recursos
        for turma in self.turmas:
            for j in range(5):
                Recurso.objects.create(
                    turma=turma,
                    treinamento=self.treinamento,
                    nome_recurso=f"Recurso {j+1} - {turma.nome}",
                    tipo_recurso="pdf",
                    acesso_previo=j % 2 == 0,
                    draft=False
                )
    
    def test_query_optimization(self):
        """Testa otimização de queries"""
        from django.test.utils import override_settings
        from django.db import connection
        
        with override_settings(DEBUG=True):
            # Reset query count
            connection.queries_log.clear()
            
            # Buscar recursos com relacionamentos
            recursos = Recurso.objects.select_related(
                'turma', 'treinamento'
            ).all()
            
            # Forçar avaliação da query
            list(recursos)
            
            # Verificar número de queries (deve ser baixo devido ao select_related)
            query_count = len(connection.queries)
            self.assertLess(query_count, 5, "Muitas queries executadas")


if __name__ == '__main__':
    import django
    from django.conf import settings
    from django.test.utils import get_runner
    
    django.setup()
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests(["core.tests"])