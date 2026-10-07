const { peerHealthcheckUrl } = require('./config');

// Usada tanto pelo endpoint HTTP quanto pela tarefa agendada.
async function consultarOutraApi() {
  const response = await fetch(peerHealthcheckUrl, {
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`APIA retornou HTTP ${response.status}.`);
  }

  const retorno = await response.text();
  return `Healtcheck da APIA: ${retorno}`;
}

module.exports = { consultarOutraApi };
