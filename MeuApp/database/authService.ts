import api from './api';
import * as SecureStore from 'expo-secure-store';

export const loginUsuario = async (email: string, senha: string) => {
  try {
    const { data } = await api.post('/auth/login', { email, senha });
    await SecureStore.setItemAsync('token', data.token);
    await SecureStore.setItemAsync('usuarioId', String(data.user.id));
    await SecureStore.setItemAsync('usuarioTipo', data.user.tipo);
    return { sucesso: true, usuario: data.user };
  } catch (error: any) {
    const mensagem = error.response?.data?.error || 'Erro ao fazer login';
    return { sucesso: false, mensagem };
  }
};

export const getUsuarioId = async (): Promise<number | null> => {
  const id = await SecureStore.getItemAsync('usuarioId');
  return id ? parseInt(id) : null;
};