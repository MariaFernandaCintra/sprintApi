# SrintFront

Este é o front-end de um sistema de reservas desenvolvido durante um sprint.

## Descrição

O projeto consiste em uma tela de login, cadastro. Desenvolvida com React e configurada com Vite. A interface utiliza componentes do Material-UI, juntamente com bibliotecas de estilização como Emotion e Styled-Components, para criar um visual limpo e moderno. O uso de Axios e React Router DOM possibilita a integração com APIs e a navegação interna entre as páginas da aplicação.

## Tecnologias Utilizadas

- **React** – Biblioteca JavaScript para construção de interfaces de usuário.
- **Vite** – Ferramenta de build e desenvolvimento rápido para projetos modernos.
- **Material-UI** – Biblioteca de componentes para React que implementa o Material Design.
- **Emotion & Styled-Components** – Bibliotecas para estilização de componentes.
- **Axios** – Cliente HTTP para realizar requisições a APIs.
- **React Router DOM** – Solução para gerenciamento de rotas na aplicação.

## Estrutura do Projeto

- **public/**: Arquivos públicos, incluindo o _index.html_ que carrega a aplicação.
- **src/**: Código-fonte da aplicação (componentes, páginas, estilos e lógica).
- **img/**: Imagens e ícones utilizados na interface.
- Arquivos de configuração:
  - `.gitignore`
  - `package.json`
  - `vite.config.js`
  - `eslint.config.js`

## Como Executar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado.

### Passos para Instalação da sprinFront

1. **Clonar o repositório**

   ```bash
   git clone https://github.com/MariaFernandaCintra/sprintFront.git

   ```

2. **Entre na Pasta**

   ```bash
   cd sprintFront
   ```

3. **Instalar as Dependências**

   - Se estiver usando npm, execute:

   ```bash
      npm install
   ```

4. **Iniciar o Servidor de Desenvolvimento**
   - Com npm, execute:
   ```bash
      npm run dev
   ```

### Dependências Necessárias

1. **Material UI (MUI)**

- Para utilizar os componentes de UI do Material-UI:

  ```bash
    npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
  ```

  2. **Axios:**

- Para integrar com a API utilizando Axios, instale::

  ```bash
     npm i axios
  ```

  1. **React Router DOM**

- Para gerenciar a navegação entre as páginas:
  ```bash
     npm install react-router-dom
  ```
