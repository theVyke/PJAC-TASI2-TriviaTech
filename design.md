# 🎨 Design System & Especificação de Interface - TriviaTech

> **Documento de Design do Frontend (v1.0)**  
> **Framework Base**: Bootstrap 5.3+ & Bootstrap Icons  
> **Conceito**: Minigame de Quiz "Jogador vs A.P.I." (Confronto Tecnológico)

---

## 1. Visão Geral & Identidade Visual

O **TriviaTech** é um minigame web onde o jogador desafia um "Boss" de inteligência artificial / máquina denominado **A.P.I. (Autonomous Processing Intelligence)** em rodadas de perguntas e respostas dinâmicas.

### 1.1 Estilo e Atmosfera
- **Atmosfera**: Tecnológica, gamificada, moderna e limpa.
- **Tema Base**: Suporte a **Dark Mode** nativo do Bootstrap 5 (`data-bs-theme="dark"` por padrão, com opção de alternância para `light`).
- **Paleta de Cores (Bootstrap Tokens Personalizados / Semânticos)**:
  - **Fundo Principal (Canvas)**: `#0d1117` (Dark suave / terminal escuro) ou `#f8f9fa` (Light).
  - **Superfície dos Cards (`card-bg`)**: `#161b22` com bordas sutis `border-secondary-subtle`.
  - **Acento Primário (`primary`)**: `#0d6efd` / Cyan elétrico `#0dcaf0` (Representando o Jogador e elementos de ação).
  - **Acento da API (`danger` / `warning`)**: `#dc3545` / `#ffc107` (Representando a API, alertas e status crítico).
  - **Sucesso (`success`)**: `#198754` / Emerald `#20c997` (Acertos, cura, combos).
  - **Neutro / Texto**: Textos de alta legibilidade com classes utilitárias `text-light`, `text-body-secondary`.

### 1.2 Tipografia & Ícones
- **Tipografia**: Sistema de fontes sans-serif do Bootstrap (`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`), com classes utilitárias de peso `fw-bold`, `fw-semibold`, `fs-4`, `display-6`.
- **Ícones**: **Bootstrap Icons (v1.11+)** integrados em todos os botões, badges, cabeçalhos e alertas.

---

## 2. Telas & Componentes do Minigame

O frontend é composto por uma **Single Page Application (SPA)** com 3 visões principais gerenciadas por transições fluidas e componentes utilitários do Bootstrap:

```
+---------------------------------------------------------------+
|                       TRIVIATECH NAV / HEADER                 |
|  [bi-terminal-fill TriviaTech]           [bi-moon / bi-gear]  |
+---------------------------------------------------------------+
|                                                               |
|  +---------------------------------------------------------+  |
|  |                 ARENA / VISÃO ATIVA                     |  |
|  |                                                         |  |
|  |   1. Lobby (Configuração do Desafio & Seleção de Modo)  |  |
|  |   2. Arena de Batalha (HUD Jogador vs API + Pergunta)   |  |
|  |   3. Fim de Partida (Vitória / Derrota & Recordes)      |  |
|  +---------------------------------------------------------+  |
|                                                               |
|  +---------------------------------------------------------+  |
|  | MODAIS & OFFCANVAS: Regras, Ranking Local, Configs     |  |
|  +---------------------------------------------------------+  |
+---------------------------------------------------------------+
```

---

### 2.1 Navbar / Topbar Global
- **Estrutura**: `<nav class="navbar navbar-expand-lg border-bottom border-secondary-subtle px-3 py-2">`
- **Elementos**:
  - **Brand**: `<i class="bi bi-cpu-fill text-info me-2"></i> TriviaTech <span class="badge bg-primary-subtle text-primary ms-2 fs-6">v1.0</span>`
  - **Ações Rápidas**:
    - Botão de Ranking: `<button class="btn btn-outline-secondary btn-sm"><i class="bi bi-trophy-fill text-warning"></i> Placar</button>` (Abre Offcanvas).
    - Botão de Regras: `<button class="btn btn-outline-secondary btn-sm"><i class="bi bi-question-circle"></i> Ajuda</button>` (Abre Modal).
    - Botão de Tema: Alternador Dark/Light (`<i class="bi bi-moon-stars-fill"></i>`).

---

### 2.2 Visão 1: Lobby & Preparação do Desafio
Tela inicial de recepção e configuração do desafio:

- **Hero Card de Boas-Vindas**:
  - Título chamativo com gradiente ou badge: *"Desafie a Máquina em um Duelo de Conhecimento"*.
  - Indicador do Oponente Atual: Card destacando o **Boss da API**:
    - Ícone: `<i class="bi bi-robot fs-1 text-danger"></i>`
    - Nome: *"Core API: Rest Countries"* (modular para futuras APIs).
    - Dificuldade / Categoria: Badge `bg-info` "Geografia & Capitais Globais".
- **Painel de Configurações da Partida**:
  - Campo de Entrada: Nome/Apelido do Desafiante (`form-control-lg`).
  - Seletor de Modo de Jogo:
    - **Modo Duelo (Barra de Vida / HP)**: Acertos causam dano na API; erros causam dano ao jogador.
    - **Modo Pontuação (Clássico)**: 10 rodadas, acumula pontos e streak multiplicador.
  - Seletor de Tempo (Timer por pergunta: Sem tempo, 15s ou 30s).
- **Botão CTA Principal**:
  - `<button class="btn btn-primary btn-lg w-100 py-3 shadow"><i class="bi bi-play-circle-fill me-2"></i> Iniciar Desafio</button>`

---

### 2.3 Visão 2: Arena de Batalha (Quiz & Duelo)
O coração interativo do jogo, organizado com o sistema de grid responsivo do Bootstrap:

#### A. O HUD Superior (Painel do Duelo: Jogador vs API)
Implementado com `<div class="row g-3 align-items-center mb-4">`:
- **Card do Jogador (Lado Esquerdo - `col-12 col-md-5`)**:
  - Avatar / Ícone (`bi-person-bounding-box text-primary fs-3`).
  - Nome do Jogador e Pontuação Atual (`badge bg-primary fs-6`).
  - Barra de Vida/Energia do Jogador (`progress mb-2` com `progress-bar bg-success`).
  - Multiplicador de Streak: `<span class="badge bg-warning text-dark"><i class="bi bi-fire"></i> Combo 3x</span>`.
- **Área Central de Status (`col-12 col-md-2 text-center`)**:
  - Badge de Rodada: `Rodada 4 / 10`.
  - Cronômetro regressivo com badge dinâmico: `<span class="badge bg-danger fs-5"><i class="bi bi-stopwatch me-1"></i> 12s</span>`.
  - Indicador `VS` estilizado.
- **Card da API (Lado Direito - `col-12 col-md-5 text-md-end`)**:
  - Avatar do Boss (`bi-cpu-fill text-danger fs-3`).
  - Nome: *"A.P.I. Core"*.
  - Barra de Vida/Integridade da API (`progress mb-2` com `progress-bar bg-danger`).
  - Status da API: *"Calculando probabilidades..."*.

#### B. Card Central da Pergunta
- Contêiner: `<div class="card shadow-lg border-0 mb-4">`
- Cabeçalho: Categoria da pergunta e badge de dificuldade.
- Corpo:
  - Pergunta em tipografia de destaque: `<h2 class="card-title fw-bold text-center py-3">Qual é a capital de França?</h2>`
  - Área opcional de mídia (bandeira ou imagem de suporte com classe `img-fluid rounded`).

#### C. Grid de Alternativas (4 Opções)
- Contêiner: `<div class="row row-cols-1 row-cols-md-2 g-3" id="quiz-options">`
- Estilo dos Botões de Alternativa:
  - `<button class="btn btn-outline-light btn-lg p-3 w-100 text-start d-flex align-items-center justify-content-between option-btn">`
  - Letra identificadora: `<span class="badge bg-secondary-subtle text-light rounded-pill px-3 py-2 me-3">A</span>`
  - Texto da alternativa: `<span class="fw-semibold">Paris</span>`
  - Ícone de status dinâmico (visível após clique):
    - Correto: `<i class="bi bi-check-circle-fill text-success fs-4"></i>`
    - Incorreto: `<i class="bi bi-x-circle-fill text-danger fs-4"></i>`

#### D. Feedbacks de Interação & Transição
- Feedback Visual:
  - Botão clicado correto ganha classe `btn-success shadow` com efeito de pulso.
  - Botão clicado incorreto ganha classe `btn-danger shadow` com efeito de vibração (shake).
  - Alternativa correta revelada automaticamente caso o jogador erre.
- Banner de Ação Inferior:
  - Exibe Toast ou Alert Bootstrap flutuante com a mensagem do turno:
    - *"Ataque Crítico! Você causou 25 de dano à API! (+150 pontos)"*
    - *"Defesa da API ativada! Você perdeu 20 de HP!"*
  - Botão "Próxima Pergunta" (`btn btn-primary btn-lg mt-3 w-100`) ou auto-avanço após 1.5s.

---

### 2.4 Visão 3: Tela de Fim de Jogo (Resultados & Pódio)
Apresentada após o término das rodadas ou esgotamento de HP:

- **Banner de Conclusão**:
  - **Vitória**: Ícone `<i class="bi bi-trophy-fill text-warning display-1"></i>`, título *"Você Venceu a A.P.I.!"*, classes `border-success`.
  - **Derrota**: Ícone `<i class="bi bi-shield-slash-fill text-danger display-1"></i>`, título *"A Máquina Prevaleceu!"*, classes `border-danger`.
- **Quadro de Estatísticas (`row g-3`)**:
  - Pontuação Total (`col-6 col-md-3` com Card e badge `fs-3`).
  - Precisão de Acertos (% de acerto).
  - Maior Sequência de Combos (`Streak`).
  - Tempo Médio por Resposta.
- **Painel de Recordes / Salvamento Local**:
  - Salva automaticamente no `localStorage`.
  - Se for novo recorde, exibe badge comemorativo `Novo Recorde Pessoal! 🎉`.
- **Ações de Replay**:
  - Botão "Jogar Novamente" (`btn-primary btn-lg`).
  - Botão "Alterar Configurações / Lobby" (`btn-outline-secondary`).
  - Botão "Ver Ranking Completo" (`btn-outline-info`).

---

### 2.5 Componentes Utilitários & Modais Bootstrap

#### Modal de Regras (`#modalRegras`)
- `<div class="modal fade" id="modalRegras" tabindex="-1">`
- Abas com Navegação Bootstrap (`nav nav-pills`):
  - **Como Funciona o Duelo**: Explica o conceito do confronto contra a API.
  - **Sistema de Pontuação**: Explica bônus de velocidade e multiplicadores de combo.
  - **APIs Conectadas**: Explicação da fonte de dados (Rest Countries V5).

#### Offcanvas de Ranking Local (`#offcanvasRanking`)
- `<div class="offcanvas offcanvas-end" id="offcanvasRanking" tabindex="-1">`
- Exibe tabela Bootstrap com histórico de partidas:
  - Posição, Nome, Pontuação, Data, Modo de Jogo.
  - Botão utilitário para "Limpar Histórico".

#### Componentes de Feedback (Toasts)
- Utilização de `bootstrap.Toast` para notificações não invasivas:
  - "Conexão com a API estabelecida com sucesso."
  - "Perguntas carregadas e embaralhadas."
  - "Novo recorde registrado!"

---

## 3. Diretrizes de Responsividade (Mobile-First)

| Breakpoint | Ajustes de Layout |
| :--- | :--- |
| **Mobile (`< 576px`)** | HUD empilhado (Jogador no topo, API abaixo ou condensada em barra única). Alternativas em 1 coluna vertical (`row-cols-1`). Botões com padding reforçado para toque (`min-height: 54px`). |
| **Tablet (`576px - 991px`)** | HUD em 2 colunas com o centro condensado. Alternativas em 2 colunas (`row-cols-2`). Margens reduzidas nos cards. |
| **Desktop (`>= 992px`)** | Container centralizado com largura máxima (`max-width: 900px`). HUD completo com avatares, barras de progresso duplas e animações de hover. |

---

## 4. Estrutura de Ícones (Mapeamento Bootstrap Icons)

| Função / Elemento | Ícone Bootstrap | Classe |
| :--- | :--- | :--- |
| **Marca / Logo** | CPU / Chip | `bi bi-cpu-fill` |
| **Jogador / Usuário** | Avatar / Perfil | `bi bi-person-fill` |
| **API / Oponente** | Robô / Servidor | `bi bi-robot` ou `bi bi-hdd-network-fill` |
| **Resposta Correta** | Checado circular | `bi bi-check-circle-fill text-success` |
| **Resposta Incorreta** | X circular | `bi bi-x-circle-fill text-danger` |
| **Pontuação / Troféu** | Troféu | `bi bi-trophy-fill text-warning` |
| **Combo / Sequência** | Fogo | `bi bi-fire text-danger` |
| **Tempo / Cronômetro** | Cronômetro | `bi bi-stopwatch` |
| **Reiniciar / Jogar** | Play / Repetir | `bi bi-arrow-clockwise` / `bi bi-play-fill` |
| **Configurações** | Engrenagem | `bi bi-gear-fill` |
| **Regras / Informações** | Dúvida / Info | `bi bi-question-circle-fill` |
