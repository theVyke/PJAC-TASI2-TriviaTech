# 🚀 PLANO MESTRE DE ORQUESTRAÇÃO - TRIVIATECH

> **Status do Projeto**: Concluído com Sucesso ✅  
> **Objetivo**: Reestruturação completa do frontend para minigame "Jogador vs API", incorporando Bootstrap 5 completo (CSS, JS, Ícones, Responsividade) e arquitetura desacoplada de serviços para integração futura de múltiplas APIs.

---

## 📋 Sumário das Fases de Execução

### Fase 1: Fundação & Infraestrutura Bootstrap (Setup)
- [x] **1.1 Dependências**:
  - Instalar Bootstrap 5 e Bootstrap Icons via NPM (`bootstrap`, `@popperjs/core`, `bootstrap-icons`).
  - Importar estilos e scripts no bundle Vite (`script.js`).
- [x] **1.2 Estrutura de Arquivos Modular**:
  - Organizar diretórios de código fonte:
    - `src/services/` (adaptadores de API, chamadas Axios, interfaces genéricas de perguntas).
    - `src/game/` (lógica do minigame, controle de estados, placar, streak, vidas).
    - `src/ui/` (renderização e manipulação do DOM com componentes Bootstrap).
    - `src/storage/` (armazenamento e recuperação de rankings no `localStorage`).

### Fase 2: Reestruturação do HTML & Layout Responsivo (UI/UX)
- [x] **2.1 Shell da Aplicação & Header**:
  - Barra de navegação com tema escuro/claro, status de conectividade e atalhos para regras e ranking.
- [x] **2.2 Tela de Lobby (Configuração do Desafio)**:
  - Card de apresentação do Boss ("Core API: Rest Countries").
  - Configuração do jogador (nome, avatar, seleção de modo de jogo e cronômetro).
- [x] **2.3 Arena de Duelo (HUD do Confronto + Card de Perguntas)**:
  - HUD "Jogador vs API" com avatares, barras de progresso (HP/Energia e Pontuação) e streak.
  - Card central da pergunta estilizado com badges de categoria e dificuldade.
  - Grid responsivo de alternativas (2x2 desktop, 1 coluna mobile) com estados normais, hover, correto e errado.
  - Painel de feedback imediato de dano/pontuação e botão de próxima rodada.
- [x] **2.4 Tela de Fim de Jogo (Resultados & Recordes)**:
  - Banner de vitória/derrota estilizado.
  - Painel de métricas (pontos, precisão, maior combo, tempo médio).
  - Ações para jogar novamente ou revisar ranking.
- [x] **2.5 Componentes Modais & Offcanvas**:
  - Modal de Instruções/Regras do Jogo.
  - Offcanvas de Placar/Recordes Locais.

### Fase 3: Camada de Game Engine & Lógica do Confronto
- [x] **3.1 Máquina de Estados do Minigame**:
  - Estados: `LOBBY` -> `LOADING` -> `QUESTION_ACTIVE` -> `ANSWER_EVALUATED` -> `GAME_OVER`.
- [x] **3.2 Sistema de Pontuação e Gamificação**:
  - Mecânica de acertos contínuos (combos / multiplicadores `1x`, `1.25x`, `1.5x`, `2x`).
  - Cálculo de dano à API / dano ao jogador baseado em precisão e tempo de resposta.
  - Temporizador opcional regressivo por rodada.
- [x] **3.3 Persistência Local**:
  - Salvar partidas e recordes no `localStorage` e renderizar no ranking.

### Fase 4: Abstração e Extensibilidade de APIs (Service Adapter Pattern)
- [x] **4.1 Interface Padrão de Perguntas (`QuestionProvider`)**:
  - Padronizar contrato de dados retornado por qualquer API (`StandardQuestion`).
- [x] **4.2 Refatoração do Serviço RestCountries**:
  - Adaptar a chamada do `script.js` para cumprir o contrato do `QuestionProvider`.
  - Tratamento resiliente de erros com spinners e fallback offline.
- [x] **4.3 Preparação para Múltiplas APIs (Futuro)**:
  - Estrutura pronta para plugar OpenTriviaDB, API de Conhecimentos Gerais e gerador aleatório de categorias sem alterar a UI.

### Fase 5: Refinamento, Acessibilidade & Testes
- [x] **5.1 Testes de Responsividade**:
  - Verificação de grid responsivo mobile-first com classes utilitárias Bootstrap.
- [x] **5.2 Acessibilidade & Usabilidade (A11y)**:
  - Atributos `aria-*`, navegação por teclado e semântica correta.
- [x] **5.3 Validação de Linter e Build**:
  - ESLint e Vite Build (`npm run build`) executados com 100% de sucesso.
