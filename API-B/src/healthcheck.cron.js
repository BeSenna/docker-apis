const cron = require('node-cron');
const { consultarOutraApi } = require('./healthcheck.service');

function iniciarCron() {
  // Seis campos: segundos, minutos, horas, dia, mês e dia da semana.
  // Executa nos segundos 00 e 30 de cada minuto.
  return cron.schedule('*/30 * * * * *', async () => {
    try {
      const mensagem = await consultarOutraApi();
      console.log(`[${new Date().toISOString()}] [CRON APIB] ${mensagem}`);
    } catch (error) {
      // A outra API pode estar desligada. A cron registra a falha e tenta novamente.
      console.error(
        `[${new Date().toISOString()}] [CRON APIB] Falha ao consultar APIA: ${error.message}`,
      );
    }
  }, { noOverlap: true });
}

module.exports = { iniciarCron };
