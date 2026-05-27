import api from './api';
import { Usuario } from './types';

export const cadastrarUsuario = async (usuario: Usuario) => {
  try {
    if (!usuario.nome || !usuario.email || !usuario.senha) {
      return { sucesso: false, mensagem: 'Preencha os campos obrigatórios' };
    }

    if (usuario.tipo === 'prestador') {
      if (!usuario.servico || !usuario.experiencia) {
        return { sucesso: false, mensagem: 'Preencha serviço e experiência' };
      }
    }

    await api.post('/auth/register', usuario);
    return { sucesso: true };

  } catch (error: any) {
    const mensagem = error.response?.data?.error || 'Erro ao cadastrar';
    return { sucesso: false, mensagem };
  }
};