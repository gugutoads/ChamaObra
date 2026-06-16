const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { db } = require('../database');
const { pagamentos, propostas, servicos } = require('../database/schema');
const { eq } = require('drizzle-orm');

async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // O webhook do Stripe requer o corpo bruto (raw body) para verificação de assinatura
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...'
    );
  } catch (err) {
    console.error('Erro na verificação da assinatura do Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const propostaId = session.metadata.propostaId;
    const valor = session.amount_total / 100;

    try {
      // 1. Criar registro de pagamento
      await db.insert(pagamentos).values({
        propostaId: parseInt(propostaId),
        valor: String(valor),
        status: 'PAGO',
        metodo_pagamento: 'STRIPE',
        data_pagamento: new Date(),
      });

      // 2. Atualizar status da proposta
      await db.update(propostas)
        .set({ status: 'ACEITA' })
        .where(eq(propostas.id, parseInt(propostaId)));

      // 3. Buscar o servicoId da proposta para atualizar o status do serviço
      const [proposta] = await db.select().from(propostas).where(eq(propostas.id, parseInt(propostaId)));
      if (proposta) {
        await db.update(servicos)
          .set({ status: 'INICIADA' })
          .where(eq(servicos.id, proposta.servicoId));
      }

      console.log(`Pagamento confirmado para proposta ${propostaId}`);
    } catch (err) {
      console.error('Erro ao processar pagamento no webhook:', err);
      return res.status(500).send('Internal Server Error');
    }
  }

  res.json({ received: true });
}

module.exports = {
  handleWebhook,
};
