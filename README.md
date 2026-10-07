# Aula prática: duas APIs Node.js

Dois projetos independentes, com Express, dotenv, node-cron e o `fetch` nativo do Node.js. Esta etapa contém somente as APIs; os arquivos de Docker serão criados na próxima etapa.

## Pré-requisitos

- Node.js 22 ou superior e npm.
- Dois terminais, um para cada API.
- Acesso à internet para instalar as dependências.

## Executar

Extraia o ZIP e abra um terminal na pasta `aula-docker-apis`.

**Terminal 1 — API A:**

```bash
cd API-A
npm ci
npm start
```

**Terminal 2 — API B:**

```bash
cd API-B
npm ci
npm start
```

Para reiniciar automaticamente durante alterações no código, use `npm run dev` no lugar de `npm start`. Se alterar o `.env`, reinicie a API.

## Endpoints

Todas as rotas abaixo usam GET e retornam texto simples.

| API | URL | Resposta com as duas APIs ativas |
| --- | --- | --- |
| A | http://localhost:3001/healthcheck | `APIA OK` |
| A | http://localhost:3001/healthcheck-api-b | `Healtcheck da APIB: APIB OK` |
| B | http://localhost:3002/healthcheck | `APIB OK` |
| B | http://localhost:3002/healthcheck-api-a | `Healtcheck da APIA: APIA OK` |

Você pode abrir as URLs no navegador ou usar curl:

```bash
curl http://localhost:3001/healthcheck
curl http://localhost:3002/healthcheck
curl http://localhost:3001/healthcheck-api-b
curl http://localhost:3002/healthcheck-api-a
```

A grafia `Healtcheck` foi mantida nas mensagens solicitadas; as rotas usam `/healthcheck`.

## Tarefa automática a cada 30 segundos

A cron inicia quando o servidor fica disponível. A expressão `*/30 * * * * *` contém seis campos e executa a tarefa nos segundos **00 e 30 de cada minuto**. A primeira execução ocorre na próxima marca do relógio, portanto pode acontecer antes de completar 30 segundos desde a inicialização.

- API A chama `GET /healthcheck` da API B.
- API B chama `GET /healthcheck` da API A.
- Cada tarefa escreve no terminal a data/hora e a mesma mensagem da consulta manual.

Exemplo de saída da API A:

```text
[2026-10-07T03:00:30.000Z] [CRON APIA] Healtcheck da APIB: APIB OK
```

A cron é uma tarefa interna, não um endpoint HTTP. O segundo endpoint de cada API permite executar manualmente a mesma consulta, sem esperar a cron. Ele faz uma nova chamada a cada requisição e não inicia outra tarefa agendada.

O healthcheck local responde diretamente, sem consultar a outra API. Assim, as consultas não geram chamadas recursivas entre os dois serviços.

## Configuração pelo .env

Os arquivos `.env` já estão incluídos com endereços para execução local.

**API-A/.env:**

```dotenv
PORT=3001
API_B_URL=http://localhost:3002
```

**API-B/.env:**

```dotenv
PORT=3002
API_A_URL=http://localhost:3001
```

Informe o endereço **base** da outra API, sem `/healthcheck`. O serviço acrescenta esse caminho ao fazer a chamada. A configuração é carregada do `.env` por dotenv e acessada via `process.env`. Variáveis já definidas no ambiente do processo têm prioridade, o que permite configurar os serviços na próxima etapa da aula.

Há também um `.env.example` em cada projeto. O `.gitignore` evita versionar `.env` e `node_modules`; os `.env` deste ZIP contêm apenas configurações locais de exemplo.

## Organização de cada API

| Arquivo | Responsabilidade |
| --- | --- |
| `src/server.js` | Criar as duas rotas e iniciar o servidor e a cron. |
| `src/config.js` | Ler o `.env` e validar porta e endereço da outra API. |
| `src/healthcheck.service.js` | Consultar o healthcheck remoto com timeout de 5 segundos. |
| `src/healthcheck.cron.js` | Agendar a consulta e registrar sucesso ou falha no terminal. |
| `package.json` | Definir scripts e dependências. |
| `package-lock.json` | Fixar a instalação reproduzível com `npm ci`. |

Cada projeto contém suas próprias dependências e pode ser executado separadamente. O servidor escuta em `0.0.0.0`.

## Exercício de observação

1. Inicie as duas APIs e acesse as quatro URLs da tabela.
2. Observe as consultas automáticas nos terminais durante pelo menos um minuto.
3. Pare a API B com Ctrl+C.
4. Acesse o healthcheck local da API A: ele continua retornando `APIA OK`.
5. Acesse a consulta à API B pela API A: ela retorna HTTP 503 e `Healtcheck da APIB: indisponível`.
6. Observe a falha da cron no terminal da API A. A tarefa continua agendada.
7. Reinicie a API B e observe a consulta manual e a próxima execução da cron voltarem a funcionar.
8. Repita o experimento parando a API A.

Se houver erro de porta em uso, ajuste `PORT` no `.env` da API e atualize o endereço correspondente no `.env` da outra. Reinicie ambas.

## Referências

- Express: https://expressjs.com/en/starter/hello-world/
- node-cron: https://nodecron.com/getting-started.html
- dotenv: https://github.com/motdotla/dotenv#usage
