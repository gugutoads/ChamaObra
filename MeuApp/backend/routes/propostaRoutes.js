const express = require('express');
const router = express.Router();
const { db, pool } = require('../database');
const { propostas, usuarios, servicos } = require('../database/schema');
const { eq, desc } = require('drizzle-orm');
const authMiddleware = require('../middlewares/auth');

router.post('/', authMiddleware, async (req, res) => {
  const { servicoId, valor, prazo, descricao } = req.body;
  const prestadorId = req.userId;

  try {
    const result = await db.insert(propostas).values({
      servicoId: parseInt(servicoId),
      prestadorId,
      valor: String(valor),
      prazo,
      descricao,
      status: 'PENDENTE',
    });

    res.status(201).json({ id: result.insertId, message: 'Proposta enviada!' });
  } catch (err) {
    console.error('Erro ao criar proposta:', err);
    res.status(500).json({ error: 'Erro ao criar proposta' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      `SELECT p.*,
              u.nome as prestadorNome,
              u.servico as prestadorServico,
              u.experiencia as prestadorExperiencia,
              s.titulo as servicoTitulo,
              s.endereco as servicoLocalizacao,
              s.clienteId as clienteId,
              c.nome as clienteNome
       FROM propostas p
       JOIN usuarios u ON p.prestadorId = u.id
       JOIN servicos s ON p.servicoId = s.id
       LEFT JOIN usuarios c ON s.clienteId = c.id
       WHERE p.id = ?`,
      [id]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error('Erro ao buscar proposta:', err);
    res.status(500).json({ error: 'Erro ao buscar proposta' });
  }
});

router.get('/servico/:servicoId', async (req, res) => {
  const { servicoId } = req.params;

  try {
    const result = await db.select().from(propostas)
      .where(eq(propostas.servicoId, parseInt(servicoId)))
      .orderBy(desc(propostas.id));

    res.json(result);
  } catch (err) {
    console.error('Erro ao buscar propostas:', err);
    res.status(500).json({ error: 'Erro ao buscar propostas' });
  }
});

router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.update(propostas).set({ status }).where(eq(propostas.id, parseInt(id)));
    res.json({ message: 'Status atualizado!' });
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

router.patch('/:id/agendamento', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { data_agendada, horario_agendado } = req.body;

  try {
    await db.update(propostas).set({
      data_agendada: data_agendada ? new Date(data_agendada) : null,
      horario_agendado,
    }).where(eq(propostas.id, parseInt(id)));

    res.json({ message: 'Agendamento atualizado!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

module.exports = router;