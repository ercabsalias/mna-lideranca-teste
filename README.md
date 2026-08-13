# MNA LeaderPath

PROMPT PARA O LOVABLE — PORTAL DE FORMAÇÃO DE LÍDERES | MISSÃO NORTE DE ANGOLA

Crie uma aplicação web completa, moderna, responsiva, profissional e visualmente muito bonita para gerenciamento da formação, avaliação, notas, presença e progresso de pré-líderes da Missão Norte de Angola (MNA).

O sistema será utilizado durante o curso de liderança e deverá acompanhar cada pré-líder até à investidura, prevista para dezembro.

O nome provisório do sistema é:

MNA Leadership Portal

O logotipo oficial dos líderes será fornecido posteriormente e deverá ser utilizado na interface.

1. OBJETIVO DO SISTEMA

O sistema deve permitir que a Missão Norte de Angola administre todo o processo de formação de liderança, desde o cadastro do pré-líder até à avaliação final.

Existem 4 módulos/especialidades:

Aventureiro — cor vinho

Desbravadores — cor verde

Embaixadores — castanho escuro

Jovem Adulto (JA) — cinza escuro

O sistema deve permitir que cada pré-líder esteja associado a uma dessas especialidades e seja acompanhado através de:

Perfil pessoal

Igreja

Região

Especialidade

Disciplinas

Formadores

Notas

Provas

Avaliações

Presença/faltas

Observações

Evolução mensal

Percentual de progresso

Percentual estimado de prontidão para liderança

Histórico completo

Situação final

O sistema deve ser preparado para que o número de disciplinas, avaliações e etapas possa ser alterado posteriormente pelos administradores, sem necessidade de alterar o código.

2. TIPOS DE UTILIZADORES

Criar um sistema de permissões baseado em funções (RBAC).

Existirão 4 níveis principais:

A. SUPER ADMIN 1

É o administrador principal do sistema.

Tem acesso total.

Pode:

Criar administradores

Editar administradores

Desativar administradores

Criar regiões

Editar regiões

Criar igrejas

Editar igrejas

Associar regiões aos administradores

Cadastrar pré-líderes

Editar pré-líderes

Excluir/desativar pré-líderes

Cadastrar formadores

Cadastrar disciplinas

Criar avaliações

Lançar ou alterar notas

Consultar todos os pré-líderes

Consultar todos os administradores

Consultar todas as regiões

Consultar todas as igrejas

Ver relatórios

Ver gráficos

Ver histórico de alterações

Configurar regras de avaliação

Configurar critérios de prontidão

Visualizar tudo que o SUPER ADMIN 2 faz

Visualizar observações e atividades do SUPER ADMIN 2

Criar inicialmente este utilizador:

Username:
florizelkiole

Senha inicial:
mna_zxcvbnm

IMPORTANTE:
A senha deve ser armazenada de forma segura/hasheada no banco de dados. Não armazenar senha em texto puro.

Criar também no sistema uma opção para alterar a senha posteriormente.

3. SUPER ADMIN 2

Tem praticamente os mesmos recursos administrativos do SUPER ADMIN 1, porém todas as suas ações devem ficar visíveis para o SUPER ADMIN 1.

Criar inicialmente:

Username:
avelinoepalanga

Senha inicial:
mna_zxcvbnm

O SUPER ADMIN 1 deve conseguir visualizar:

Login/atividade do SUPER ADMIN 2

Alterações realizadas

Registros criados

Registros editados

Notas alteradas

Pré-líderes cadastrados

Administradores criados

Regiões e igrejas modificadas

Criar uma área:

Auditoria / Atividades

com:

Utilizador

Data

Hora

Ação

Registro afetado

Valor anterior

Novo valor

IP, se disponível

Tipo de operação

4. ADMINISTRADOR REGIONAL

Os administradores são os líderes gestores responsáveis pelas regiões que lhes forem atribuídas.

Um administrador pode estar associado a uma ou mais regiões.

O SUPER ADMIN deve poder:

Criar administrador

Definir nome

Username

Email

Telefone

Foto

Região ou regiões

Estado: ativo/inativo

O administrador somente poderá visualizar e administrar os dados das regiões que lhe foram atribuídas.

Por exemplo:

ADMIN 1
→ Região Centro de Luanda

ADMIN 2
→ Região de Cazenga

O administrador poderá:

Cadastrar pré-líderes da sua região

Consultar pré-líderes

Lançar notas

Lançar faltas

Registrar observações

Selecionar disciplina

Selecionar formador

Registrar avaliações

Consultar gráficos

Consultar progresso

Gerar relatórios da sua região

Não poderá visualizar dados de regiões que não lhe pertencem.

5. PRÉ-LÍDER

O candidato deve ser chamado no sistema de:

PRÉ-LÍDER

Ao ser cadastrado, o sistema deve gerar automaticamente uma chave única.

Formato:

mna_polo1_001

Depois:

mna_polo1_002

mna_polo1_003

etc.

O prefixo deve ser adaptável conforme a região/polo.

Essa chave funcionará como a credencial do pré-líder.

Exemplo:

CHAVE:
mna_centro_001

O pré-líder poderá entrar no portal usando somente:

Chave do Pré-Líder

e o seu Número do BI.

A chave deve ser única.

O sistema deve permitir ao administrador pesquisar o pré-líder pela chave.

6. PORTAL DO PRÉ-LÍDER

Criar uma interface completamente diferente da área administrativa.

O pré-líder deve ter um lead page bonito, simples e responsivo.

Após inserir sua chave e o numero do bi, mostrar:

Dashboard (Ou modal ou página)

Olá, [Nome do Pré-Líder]

Especialidade:
[Desbravadores]

Região:
[Região]

Igreja:
[Nome da Igreja]

7. PERFIL DO PRÉ-LÍDER

Mostrar:

Foto

Nome completo

Data de nascimento

Sexo

Data do batismo

Número do B.I.

Cargo no clube

Nome do clube

Igreja

Região

Especialidade

Código/chave do pré-líder

Data de inscrição no curso

Estado da formação

A informação deve ser organizada em cards modernos.

8. HISTÓRICO DE FORMAÇÃO

Criar uma área:

Meu Progresso

Mostrar todas as etapas/mês do curso.

Exemplo:

Março

Disciplina A — 85%

Disciplina B — 90%

Presença — 100%

Observações — 0

Status: Bom

Abril

Disciplina A — 80%

Disciplina B — 92%

Presença — 95%

Observações — 1

Status: Bom

E assim por diante.

Como o número de meses e disciplinas ainda poderá mudar, tudo deve ser dinâmico.

9. SISTEMA DE NOTAS

O sistema deve permitir que o administrador lance:

Nota da prova

Nota de trabalho

Nota prática

Nota de participação

Presença

Faltas

Observações

Cada lançamento deve conter:

Pré-líder

Região

Igreja

Especialidade

Mês/etapa

Disciplina

Formador

Tipo de avaliação

Nota

Data

Observação

O sistema deve permitir adicionar novos tipos de avaliação posteriormente.

10. DISCIPLINAS

Não definir um número fixo de disciplinas.

Criar no SUPER ADMIN uma área:

Gestão de Disciplinas

Permitir:

Criar disciplina

Editar disciplina

Ativar/desativar disciplina

Definir especialidade

Definir formador

Definir peso da disciplina

Definir nota mínima

Definir se é obrigatória

Exemplo:

Disciplina:
Liderança Cristã

Especialidade:
Desbravadores

Formador:
Nome do formador

Peso:
20%

Nota mínima:
70%

O sistema deverá aceitar novas disciplinas sem alteração da aplicação.

11. FORMADORES

Criar uma área:

Formadores

Cadastro:

Nome completo

Foto

Telefone

Email

Especialidade

Disciplina(s)

Região

Igreja

Estado ativo/inativo

Quando uma nota for lançada, o administrador deverá informar/selecionar:

Formador responsável

Isso permitirá saber quem ministrou/avaliou cada disciplina.

12. PRESENÇA

Como as aulas acontecem aos domingos, criar um módulo de presença.

Para cada domingo/etapa:

Presente

Falta

Falta justificada

Registrar:

Data

Pré-líder

Disciplina/atividade

Formador

Situação

Observação

Criar cálculo automático da taxa de presença.

Exemplo:

Aulas realizadas: 20

Presenças: 18

Faltas: 2

Presença:
90%

13. CÁLCULO AUTOMÁTICO DE PRONTIDÃO

O sistema deve calcular automaticamente a prontidão do pré-líder usando:

Notas

Presença

Faltas

Observações

Cumprimento das disciplinas

Evolução ao longo do curso

Criar um índice de prontidão de 0% a 100%.

Sugestão inicial:

Notas — 60%

Média ponderada das avaliações.

Presença — 20%

Percentual de presença.

Cumprimento da formação — 10%

Percentual de disciplinas/etapas concluídas.

Observações disciplinares — 10%

Redução da pontuação conforme quantidade e gravidade das observações.

O sistema deve deixar esses pesos configuráveis pelos SUPER ADMINS.

14. CLASSIFICAÇÃO DE PRONTIDÃO

Mostrar uma barra/gráfico circular com a porcentagem.

Exemplo:

87%

Pronto para liderança

Faixas:

0–49%
🔴 Crítico / Necessita muita melhoria

50–69%
🟠 Em desenvolvimento

70–84%
🟡 Bom progresso

85–94%
🟢 Muito próximo da prontidão

95–100%
🔵 Pronto para liderança

IMPORTANTE:

Esse percentual não deve ser apresentado como uma decisão definitiva ou automática de investidura.

Deve ser chamado de:

Índice de Prontidão

E o sistema deve apresentar também:

Pontos fortes

Pontos a melhorar

Disciplinas pendentes

Faltas

Observações

Avaliações abaixo da média

A decisão final de aprovação/investidura deve continuar sob responsabilidade da liderança responsável.

15. GRÁFICOS

O dashboard do pré-líder deve ser visualmente excelente.

Criar:

Gráfico 1 — Evolução das notas

Linha mostrando a evolução mensal.

Gráfico 2 — Presença

Percentual de presença ao longo dos meses.

Gráfico 3 — Índice de prontidão

Mostrar crescimento:

Março: 52%
Abril: 61%
Maio: 69%
Junho: 75%
Julho: 82%
Agosto: 88%

Os valores acima são apenas exemplos.

Gráfico 4 — Disciplinas

Mostrar:

Concluídas
Em andamento
Pendentes

16. ALERTAS INTELIGENTES

Criar alertas automáticos.

Exemplos:

"Você possui 2 disciplinas pendentes."

"Sua presença está abaixo de 80%."

"Você possui uma avaliação abaixo da nota mínima."

"Seu índice de prontidão aumentou 8% este mês."

"Excelente! Você está próximo de concluir sua formação."

Os alertas devem ser informativos e motivacionais, sem declarar automaticamente que alguém está aprovado.

17. ÁREA ADMINISTRATIVA

Criar sidebar moderna com:

Dashboard

Pré-Líderes

Regiões

Igrejas

Administradores

Formadores

Disciplinas

Avaliações

Presenças

Relatórios

Configurações

Auditoria

18. DASHBOARD DO SUPER ADMIN

Mostrar indicadores:

Total de Pré-Líderes

Total de Administradores

Total de Formadores

Total de Regiões

Total de Igrejas

Total de Disciplinas

Pré-Líderes ativos

Pré-Líderes em situação crítica

Pré-Líderes próximos da prontidão

Pré-Líderes prontos

19. FILTROS

Criar filtros avançados.

Filtrar por:

Região

Igreja

Especialidade

Sexo

Status

Mês

Disciplina

Formador

Índice de prontidão

Pesquisa por:

Nome

Código

BI

20. REGIÕES E IGREJAS

Criar uma área específica:

Regiões e Igrejas

Estrutura hierárquica:

REGIÃO
↓
IGREJAS
↓
PRÉ-LÍDERES

Uma região pode possuir várias igrejas.

Uma igreja pertence somente a uma região.

Um pré-líder pertence a uma igreja.

Ao selecionar uma igreja durante o cadastro, o sistema deve preencher automaticamente a região correspondente.

Exemplo:

Região:
Centro de Luanda

Igreja:
Central de Luanda

Pré-líder:
João Manuel

O sistema automaticamente sabe:

João Manuel
→ Central de Luanda
→ Centro de Luanda

21. ASSOCIAÇÃO DE ADMINISTRADORES

O SUPER ADMIN deve conseguir abrir:

Regiões

e ver:

Centro de Luanda
→ Administrador responsável: [Nome]

Cazenga
→ Administrador responsável: [Nome]

Também deve ser possível alterar o administrador responsável.

O administrador só vê as regiões atribuídas a ele.

22. DADOS INICIAIS DAS REGIÕES

Não é necessário inserir todas as 133 igrejas imediatamente.

Criar a estrutura de cadastro para permitir que o SUPER ADMIN insira todas posteriormente.

Porém, criar pelo menos estas regiões como dados de demonstração:

REGIÃO CENTRO DE LUANDA

Igrejas:

Central de Luanda

Boa Vista

Textang I

Mar da Galileia

Ilha do Cabo

Rangel

Nova Jerusalém

Maianga

Cassenda

Prenda

Jumbo

Calemba

Smirna

REGIÃO DE CAZENGA

Igrejas:

Cazenga Central

Cariango

Tunga Ngó

Hoji Ya Henda

Também deixar a aplicação preparada para adicionar todas as outras regiões e igrejas posteriormente.

Não duplicar igrejas.

Alguns nomes fornecidos podem aparecer em regiões diferentes, portanto a combinação correta será:

Região + Igreja

e não somente o nome da igreja.

23. ESPECIALIDADES

Criar as quatro especialidades como entidades independentes.

AVENTUREIRO

Cor principal:
Vinho / Burgundy

DESBRAVADORES

Cor principal:
Verde

EMBAIXADORES

Cor principal:
Castanho escuro

JOVEM ADULTO

Cor principal:
Cinza escuro

Cada especialidade deve ter um identificador único.

Criar cards visuais para cada uma.

24. CADASTRO DE PRÉ-LÍDER

Formulário:

Foto

Nome completo

Data de nascimento

Sexo

Data do batismo

Número do B.I.

Cargo no Clube

Nome do Clube

Especialidade

Região

Igreja

Telefone

Email

Data de entrada no curso

Observação inicial

Ao salvar:

Gerar automaticamente a chave.

Exemplo:

mna_centro_001

Mostrar uma tela:

"Pré-Líder cadastrado com sucesso"

Código:

mna_centro_001

Botões:

Copiar chave

Imprimir

Gerar PDF

Voltar

A chave deve ser única e não pode ser duplicada.

25. SEGURANÇA

Implementar autenticação segura.

Separar completamente:

SUPER ADMIN

ADMIN

PRÉ-LÍDER

Utilizar controle de acesso por função.

O pré-líder NÃO pode acessar:

Dados de outros pré-líderes

Dados administrativos

Notas de outros alunos

Configurações

Regiões

Igrejas

Formadores

Auditoria

O ADMIN não pode acessar dados de regiões não atribuídas.

Os SUPER ADMINS têm visão global.

26. BANCO DE DADOS

Estruturar o banco de dados de forma relacional.

Criar entidades/tabelas semelhantes a:

users

roles

regions

churches

admins_regions

specialties

pre_leaders

trainers

disciplines

assessments

grades

attendance

observations

progress

audit_logs

settings

Os relacionamentos devem ser bem definidos.

Exemplo:

Region
→ hasMany Churches

Church
→ belongsTo Region

PreLeader
→ belongsTo Church

PreLeader
→ belongsTo Specialty

Church
→ belongsTo Region

Admin
→ belongsToMany Regions

Discipline
→ belongsTo Specialty

Grade
→ belongsTo PreLeader

Grade
→ belongsTo Discipline

Grade
→ belongsTo Trainer

27. RELATÓRIOS

Criar módulo de relatórios.

Permitir gerar:

Relatório geral

Relatório por região

Relatório por igreja

Relatório por especialidade

Relatório por pré-líder

Relatório de notas

Relatório de faltas

Relatório de prontidão

Relatório de disciplinas pendentes

Permitir exportar:

PDF

Excel/CSV

28. DESIGN

A aplicação deve parecer um produto profissional real, e não um sistema administrativo genérico.

Usar:

Azul escuro

Azul claro

Branco

Tons neutros

Gradientes discretos

Cards modernos

Bordas arredondadas

Sombras suaves

Ícones modernos

Gráficos elegantes

Excelente espaçamento

Tipografia profissional

Sugestão de identidade visual:

Primary:
#0B1F3A

Secondary:
#1479FF

Accent:
#35B6FF

Background:
#F5F8FC

Success:
#16A34A

Warning:
#F59E0B

Danger:
#DC2626

O sistema deve usar a cor específica de cada especialidade em seus respectivos elementos.

Não exagerar nas cores.

A aparência deve transmitir:

liderança + educação + confiança + espiritualidade + tecnologia + excelência

29. DASHBOARD MODERNO

No dashboard, utilizar cards como:

"Pré-Líderes"

"Prontidão média"

"Presença média"

"Disciplinas concluídas"

"Em situação de atenção"

"Prontos para avaliação final"

Utilizar gráficos interativos.

30. RESPONSIVIDADE

O sistema deve funcionar perfeitamente em:

Desktop

Tablet

Telemóvel

A interface do pré-líder deve ser especialmente otimizada para celular.

O pré-líder provavelmente utilizará o sistema principalmente através do telefone.

31. EXPERIÊNCIA DO PRÉ-LÍDER

A página inicial do portal deve ser extremamente simples.

Logo

"MNA Leadership Portal"

Texto:

Consulte o seu progresso de formação

Campo:

"Digite a sua chave"

Botão:

Consultar meu progresso

Depois do login:

Foto

Nome

Especialidade

Igreja

Região

Índice de Prontidão

Progresso

Notas

Presença

Histórico

32. IMPORTANTE — SISTEMA FLEXÍVEL

Não assumir que já conhecemos:

Quantas disciplinas existem

Quantas provas existirão

Quantos meses de formação existirão

Quantos formadores existirão

Peso definitivo de cada disciplina

Nota mínima definitiva

Critérios finais da investidura

Por isso, criar uma área:

Configurações de Formação

onde os SUPER ADMINS poderão configurar:

Ano da formação

Data de início

Data final

Data prevista da investidura

Disciplinas

Tipos de avaliação

Pesos

Nota mínima

Percentual mínimo de presença

Peso das faltas

Peso das observações

Critérios do índice de prontidão

O sistema deve calcular automaticamente com base nas configurações atuais.

33. ANO DE FORMAÇÃO

Criar conceito de:

Edição/Ano de Formação

Exemplo:

Formação de Líderes 2026

Depois:

Formação de Líderes 2027

Isso permitirá que o sistema mantenha o histórico de anos anteriores.

Um pré-líder deve pertencer a uma edição de formação.

34. HISTÓRICO

Nunca apagar definitivamente informações importantes.

Preferir:

Ativo

Inativo

Arquivado

Isso permitirá preservar o histórico.

Alterações importantes devem gerar registros na auditoria.

35. UX E INTERAÇÕES

Adicionar:

Toasts

Modal de confirmação

Loading states

Empty states

Skeleton loading

Validação de formulários

Mensagens de erro amigáveis

Confirmação antes de operações destrutivas

Pesquisa instantânea

Filtros

Paginação

Evitar páginas vazias.

36. TECNOLOGIA

Utilizar uma arquitetura moderna e escalável compatível com o ambiente do Lovable.

Preferir:

React + TypeScript

Tailwind CSS

Componentes modernos

Supabase para autenticação e banco de dados, caso seja a opção disponível/recomendada pelo Lovable.

Utilizar Row Level Security (RLS) para proteger os dados.

Nunca confiar apenas em filtros do frontend para segurança.

As permissões devem ser aplicadas também no backend/banco.

37. DADOS DE DEMONSTRAÇÃO

Criar alguns dados fictícios para demonstrar o funcionamento:

2 regiões

Algumas igrejas

4 especialidades

Alguns pré-líderes

Alguns formadores

Algumas disciplinas

Algumas avaliações

Alguns registros de presença

Notas de exemplo

Isso deve permitir visualizar os gráficos e dashboards imediatamente.

Os dados fictícios devem estar claramente identificados como dados de demonstração.

38. PRIMEIROS ACESSOS

Criar os dois SUPER ADMINS iniciais:

SUPER ADMIN 1

Username:
florizelkiole

Senha inicial:
mna_zxcvbnm

SUPER ADMIN 2

Username:
avelinoepalanga

Senha inicial:
mna_zxcvbnm

Forçar, se possível, alteração da senha no primeiro acesso.

39. MENU DO SUPER ADMIN

Dashboard

Pré-Líderes

Administradores

Formadores

Regiões e Igrejas

Especialidades

Disciplinas

Avaliações

Presenças

Relatórios

Configurações da Formação

Auditoria

Meu Perfil

Sair

40. MENU DO ADMIN

Dashboard

Pré-Líderes

Notas

Presenças

Formadores

Disciplinas

Relatórios

Meu Perfil

Sair

Mostrar somente informações pertencentes às regiões atribuídas.

41. MENU DO PRÉ-LÍDER

Início

Meu Perfil

Meu Progresso

Notas

Presença

Disciplinas

Histórico

Índice de Prontidão

Sair

42. ESTADO FINAL DO PRÉ-LÍDER

O sistema deve apresentar claramente:

Índice de Prontidão: 88%

Status:

Muito próximo da prontidão

Depois mostrar:

Você está bem em:

Presença

Liderança Cristã

Disciplina X

Precisa melhorar:

Disciplina Y

Presença em determinadas etapas

Ainda falta:

2 disciplinas

1 avaliação

3 etapas

Isso torna o sistema útil não apenas para registrar notas, mas também para orientar o pré-líder.

43. IMPORTANTE SOBRE A DECISÃO FINAL

O sistema NÃO deve dizer simplesmente:

"Você será investido como líder."

O sistema deve dizer:

"Índice de Prontidão"

e:

"O resultado final da formação e da investidura depende da avaliação da liderança responsável."

Isso evita transformar o cálculo automático em uma decisão oficial.

44. QUALIDADE VISUAL

Quero uma aplicação extremamente bonita.

Não criar uma interface genérica de CRUD.

Criar uma experiência semelhante a um produto SaaS premium.

Usar:

Dashboard visual

Gráficos modernos

Cards

Microinterações

Animações suaves

Estados de hover

Transições

Ícones consistentes

Excelente hierarquia visual

Layout limpo

Responsividade

O sistema deve parecer digno de ser utilizado oficialmente por uma organização.

45. LOGOTIPO

Reservar espaço para o logotipo oficial dos líderes da Missão Norte de Angola.

O logo será enviado posteriormente.

O sistema deve permitir que o logo apareça:

Login

Sidebar

Dashboard

Portal do pré-líder

Relatórios

PDFs

Não criar um logo falso se o arquivo oficial ainda não estiver disponível.

Utilizar um placeholder elegante até o logotipo ser carregado.

46. RESULTADO ESPERADO

No final quero ter um sistema funcional chamado:

MNA Leadership Portal

com dois grandes ambientes:

GESTÃO

SUPER ADMIN 1
SUPER ADMIN 2
ADMINISTRADORES
FORMADORES

PORTAL

PRÉ-LÍDERES

O sistema deverá permitir acompanhar cada pré-líder desde o seu cadastro até à conclusão da formação, mostrando claramente:

Quem é → Onde está → O que estudou → Quem o formou → Quais notas teve → Quantas vezes esteve presente → O que falta → Como está evoluindo → Qual é o seu índice de prontidão.

Comece pela arquitetura do banco de dados, autenticação, sistema de permissões, dashboard e cadastro de regiões/igrejas.

Depois implemente progressivamente os módulos de pré-líderes, formadores, disciplinas, notas, presença, progresso, relatórios e auditoria.

Priorize uma arquitetura limpa, escalável, segura e fácil de modificar quando a Missão Norte de Angola fornecer posteriormente a lista definitiva de regiões, igrejas, disciplinas, formadores e critérios oficiais de avaliação.

Em anexo mandei o logotipo dos Líderes da Missão Norte

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mna-lideranca.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7705e7fb-790a-4a5b-826b-ad7c38d9c612).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
