import api from './api';
import { Usuario } from './types';
import { Partial } from 'typescript'; // Simplified for example, in real TS we use Partial<Usuario>

export const cadastrarUsuario = async (usuario: Usuario) => {
  try {
    // Now only nome, email, and senha are mandatory for initial registration
    if (!usuario.nome || !usuario.email || !usuario.senha) {
      return { sucesso: false, mensagem: 'Preencha os campos obrigatórios' };
    }

    await api.post('/auth/register', usuario);
    return { sucesso: true };
  } catch (error: any) {
    const mensagem = error.response?.data?.error || 'Erro ao cadastrar';
    return { sucesso: false, mensagem };
  }
};

export const atualizarUsuario = async (dados: Partial<Usuario>) => {
  try {
    // We assume the user is logged in and the API handles the user ID via token/session
    await api.put('/user/update', dados);
    return { sucesso: true };
  } catch (error: any) {
    const mensagem = error.response?.data?.error || 'Erro ao atualizar perfil';
    return { sucesso: false, mensagem };
  }
};
