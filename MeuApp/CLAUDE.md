# CHAMAOBRA — DOCUMENTAÇÃO GERAL DO PROJETO

## VISÃO GERAL

ChamaObra é um marketplace mobile de serviços de construção civil e manutenção residencial.

O aplicativo conecta clientes que precisam de serviços com prestadores profissionais (pedreiros, eletricistas, encanadores, pintores, engenheiros, arquitetos etc).

O diferencial principal do produto é:

- o cliente publica o serviço que precisa
- os prestadores enviam propostas
- existe negociação via chat
- o cliente escolhe qual profissional contratar
- o pagamento é protegido dentro da plataforma (escrow)

O objetivo é criar um produto com experiência moderna semelhante a:
- Uber
- iFood
- Airbnb
- 99

Mas aplicado ao setor de construção civil.

---

# PRINCÍPIOS DO PRODUTO

## O app deve parecer:
- moderno
- rápido
- confiável
- profissional
- simples

## O app NÃO deve parecer:
- sistema empresarial antigo
- painel administrativo complexo
- catálogo estático
- site genérico de classificados

---

# IDENTIDADE VISUAL

## CORES PRINCIPAIS

### Azul escuro
Usado para:
- header
- fundos principais
- textos fortes

### Laranja
Usado para:
- CTA
- botões principais
- destaque
- ações importantes

## ESTILO VISUAL

- minimalista
- moderno
- clean
- com bastante espaço em branco
- cards arredondados
- sombra leve
- UI inspirada em apps modernos

---

# LOGO

O conceito da logo mistura:
- comunicação/chat
- construção civil

Elementos:
- balão de conversa
- capacete de construção
- estilo minimalista

---

# TIPOGRAFIA

Fonte recomendada:
- Poppins

Estilo:
- moderno
- clean
- legível

---

# ARQUITETURA DO APLICATIVO

O aplicativo possui DOIS fluxos principais:

1. CLIENTE
2. PRESTADOR

Cada fluxo possui telas e funcionalidades específicas.

---

# FLUXO DO CLIENTE

## OBJETIVO DO CLIENTE

O cliente entra no app para:
- resolver um problema
- encontrar profissionais
- comparar propostas
- negociar
- acompanhar serviço
- pagar com segurança

---

# TELAS DO CLIENTE

## 1. Home
Funcionalidades:
- busca
- categorias
- profissionais em destaque
- botão "Postar Trabalho"
- status dinâmico

---

## 2. Postar Serviço
Campos:
- título
- descrição
- fotos
- localização
- urgência
- orçamento opcional

---

## 3. Detalhe do Serviço
Mostra:
- descrição
- fotos
- propostas recebidas

---

## 4. Lista de Propostas
Mostra:
- valor
- prazo
- avaliação do prestador

---

## 5. Detalhe da Proposta
Mostra:
- preço
- descrição
- perfil do prestador
- avaliações

Botões:
- conversar
- aceitar proposta

---

## 6. Chat
Funcionalidades:
- negociação
- envio de fotos
- atualização de proposta

---

## 7. Agendamento
Cliente escolhe:
- data
- horário

---

## 8. Pagamento
Modelo escrow:
- dinheiro fica retido
- prestador recebe apenas após conclusão

---

## 9. Serviço em andamento
Mostra:
- progresso
- fotos
- status

---

## 10. Finalização
Cliente:
- confirma conclusão
- ou reporta problema

---

## 11. Avaliação
Cliente avalia:
- nota
- comentário

---

# MENU INFERIOR DO CLIENTE

1. Início
2. Explorar
3. Postar
4. Serviços
5. Mensagens

Perfil fica no avatar superior.

---

# FLUXO DO PRESTADOR

## OBJETIVO DO PRESTADOR

O prestador entra no app para:
- encontrar serviços
- enviar propostas
- negociar
- executar serviços
- receber pagamentos
- construir reputação

---

# TELAS DO PRESTADOR

## 1. Home
Mostra:
- ganhos
- propostas
- trabalhos ativos

---

## 2. Explorar Trabalhos
Feed de oportunidades.

Filtros:
- distância
- categoria
- valor

---

## 3. Detalhe do Trabalho
Mostra:
- descrição
- fotos
- localização

---

## 4. Enviar Proposta
Campos:
- valor
- prazo
- descrição

---

## 5. Chat
Negociação com cliente.

---

## 6. Minhas Propostas
Status:
- aguardando
- aceita
- recusada

---

## 7. Trabalhos
Mostra:
- ativos
- agendados
- concluídos

---

## 8. Agenda
Calendário de serviços.

---

## 9. Serviço em andamento
Prestador:
- marca chegada
- envia fotos
- atualiza status

---

## 10. Finalização
Prestador:
- marca como concluído

---

## 11. Financeiro
Mostra:
- saldo
- histórico
- saque

---

## 12. Avaliações
Mostra:
- nota média
- comentários

---

# MENU INFERIOR DO PRESTADOR

1. Início
2. Explorar
3. Trabalhos
4. Mensagens
5. Perfil

OU

1. Início
2. Explorar
3. Trabalhos
4. Financeiro
5. Perfil

Dependendo da decisão final de UX.

---

# HEADER SUPERIOR

Elementos:
- menu lateral (3 barras)
- notificações
- avatar

Layout:
☰                     🔔   👤

---

# MENU LATERAL

## Prestador
- Meu Perfil
- Oportunidades
- Propostas
- Trabalhos
- Agenda
- Ganhos
- Avaliações
- Configurações
- Suporte
- Sair

---

# REGRAS DE UX/UI

## O aplicativo deve:
- focar em ação rápida
- reduzir fricção
- priorizar CTA
- usar hierarquia visual clara

## O aplicativo NÃO deve:
- poluir telas
- usar muitos textos
- usar elementos excessivos
- parecer sistema antigo

---

# ESTILO DAS TELAS

## As telas devem:
- usar cards modernos
- usar cantos arredondados
- ter bastante respiro
- usar azul escuro e laranja
- manter consistência visual

---

# REGRAS IMPORTANTES PARA O CLAUDE

## REGRA MAIS IMPORTANTE

O Claude NÃO pode criar telas aleatórias.

O Claude SOMENTE pode criar ou modificar uma tela quando o usuário enviar:
- imagem da tela
OU
- referência visual da tela

Sem imagem/referência, Claude NÃO deve inventar layouts completos.

---

# REGRAS DE IMPLEMENTAÇÃO

## O Claude deve:
- criar TODAS as funcionalidades reais das telas
- pensar no fluxo completo
- manter consistência visual
- manter coerência de UX
- seguir arquitetura mobile-first

---

# FUNCIONALIDADES IMPORTANTES

## Chat
- essencial
- negociação é parte central do produto

## Pagamento escrow
- obrigatório
- dinheiro retido até conclusão

## Avaliações
- fundamentais para confiança

## Notificações
- importantes para retenção

## Status dinâmico
- importante para sensação de produto vivo

---

# OBJETIVO FINAL

Criar um aplicativo moderno de marketplace de construção civil que:
- pareça startup grande
- seja confiável
- seja simples
- tenha UX semelhante a Uber/iFood
- priorize negociação e acompanhamento do serviço