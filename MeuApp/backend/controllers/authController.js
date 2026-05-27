const usuarios = [];

exports.cadasrto = (req, res) => {
    const { nome, email, senha } = req.body;

    usuarios.push({ nome, email, senha });

    res.json({ message: 'Usuário cadastrado com sucesso!' });
};

exports.login = (req, res) => {
    const { email, senha } = req.body;  

    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (!usuario) {
        return res.status(401).json({ message: 'Credenciais inválidas!' });
    }

    res.json(usuario);
};