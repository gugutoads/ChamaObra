const express = require('express');
const router = express.Router();
const { db, pool } = require('../database');
const { mensagens, usuarios, servicos } = require('../database/schema');
const { eq, asc, or, and } = require('drizzle-orm');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, async (req, res) => {
  const { servicoId, propostaId, destinatarioId, mensagem } = req.body;
  const remetenteId = req.userId;

  try {
    const result = await db.insert(mensagens).values({
      servicoId: parseInt(servicoId),
      propostaId: propostaId ? parseInt(propostaId) : null,
      remetenteId,
      destinatarioId: parseInt(destinatarioId),
      mensagem,
    });

    res.status(201).json({ id: result.insertId, message: 'Mensagem enviada!' });
  } catch (err) {
    console.log('Erro ao enviar mensagem:', err);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  const { servicoId, propostaId } = req.query;
  const userId = req.userId;

  try {
    let result;
    if (propostaId) {
      result = await db.select({
        id: mensagens.id,
        servicoId: mensagens.servicoId,
        propostaId: mensagens.propostaId,
        remetenteId: mensagens.remetenteId,
        destinatarioId: mensagens.destinatarioId,
        mensagem: mensagens.mensagem,
        lida: mensagens.lida,
        created_at: mensagens.created_at,
      }).from(mensagens)
        .where(eq(mensagens.servicoId, parseInt(servicoId)))
        .where(eq(mensagens.propostaId, parseInt(propostaId)))
        .orderBy(asc(mensagens.created_at));
    } else {
      result = await db.select({
        id: mensagens.id,
        servicoId: mensagens.servicoId,
        propostaId: mensagens.propostaId,
        remetenteId: mensagens.remetenteId,
        destinatarioId: mensagens.destinatarioId,
        mensagem: mensagens.mensagem,
        lida: mensagens.lida,
        created_at: mensagens.created_at,
      }).from(mensagens)
        .where(eq(mensagens.servicoId, parseInt(servicoId)))
        .orderBy(asc(mensagens.created_at));
    }

    // Buscar nome do remetente para cada mensagem
    const resultWithSender = await Promise.all(result.map(async (msg) => {
      const [userResult] = await pool.query('SELECT nome, tipo FROM usuarios WHERE id = $1', [msg.remetenteId]);
      const user = userResult[0] || {};
      return {
        ...msg,
        remetenteNome: user.nome,
        remetenteTipo: user.tipo,
      };
    }));

    // Marcar mensagens como lidas
    await db.update(mensagens)
      .set({ lida: true })
      .where(and(
        eq(mensagens.servicoId, parseInt(servicoId)),
        eq(mensagens.destinatarioId, userId)
      ));

    res.json(resultWithSender);
  } catch (err) {
    console.log('Erro ao buscar mensagens:', err);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

router.get('/conversas', authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT
        m.servicoId,
        m.propostaId,
        m.destinatarioId,
        m.remetenteId,
        s.titulo as servicoTitulo,
        CASE
          WHEN m.destinatarioId = $1 THEN m.remetenteId
          ELSE m.destinatarioId
        END as outroUsuarioId,
        u.nome as outroUsuarioNome,
        u.tipo as outroUsuarioTipo,
        (SELECT mensagem FROM mensagens WHERE servicoId = m.servicoId AND propostaId = m.propostaId ORDER BY created_at DESC LIMIT 1) as ultimaMensagem,
        (SELECT created_at FROM mensagens WHERE servicoId = m.servicoId AND propostaId = m.propostaId ORDER BY created_at DESC LIMIT 1) as ultimaMensagemData,
        (SELECT COUNT(*) FROM mensagens WHERE servicoId = m.servicoId AND destinatarioId = $2 AND lida = FALSE) as msgsNaoLidas
      FROM mensagens m
      LEFT JOIN servicos s ON m.servicoId = s.id
      LEFT JOIN usuarios u ON u.id = CASE WHEN m.destinatarioId = $3 THEN m.remetenteId ELSE m.destinatarioId END
      WHERE m.remetenteId = $4 OR m.destinatarioId = $5
      ORDER BY ultimaMensagemData DESC
    `, [userId, userId, userId, userId, userId]);

    res.json(rows);
  } catch (err) {
    console.log('Erro ao buscar conversas:', err);
    res.status(500).json({ error: 'Erro ao buscar conversas' });
  }
});

module.exports = router;