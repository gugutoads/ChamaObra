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
    let query = db.select().from(mensagens);

    if (propostaId) {
      query = query.where(eq(mensagens.servicoId, parseInt(servicoId)))
        .where(eq(mensagens.propostaId, parseInt(propostaId)));
    } else {
      query = query.where(eq(mensagens.servicoId, parseInt(servicoId)));
    }

    const rows = await query.orderBy(asc(mensagens.createdAt));

    // Buscar nome do remetente para cada mensagem
    const resultWithSender = await Promise.all(rows.map(async (msg) => {
      const [user] = await db.select({
        nome: usuarios.nome,
        tipo: usuarios.tipo,
      }).from(usuarios).where(eq(usuarios.id, msg.remetenteId));

      return {
        ...msg,
        remetenteNome: user?.nome || '',
        remetenteTipo: user?.tipo || '',
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
    const result = await pool.query(`
      SELECT DISTINCT
        m."servicoId",
        m."propostaId",
        m."destinatarioId",
        m."remetenteId",
        s.titulo as servicoTitulo,
        CASE
          WHEN m."destinatarioId" = $1 THEN m."remetenteId"
          ELSE m."destinatarioId"
        END as outroUsuarioId,
        u.nome as outroUsuarioNome,
        u.tipo as outroUsuarioTipo,
        (SELECT mensagem FROM "mensagens" WHERE "servicoId" = m."servicoId" AND "propostaId" = m."propostaId" ORDER BY created_at DESC LIMIT 1) as ultimaMensagem,
        (SELECT created_at FROM "mensagens" WHERE "servicoId" = m."servicoId" AND "propostaId" = m."propostaId" ORDER BY created_at DESC LIMIT 1) as ultimaMensagemData,
        (SELECT COUNT(*) FROM "mensagens" WHERE "servicoId" = m."servicoId" AND "destinatarioId" = $2 AND lida = FALSE) as msgsNaoLidas
      FROM "mensagens" m
      LEFT JOIN "servicos" s ON m."servicoId" = s.id
      LEFT JOIN "usuarios" u ON u.id = CASE WHEN m."destinatarioId" = $3 THEN m."remetenteId" ELSE m."destinatarioId" END
      WHERE m."remetenteId" = $4 OR m."destinatarioId" = $5
      ORDER BY ultimaMensagemData DESC
    `, [userId, userId, userId, userId, userId]);

    res.json(result.rows);
  } catch (err) {
    console.log('Erro ao buscar conversas:', err);
    res.status(500).json({ error: 'Erro ao buscar conversas' });
  }
});

module.exports = router;