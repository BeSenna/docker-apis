const path = require('node:path');
const dotenv = require('dotenv');

// O caminho é relativo a este arquivo, independentemente do diretório do terminal.
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const port = Number(process.env.PORT || 3002);
const peerUrl = process.env.API_A_URL;

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT deve ser um número entre 1 e 65535.');
}

if (!peerUrl) {
  throw new Error('Defina API_A_URL no arquivo .env.');
}

const url = new URL(peerUrl);
if (!['http:', 'https:'].includes(url.protocol)) {
  throw new Error('API_A_URL deve começar com http:// ou https://.');
}

module.exports = {
  port,
  peerHealthcheckUrl: `${peerUrl.replace(/\/+$/, '')}/healthcheck`,
};
