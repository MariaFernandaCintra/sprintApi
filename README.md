# SprintApi

Este é o back-end da aplicação Sprint, um sistema de reservas e navegação desenvolvido durante um sprint. Este projeto fornece a API responsável pelo processamento dos dados, integração com serviços externos e gerenciamento das operações do sistema.

## Descrição

A Sprint API foi desenvolvida utilizando Node.js e Express, oferecendo endpoints RESTful para serem consumidos pelo front-end. A API se integra a serviços externos para fornecer dados em tempo real sobre tempos de deslocamento, localização de veículos e outras informações relevantes. São implementadas práticas modernas de desenvolvimento, como uso de middlewares para validação, logging e tratamento de erros.

## Tecnologias Utilizadas

- **Node.js** – Ambiente de execução JavaScript para o desenvolvimento do back-end.
- **Express** – Framework para construção de APIs e servidores HTTP.
- **Cors** – Middleware para habilitar requisições cross-origin.
- **Axios** – Para realizar requisições HTTP a APIs externas.

## Estrutura do Projeto

- **src/**: Código-fonte da aplicação, incluindo:
  - **routes/**: Definição das rotas da API.
  - **controllers/**: Lógica dos endpoints da API.
  - **middlewares/**: Funções middleware para autenticação, logging e tratamento de erros.
  - **config/**: Arquivos de configuração, como a conexão com o banco de dados e variáveis de ambiente.
- Arquivos de configuração:
  - `.env` – Arquivo para as variáveis de ambiente.
  - `.gitignore`
  - `package.json`

## Como Executar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado.

### Passos para Instalação

1. **Clonar o Repositório**

   ```bash
    git clone https://github.com/MariaFernandaCintra/sprintApi.git

   ```

2. **Entre na Pasta**

   ```bash
    cd sprintApi
   ```

3. **Instalar as Dependências**

- Se estiver usando npm, execute:

  ```bash
    npm i
  ```

4. **Iniciar o Servidor de Desenvolvimento**

- Com npm, execute:
  ```bash
    npm start
  ```

### Dependências Necessárias

1. **Express**

- Para construir a API:

  ```bash
    npm i express
  ```

2. **Cors**

- Para habilitar CORS e permitir requisições de outros domínios:

  ```bash
    npm i cors
  ```

3. **Axios**

- Para integrar com a API utilizando Axios, instale:

  ```bash
    npm i axios
  ```
