const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { servicos, propostas, mensagens, pagamentos } = require('../database/schema');
const { eq, desc } = require('drizzle-orm');
const authMiddleware = require('../middlewares/auth');

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const servicoId = parseInt(id);
  console.log('=== DELETE RECEBIDO PARA ID:', id);

  try {
    // Busca propostas do serviço
    const servicoPropostas = await db.select({ id: propostas.id }).from(propostas).where(eq(propostas.servicoId, servicoId));

    // Deleta pagamentos de cada proposta
    for (const proposta of servicoPropostas) {
      await db.delete(pagamentos).where(eq(pagamentos.propostaId, proposta.id));
    }

    // Deleta mensagens vinculadas ao serviço
    await db.delete(mensagens).where(eq(mensagens.servicoId, servicoId));
    // Deleta propostas vinculadas ao serviço
    await db.delete(propostas).where(eq(propostas.servicoId, servicoId));
    // Por fim, deleta o serviço
    await db.delete(servicos).where(eq(servicos.id, servicoId));
    res.json({ message: 'Serviço excluído!' });
  } catch (err) {
    console.log('=== ERRO NO DELETE:', err);
    res.status(500).json({ error: 'Erro ao excluir serviço' });
  }
});

router.get('/', async (req, res) => {
  const { status } = req.query;

  try {
    let result;
    if (status) {
      result = await db.select().from(servicos).where(eq(servicos.status, status));
    } else {
      result = await db.select().from(servicos);
    }

    const servicosComFotos = result.map(servico => {
      let fotosArray = [];
      if (servico.fotos) {
        if (Array.isArray(servico.fotos)) {
          fotosArray = servico.fotos;
        } else if (typeof servico.fotos === 'string') {
          const fotosStr = servico.fotos;
          if (fotosStr.startsWith('[')) {
            try {
              fotosArray = JSON.parse(fotosStr);
            } catch (e) {
              console.log('Erro ao fazer parse das fotos:', e);
              fotosArray = [];
            }
          } else if (fotosStr.startsWith('file://') || fotosStr.startsWith('http')) {
            fotosArray = [fotosStr];
          } else if (fotosStr.includes(',')) {
            fotosArray = fotosStr.split(',').map(f => f.trim()).filter(f => f);
          }
        }
      }
      return { ...servico, fotos: fotosArray };
    });

    res.json(servicosComFotos);
  } catch (err) {
    console.error('Erro ao buscar serviços:', err.message);
    res.status(500).json({ error: 'Erro ao buscar serviços', detail: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { titulo, descricao, metragem, categoria, urgencia, materiais, endereco, valor, fotos } = req.body;
  const clienteId = req.userId;

  console.log('=== DADOS RECEBIDOS NO BACKEND ===');
  console.log('titulo:', titulo);
  console.log('fotos:', fotos);
  console.log('tipo fotos:', typeof fotos);

  try {
    let fotosParaSalvar;
    if (typeof fotos === 'string') {
      fotosParaSalvar = fotos;
    } else if (Array.isArray(fotos)) {
      fotosParaSalvar = JSON.stringify(fotos);
    } else {
      fotosParaSalvar = null;
    }

    console.log('fotos para salvar:', fotosParaSalvar);

    const result = await db.insert(servicos).values({
      clienteId,
      titulo,
      descricao,
      metragem,
      categoria,
      urgencia,
      materiais,
      endereco,
      status: 'EM_ANDAMENTO',
      valor: valor ?? null,
      fotos: fotosParaSalvar,
    });

    res.status(201).json({ id: result.insertId, message: 'Serviço criado!' });
  } catch (err) {
    console.error('Erro ao criar serviço:', err);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

router.get('/cliente/:clienteId', authMiddleware, async (req, res) => {
  const { clienteId } = req.params;
  const { status } = req.query;

  try {
    let result;
    if (status) {
      result = await db.select().from(servicos)
        .where(eq(servicos.clienteId, parseInt(clienteId)))
        .where(eq(servicos.status, status));
    } else {
      result = await db.select().from(servicos)
        .where(eq(servicos.clienteId, parseInt(clienteId)));
    }

    const servicosComFotos = result.map(servico => {
      let fotosArray = [];
      if (servico.fotos) {
        if (Array.isArray(servico.fotos)) {
          fotosArray = servico.fotos;
        } else if (typeof servico.fotos === 'string') {
          const fotosStr = servico.fotos;
          if (fotosStr.startsWith('[')) {
            try {
              fotosArray = JSON.parse(fotosStr);
            } catch (e) {
              console.log('Erro ao fazer parse das fotos:', e);
              fotosArray = [];
            }
          } else if (fotosStr.startsWith('file://') || fotosStr.startsWith('http')) {
            fotosArray = [fotosStr];
          } else if (fotosStr.includes(',')) {
            fotosArray = fotosStr.split(',').map(f => f.trim()).filter(f => f);
          }
        }
      }
      return { ...servico, fotos: fotosArray };
    });

    res.json(servicosComFotos);
  } catch (err) {
    console.error('Erro ao buscar serviços por cliente:', err);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.select().from(servicos).where(eq(servicos.id, parseInt(id)));

    if (result[0]) {
      let fotosArray = [];
      if (result[0].fotos) {
        if (Array.isArray(result[0].fotos)) {
          fotosArray = result[0].fotos;
        } else if (typeof result[0].fotos === 'string') {
          const fotosStr = result[0].fotos;
          if (fotosStr.startsWith('[')) {
            try {
              fotosArray = JSON.parse(fotosStr);
            } catch (e) {
              fotosArray = [];
            }
          } else if (fotosStr.startsWith('file://') || fotosStr.startsWith('http')) {
            fotosArray = [fotosStr];
          } else if (fotosStr.includes(',')) {
            fotosArray = fotosStr.split(',').map(f => f.trim()).filter(f => f);
          }
        }
      }
      const servico = {
        ...result[0],
        fotos: fotosArray
      };
      res.json(servico);
    } else {
      res.json(null);
    }
  } catch (err) {
    console.error('Erro ao buscar serviço:', err);
    res.status(500).json({ error: 'Erro ao buscar serviço' });
  }
});

router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.update(servicos).set({ status }).where(eq(servicos.id, parseInt(id)));
    res.json({ message: 'Status atualizado!' });
  } catch (err) {
    console.error('Erro ao atualizar status:', err);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

module.exports = router;