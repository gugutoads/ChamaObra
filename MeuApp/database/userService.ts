import api from './api';
import { Usuario } from './types';

export const obterPerfilUsuario = async () => {
  try {
    const response = await api.get('/auth/me');
    return { sucesso: true, usuario: response.data.user };
  } catch (error: any) {
    return { sucesso: false, mensagem: error.response?.data?.error || 'Erro ao buscar perfil' };
  }
};

export const cadastrarUsuario = async (usuario: Usuario) => {
  try {
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

export const atualizarUsuario = async (dados: any) => {
  try {
    let requestData = dados;

    if (dados.photoFile) {
      const formData = new FormData();
      Object.keys(dados).forEach(key => {
        if (key === 'photoFile') {
          formData.append('photo', {
            uri: dados.photoFile.uri,
            name: dados.photoFile.name || 'profile.jpg',
            type: dados.photoFile.type || 'image/jpeg',
          });
        } else {
          formData.append(key, dados[key]);
        }
      });
      requestData = formData;
    }

    await api.post('/auth/update', requestData, {
      headers: {
        'Content-Type': requestData instanceof FormData ? 'multipart/form-data' : 'application/json',
      },
    });
    return { sucesso: true };
  } catch (error: any) {
    const mensagem = error.response?.data?.error || 'Erro ao atualizar perfil';
    return { sucesso: false, mensagem };
  }
};
