const express = require('express');
const { port } = require('./config');
const { consultarOutraApi } = require('./healthcheck.service');
const { iniciarCron } = require('./healthcheck.cron');

const app = express();

// Healthcheck local: responde sem depender da outra API.
app.get('/healthcheck', (req, res) => {
  res.type('text/plain').send('APIA OK');
});

// Permite testar manualmente a mesma consulta realizada pela cron.
app.get('/healthcheck-api-b', async (req, res) => {
  try {
    const mensagem = await consultarOutraApi();
    res.type('text/plain').send(mensagem);
  } catch (error) {
    console.error(`[APIA] Falha ao consultar APIB: ${error.message}`);
    res.status(503).type('text/plain').send('Healtcheck da APIB: indisponível');
  }
});

let tarefa;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`APIA disponível em http://localhost:${port}`);
  console.log('Cron ativa: consulta o healthcheck da APIB a cada 30 segundos.');
  tarefa = iniciarCron();
});

server.on('error', (error) => {
  console.error(`[APIA] Não foi possível iniciar: ${error.message}`);
  process.exit(1);
});

// Encerra a cron e o servidor ao pressionar Ctrl+C ou receber SIGTERM.
function encerrar() {
  if (tarefa) tarefa.stop();
  server.close(() => process.exit(0));
}
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
