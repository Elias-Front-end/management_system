from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.utils.text import slugify
from .models import Treinamento, Turma, Recurso, Aluno, Matricula


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']
        read_only_fields = ['id']


class TreinamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Treinamento
        fields = ['id', 'nome', 'descricao', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_nome(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Nome deve ter pelo menos 3 caracteres.")
        return value.strip()


class TurmaSerializer(serializers.ModelSerializer):
    treinamento_nome = serializers.CharField(source='treinamento.nome', read_only=True)
    total_alunos = serializers.SerializerMethodField()

    class Meta:
        model = Turma
        fields = ['id', 'nome', 'treinamento', 'treinamento_nome', 'data_inicio', 
                 'data_conclusao', 'link_acesso', 'total_alunos', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total_alunos(self, obj):
        # Usa related_name definido no modelo: 'matriculas'
        return obj.matriculas.count()

    def validate(self, data):
        if data.get('data_conclusao') and data.get('data_inicio'):
            if data['data_conclusao'] <= data['data_inicio']:
                raise serializers.ValidationError(
                    "Data de conclusão deve ser posterior à data de início."
                )
        return data


class RecursoSerializer(serializers.ModelSerializer):
    turma_nome = serializers.CharField(source='turma.nome', read_only=True)
    treinamento_nome = serializers.CharField(source='treinamento.nome', read_only=True)
    arquivo_url = serializers.SerializerMethodField()

    class Meta:
        model = Recurso
        fields = ['id', 'nome_recurso', 'descricao_recurso', 'turma', 'turma_nome', 
                 'treinamento', 'treinamento_nome', 'tipo_recurso', 'arquivo', 'arquivo_url', 
                 'acesso_previo', 'draft', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_arquivo_url(self, obj):
        if obj.arquivo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.arquivo.url)
        return None

    def validate(self, data):
        from django.utils import timezone
        
        # Para criação, o arquivo é obrigatório. Para edição, mantém-se o arquivo atual se não for enviado.
        tipo_recurso = data.get('tipo_recurso')
        arquivo = data.get('arquivo')

        if not arquivo:
            # Em edição, se já existe arquivo na instância, permitir ausência
            if self.instance and getattr(self.instance, 'arquivo', None):
                pass  # Continua com as outras validações
            else:
                # Em criação, arquivo é obrigatório
                raise serializers.ValidationError({
                    'arquivo': "Arquivo é obrigatório para este tipo de recurso."
                })

        # Valida coerência básica entre tipo e extensão APENAS quando há novo arquivo
        if arquivo:
            name = getattr(arquivo, 'name', '').lower()
            if tipo_recurso == 'video' and not name.endswith(('.mp4', '.avi', '.mov')):
                raise serializers.ValidationError({
                    'arquivo': "Para tipo vídeo, apenas arquivos MP4, AVI ou MOV são permitidos."
                })
            if tipo_recurso == 'arquivo_pdf' and not name.endswith('.pdf'):
                raise serializers.ValidationError({
                    'arquivo': "Para tipo PDF, apenas arquivos PDF são permitidos."
                })
            if tipo_recurso == 'arquivo_zip' and not name.endswith('.zip'):
                raise serializers.ValidationError({
                    'arquivo': "Para tipo ZIP, apenas arquivos ZIP são permitidos."
                })

        # Validações de regras de negócio
        acesso_previo = data.get('acesso_previo', False)
        draft = data.get('draft', True)
        turma = data.get('turma')
        
        # Se estamos editando, usar os valores atuais como fallback
        if self.instance:
            acesso_previo = data.get('acesso_previo', self.instance.acesso_previo)
            draft = data.get('draft', self.instance.draft)
            turma = data.get('turma', self.instance.turma)

        # Validação: Um recurso não pode ter acesso_previo=True e draft=True simultaneamente
        if acesso_previo and draft:
            raise serializers.ValidationError({
                'acesso_previo': 'Um recurso não pode ter "Acesso Prévio" e estar em "Rascunho" ao mesmo tempo.',
                'draft': 'Um recurso não pode ter "Acesso Prévio" e estar em "Rascunho" ao mesmo tempo.'
            })
        
        # Validação: Se a turma já iniciou, recursos com acesso_previo=True devem ser finalizados (draft=False)
        if turma and turma.data_inicio:
            hoje = timezone.now().date()
            turma_iniciada = hoje >= turma.data_inicio
            
            if turma_iniciada and acesso_previo and draft:
                raise serializers.ValidationError({
                    'draft': f'A turma "{turma.nome}" já iniciou. Recursos com "Acesso Prévio" devem estar finalizados (não podem estar em rascunho).'
                })

        return data


class AlunoSerializer(serializers.ModelSerializer):
    total_matriculas = serializers.SerializerMethodField()
    # Campos opcionais, write-only, caso queira fornecer explicitamente
    username = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Aluno
        fields = ['id', 'nome', 'email', 'telefone', 'total_matriculas', 
                 'created_at', 'updated_at', 'username', 'password']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_total_matriculas(self, obj):
        # Usa related_name definido no modelo: 'matriculas'
        return obj.matriculas.count()

    def validate_email(self, value):
        if Aluno.objects.filter(email=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Este email já está em uso.")
        return value

    def _generate_unique_username(self, base: str) -> str:
        """Gera username único adicionando sufixo numérico quando necessário."""
        base = slugify(base or 'aluno').replace('-', '') or 'aluno'
        candidate = base
        counter = 1
        while User.objects.filter(username=candidate).exists():
            counter += 1
            candidate = f"{base}{counter}"
        return candidate

    def create(self, validated_data):
        # Extrai campos opcionais
        username = validated_data.pop('username', None)
        password = validated_data.pop('password', None)

        nome = validated_data.get('nome')
        email = validated_data.get('email')

        # Checa duplicidade de email antes de criar
        if email and Aluno.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'Este email já está em uso.'})

        # Define username se não fornecido
        if not username:
            base_username = (email.split('@')[0] if email else None) or (nome or 'aluno')
            username = self._generate_unique_username(base_username)
        
        # Verifica se o username gerado já existe antes de tentar criar o User
        if User.objects.filter(username=username).exists():
            # Isso deve ser evitado pelo _generate_unique_username, mas é uma salvaguarda
            raise serializers.ValidationError({'username': 'Este nome de usuário já está em uso.'})

        # Cria usuário vinculado
        user = User(username=username, first_name=nome or '', email=email or '')
        if password:
            user.set_password(password)
        else:
            # Senha não é necessária para gestão pelo admin; torna a senha inutilizável
            user.set_unusable_password()
        
        try:
            user.save()
        except IntegrityError as e:
            # Se houver um IntegrityError aqui, é provável que seja um problema de username
            # ou um email único no User (se configurado).
            # Para evitar mensagens genéricas, podemos tentar ser mais específicos.
            if 'username' in str(e).lower(): # Tentativa de identificar a causa pelo erro
                raise serializers.ValidationError({'username': 'Erro ao criar usuário: nome de usuário duplicado.'})
            elif 'email' in str(e).lower(): # Se o User model tiver unique=True para email
                raise serializers.ValidationError({'email': 'Erro ao criar usuário: email duplicado.'})
            else:
                raise serializers.ValidationError({'detail': 'Erro inesperado ao criar usuário.'})

        aluno = Aluno.objects.create(user=user, **validated_data)
        return aluno

    def update(self, instance, validated_data):
        # Campos write-only opcionais
        username = validated_data.pop('username', None)
        password = validated_data.pop('password', None)

        # Atualiza dados do Aluno
        for field in ['nome', 'email', 'telefone']:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()

        # Mantém User sincronizado
        user = instance.user
        if 'email' in validated_data:
            user.email = validated_data['email']
        if 'nome' in validated_data:
            user.first_name = validated_data['nome']
        if username:
            user.username = username
        if password:
            user.set_password(password)
        user.save()

        return instance


class MatriculaSerializer(serializers.ModelSerializer):
    aluno_nome = serializers.CharField(source='aluno.nome', read_only=True)
    turma_nome = serializers.CharField(source='turma.nome', read_only=True)
    treinamento_nome = serializers.CharField(source='turma.treinamento.nome', read_only=True)

    class Meta:
        model = Matricula
        fields = ['id', 'aluno', 'aluno_nome', 'turma', 'turma_nome', 
                 'treinamento_nome', 'data_matricula', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        aluno = data.get('aluno')
        turma = data.get('turma')
        
        if aluno and turma:
            if Matricula.objects.filter(aluno=aluno, turma=turma).exclude(
                pk=self.instance.pk if self.instance else None
            ).exists():
                raise serializers.ValidationError(
                    "Este aluno já está matriculado nesta turma."
                )
        
        return data


class RecursoAlunoSerializer(serializers.ModelSerializer):
    """Serializer específico para visualização do aluno com regras de acesso"""
    turma_nome = serializers.CharField(source='turma.nome', read_only=True)
    arquivo_url = serializers.SerializerMethodField()
    pode_acessar = serializers.SerializerMethodField()

    class Meta:
        model = Recurso
        fields = ['id', 'nome_recurso', 'descricao_recurso', 'turma_nome', 
                 'tipo_recurso', 'arquivo_url', 
                 'pode_acessar', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_arquivo_url(self, obj):
        if obj.arquivo and self.get_pode_acessar(obj):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.arquivo.url)
        return None

    def get_pode_acessar(self, obj):
        from django.utils import timezone
        
        # Se está em draft, não pode acessar
        if obj.draft:
            return False
        
        # Se permite acesso prévio, pode acessar
        if obj.acesso_previo:
            return True
        
        # Senão, só pode acessar se a turma já começou
        return obj.turma.data_inicio <= timezone.now().date()