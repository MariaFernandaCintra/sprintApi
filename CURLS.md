# ***Endpoints***
#### [@fogazzaa](https://github.com/Fogazzaa)

Após `Login` ou `Cadastro` armazene o `token` para fazer as próximas requisições em Rotas Protegidas, não se esqueca também de substituir `{idUsuario}, {idReserva}, {idSala}` em requisições de `PUT, GET e DELETE` por valores válidos.

## - *Usuários*

#### - Cadastro

#### Criar um novo usuário
```http
POST /reservas/v1/cadastro
```
##### Exemplo de requisição:
```sh
curl --location 'http://localhost:5000/reservas/v1/cadastro' \
--header 'Content-Type: application/json' \
--data-raw '{
    "nome": "Gustavo Almeida",
    "email":"gustavo.almeida@docente.senai.br",
    "NIF":"5439871",
    "senha":"gustavo.9871",
    "confirmarSenha":"gustavo.9871"
}'
```

---

#### - Login

#### Autenticação do usuário
```http
POST /reservas/v1/login
```
##### Exemplo de requisição:
```sh
curl --location 'http://localhost:5000/reservas/v1/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email":"gustavo.almeida@docente.senai.br",
    "senha":"gustavo.9871"
}'
```

---
#### - getAllUsuarios

#### Retornar todos os usuários
```http
GET /reservas/v1/usuarios
```
##### Exemplo de requisição:
```sh
curl --location 'http://localhost:5000/reservas/v1/usuarios' \
--header 'Content-Type: application/json' \
--header 'Authorization: {tokenUsuario}'
```

---
#### - getUsuarioById

#### Retorna um usuário específico
```http
GET /reservas/v1/usuario/perfil/{idUsuario}
```
##### Exemplo de requisição:
```sh
curl --location 'http://localhost:5000/reservas/v1/usuario/perfil/{idUsuario}' \
--header 'Authorization: {tokenUsuario}'
```

---
#### - putUsuario

#### Atualizar um usuário específico
```http
PUT /reservas/v1/usuario/{idUsuario}
```
##### Exemplo de requisição:
```sh
curl --location --request PUT 'http://localhost:5000/reservas/v1/usuario/{idUsuario}' \
--header 'Content-Type: application/json' \
--header 'Authorization: {tokenUsuario}' \
--data-raw '{
    "nome": "Renata Souza",
    "email":"renata.souza@docente.senai.br",
    "senha":"renata.9871"
}'
```
---
#### - deleteUsuario

#### Deletar um usuário específico
```http
DELETE /reservas/v1/usuario/{idUsuario}
```
##### Exemplo de requisição:
```sh
curl --location --request DELETE 'http://localhost:5000/reservas/v1/usuario/{idUsuario}' \
--header 'Content-Type: application/json' \
--header 'Authorization: {tokenUsuario}'
```

### *Reservas do Usuário pelo (id_usuario)*

#### Retornar as reservas de um usuário específico
```http
GET /reservas/v1/usuario/perfil/{idUsuario}/reservas'
```
##### Exemplo de requisição:
```sh
curl --location 'http://localhost:5000/reservas/v1/usuario/perfil/{idUsuario}/reservas' \
--header 'Authorization: {tokenUsuario}'
```

### * *Histórico* de Reservas do Usuário pelo (id_usuario)*

#### Retornar as reservas de um usuário específico
```http
GET /reservas/v1/usuario/perfil/{idUsuario}/reservas'
```
##### Exemplo de requisição:
```sh
curl --location 'http://localhost:5000/reservas/v1/usuario/historico/{idUsuario}' \
--header 'Authorization: {tokenUsuario}'
```

### * *Histórico* de Reservas **Deletadas** do Usuário pelo (id_usuario)*

#### Retornar as reservas de um usuário específico
```http
GET /reservas/v1/usuario/perfil/{idUsuario}/reservas'
```
##### Exemplo de requisição:
```sh
curl --location 'http://localhost:5000/reservas/v1/usuario/historico/delecao/{idUsuario}' \
--header 'Authorization: {tokenUsuario}'
```

## - *Reservas*

#### - createReserva

#### Criar uma reserva
```http
POST /reservas/v1/reserva
```
##### Exemplo de requisição:
```sh
curl --location 'http://localhost:5000/reservas/v1/reserva' \
--header 'Content-Type: application/json' \
--header 'Authorization: {tokenUsuario}' \
--data '{
    "fk_id_usuario": "{idUsuario}",
    "fk_id_sala": "{idSala}",
    "data": "2025-12-31",
    "hora_inicio": "12:00:00",
    "hora_fim": "13:00:00"
}'
```

---
#### - getAllReservas
#### Retornar todas as reservas
```http
GET /reservas/v1/reservas
```
##### Exemplo de requisição:
```sh
curl --location 'http://localhost:5000/reservas/v1/reservas' \
--header 'Authorization: {tokenUsuario}'
```

---
#### - putReserva
#### Atualizar uma reserva específica
```http
PUT /reservas/v1/reserva/{idReserva}
```
##### Exemplo de requisição:
```sh
curl --location --request PUT 'http://localhost:5000/reservas/v1/reserva/`{idReserva}`' \
--header 'Content-Type: application/json' \
--header 'Authorization: {tokenUsuario}' \
--data '{ 
    "data": "2025-12-31", 
    "hora_inicio": "13:00:00", 
    "hora_fim": "14:00:00"
}'
```

---
#### - deleteReserva
#### Deletar uma reserva específica
```http
DELETE /reservas/v1/reserva/{idReserva}
```
##### Exemplo de requisição:
```sh
curl --location --request DELETE 'http://localhost:5000/reservas/v1/reserva/{idReserva}' \
--header 'Content-Type: application/json' \
--header 'Authorization: {tokenUsuario}'
```

## - *Salas*

#### - createSala
#### Criar uma nova sala
```http
POST /reservas/v1/sala
```
##### Exemplo de requisição:
```sh
curl --location 'http://localhost:5000/reservas/v1/sala' \
--header 'Content-Type: application/json' \
--data '{
    "nome":"SALA TESTE",
    "descricao":"Descrição",
    "bloco":"A",
    "tipo":"Oficina",
    "capacidade":"100"
}'
```

---
#### - getAllSalas
#### Retornar todas as salas
```http
GET /reservas/v1/salas
```
##### Exemplo de requisição:
```sh
curl --location 'http://localhost:5000/reservas/v1/salas' \
--header 'Authorization: {tokenUsuario}'
```

---
#### - putSala
#### Atualizar uma sala específica
```http
PUT /reservas/v1/sala/{idSala}
```
##### Exemplo de requisição:
```sh
curl --location --request PUT 'http://localhost:5000/reservas/v1/sala/1' \
--header 'Content-Type: application/json' \
--data '{
    "nome":"SALA TESTE - PUT",
    "descricao":"Descrição - PUT",
    "bloco":"A",
    "tipo":"Oficina",
    "capacidade":"20"
}'
```

---
#### - deleteSala
#### Deletar uma sala específica
```http
DELETE /reservas/v1/sala/{idSala}
```
##### Exemplo de requisição:
```sh
curl --location --request DELETE 'http://localhost:5000/reservas/v1/sala/1' \
--data ''
```

---

### *Salas Disponíveis por Horário*

#### Retornar salas disponíveis em um determinado horário
```http
GET /reservas/v1/salasdisponivelhorario
```
##### Exemplo de requisição:
```sh
curl --location 'http://localhost:5000/reservas/v1/salasdisponivelhorario' \
--header 'Content-Type: application/json' \
--header 'Authorization: {tokenUsuario}' \
--data '{
    "data": "2025-12-31",
    "hora_inicio": "07:00:00",
    "hora_fim": "08:00:00"
}'
```