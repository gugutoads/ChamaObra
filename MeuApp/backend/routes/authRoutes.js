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
  const { nome, email, senha, cpf, tipo, endereco, servico, experiencia, telefone } = req.body;

  console.log('LOG-SISTEMA: DADOS RECEBIDOS:', req.body);

  if (!tipo || !['cliente', 'prestador'].includes(tipo)) {
    return res.status(400).json({ error: 'Tipo inválido. Use cliente ou prestador' });
  }

  try {
    console.log('LOG-SISTEMA: Tentando cadastrar usuário:', email);
    const hash = await bcrypt.hash(senha, 10);

    // Verificar se o email já existe para dar uma mensagem clara
    const existingUser = await db.select().from(usuarios).where(eq(usuarios.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Este email já está cadastrado' });
    }

    await db.insert(usuarios).values({
      nome: nome || null,
      email,
      senha: hash,
      telefone: telefone && telefone.trim() !== '' ? telefone : null,
      cpf: cpf && cpf.trim() !== '' ? cpf : null,
      tipo,
      endereco: endereco && endereco.trim() !== '' ? endereco : null,
      servico: servico && servico.trim() !== '' ? servico : null,
      experiencia: experiencia && experiencia.trim() !== '' ? experiencia : null,
    });

    console.log('LOG-SISTEMA: Usuário cadastrado com sucesso!');
    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (err) {
    console.error('LOG-SISTEMA ERRO CRÍTICO:', err);
    res.status(500).json({ error: 'Erro interno no servidor ao salvar usuário.' });
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