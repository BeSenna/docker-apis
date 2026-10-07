const express = require('express');
const { port } = require('./config');
const { consultarOutraApi } = require('./healthcheck.service');
const { iniciarCron } = require('./healthcheck.cron');

const app = express();

// Healthcheck local: responde sem depender da outra API.
app.get('/healthcheck', (req, res) => {
  res.type('text/plain').send('APIB OK');
});

// Permite testar manualmente a mesma consulta realizada pela cron.
app.get('/healthcheck-api-a', async (req, res) => {
  try {
    const mensagem = await consultarOutraApi();
    res.type('text/plain').send(mensagem);
  } catch (error) {
    console.error(`[APIB] Falha ao consultar APIA: ${error.message}`);
    res.status(503).type('text/plain').send('Healtcheck da APIA: indisponível');
  }
});

let tarefa;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`APIB disponível em http://localhost:${port}`);
  console.log('Cron ativa: consulta o healthcheck da APIA a cada 30 segundos.');
  tarefa = iniciarCron();
});

server.on('error', (error) => {
  console.error(`[APIB] Não foi possível iniciar: ${error.message}`);
  process.exit(1);
});

// Encerra a cron e o servidor ao pressionar Ctrl+C ou receber SIGTERM.
function encerrar() {
  if (tarefa) tarefa.stop();
  server.close(() => process.exit(0));
}
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
