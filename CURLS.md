# ***Endpoints***
#### [@fogazzaa](https://github.com/Fogazzaa)

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
    "email":"gustavo.almeida@example.com",
    "NIF":"5439871",
    "senha":"senha123"
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
    "email":"gustavo.almeida@example.com",
    "senha":"senha123"
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
--header 'Content-Type: application/json'
```

---
#### - getUsuarioById

#### Retorna um usuário específico
```http
GET /reservas/v1/usuario/perfil/{id}
```
##### Exemplo de requisição:
```sh
curl --location 'http://localhost:5000/reservas/v1/usuario/perfil/1' \
--header 'Content-Type: application/json'
```

---
#### - putUsuario

#### Atualizar um usuário específico
```http
PUT /reservas/v1/usuario/{id}
```
##### Exemplo de requisição:
```sh
curl --location --request PUT 'http://localhost:5000/reservas/v1/usuario/1' \
--header 'Content-Type: application/json' \
--data-raw '{
    "nome": "Renata Souza",
    "email":"renata.souza@example.com",
    "senha":"senha456"
}'
```
---
#### - deleteUsuario

#### Deletar um usuário específico
```http
DELETE /reservas/v1/usuario/{id}
```
##### Exemplo de requisição:
```sh
curl --location --request DELETE 'http://localhost:5000/reservas/v1/usuario/1' \
--header 'Content-Type: application/json' \
--data ''
```

### *Reservas do Usuário pelo (id_usuario)*

#### Retornar as reservas de um usuário específico
```http
GET /reservas/v1/usuario/perfil/{id}/reservas'
```
##### Exemplo de requisição:
```sh
curl --location 'http://localhost:5000/reservas/v1/usuario/perfil/1/reservas' \
--header 'Content-Type: application/json'
```

## - *Reservas*

#### - createReserva

#### Criar uma reserva
```http
POST /reservas/v1/reserva
```
##### Exemplo de requisição:
```sh
curl --location --request POST 'http://localhost:5000/reservas/v1/reserva' \
--header 'Content-Type: application/json' \
--data '{
    "fk_id_usuario": "1",
    "fk_id_sala": "1",
    "data": "2025-12-31",
    "hora_inicio": "07:00:00",
    "hora_fim": "07:50:00"
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
curl --location 'http://localhost:5000/reservas/v1/reservas'
```

---
#### - putReserva
#### Atualizar uma reserva específica
```http
PUT /reservas/v1/reserva/{id}
```
##### Exemplo de requisição:
```sh
curl --location --request PUT 'http://localhost:5000/reservas/v1/reserva/1' \
--header 'Content-Type: application/json' \
--data '{ 
    "data": "2025-12-31", 
    "hora_inicio": "07:50:00", 
    "hora_fim": "08:40:00"
}'
```

---
#### - deleteReserva
#### Deletar uma reserva específica
```http
DELETE /reservas/v1/reserva/{id}
```
##### Exemplo de requisição:
```sh
curl --location --request DELETE 'http://localhost:5000/reservas/v1/reserva/1' \
--header 'Content-Type: application/json' \
--data ''
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
--data ''
```

---
#### - putSala
#### Atualizar uma sala específica
```http
PUT /reservas/v1/sala/{id}
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
DELETE /reservas/v1/sala/{id}
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
curl --location --request GET 'http://localhost:5000/reservas/v1/salasdisponivelhorario' \
--header 'Content-Type: application/json' \
--data '{
    "data": "2025-12-31",
    "hora_inicio": "07:00:00",
    "hora_fim": "07:50:00"
}'
```