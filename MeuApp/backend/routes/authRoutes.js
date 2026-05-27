const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { usuarios } = require('../database/schema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { eq, and } = require('drizzle-orm');

router.get('/prestadores', async (req, res) => {
  try {
    const result = await db.select({
      id: usuarios.id,
      nome: usuarios.nome,
      servico: usuarios.servico,
      experiencia: usuarios.experiencia,
      endereco: usuarios.endereco,
    }).from(usuarios).where(eq(usuarios.tipo, 'prestador'));

    res.json(result);
  } catch (err) {
    console.error('Erro ao buscar prestadores:', err);
    res.status(500).json({ error: 'Erro ao buscar prestadores' });
  }
});

router.post('/register', async (req, res) => {
  const { nome, email, senha, cpf, tipo, endereco, servico, experiencia } = req.body;

  console.log('DADOS RECEBIDOS:', req.body);

  if (!tipo || !['cliente', 'prestador'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido. Use cliente ou prestador' });
  }

  try {
    const hash = await bcrypt.hash(senha, 10);

    await db.insert(usuarios).values({
      nome,
      email,
      senha: hash,
      cpf: cpf ?? null,
      tipo,
      endereco: endereco ?? null,
      servico: servico ?? null,
      experiencia: experiencia ?? null,
    });

    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (err) {
    console.log('ERRO MYSQL:', err.message);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await db.select().from(usuarios).where(eq(usuarios.email, email));
    const user = result[0];

    if (!user) return res.status(401).json({ error: 'Email não cadastrado' });

    const senhaOk = await bcrypt.compare(senha, user.senha);
    if (!senhaOk) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign(
      { id: user.id, tipo: user.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        endereco: user.endereco,
        servico: user.servico,
        experiencia: user.experiencia,
      }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

module.exports = router;