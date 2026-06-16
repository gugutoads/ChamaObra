const express = require('express');
const router = express.Router();
const { db, pool } = require('../database');
const { pagamentos, propostas } = require('../database/schema');
const { eq } = require('drizzle-orm');
const authMiddleware = require('../middlewares/auth');
const { createCheckoutSession } = require('../controllers/stripeController');

router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  const { propostaId, valor } = req.body;

  try {
    const sessionUrl = await createCheckoutSession(propostaId, valor);
    res.json({ url: sessionUrl });
  } catch (err) {
    console.error('Erro ao criar Checkout Session:', err);
    res.status(500).json({ error: 'Erro ao processar pagamento com Stripe' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { propostaId, valor, status, metodo_pagamento } = req.body;

  try {
    const result = await db.insert(pagamentos).values({
      propostaId: parseInt(propostaId),
      valor: String(valor),
      status: status || 'PAGO',
      metodo_pagamento: metodo_pagamento || 'ESCROW',
      data_pagamento: new Date(),
    });

    // Atualizar status da proposta para AGUARDANDO_INICIO
    await db.update(propostas)
      .set({ status: 'AGUARDANDO_INICIO' })
      .where(eq(propostas.id, parseInt(propostaId)));

    res.status(201).json({ id: result.insertId, message: 'Pagamento realizado com sucesso!' });
  } catch (err) {
    console.error('Erro ao criar pagamento:', err);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
});

router.get('/proposta/:propostaId', async (req, res) => {
  const { propostaId } = req.params;

  try {
    const result = await db.select().from(pagamentos)
      .where(eq(pagamentos.propostaId, parseInt(propostaId)))
      .limit(1);

    res.json(result[0] || null);
  } catch (err) {
    console.error('Erro ao buscar pagamento:', err);
    res.status(500).json({ error: 'Erro ao buscar pagamento' });
  }
});

module.exports = router;