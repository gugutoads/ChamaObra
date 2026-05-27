import api from './api';

export const chatRepository = {
  sendMessage: async (data: {
    servicoId: number;
    propostaId?: number;
    destinatarioId: number;
    mensagem: string;
  }) => {
    const { data: response } = await api.post('/chat', data);
    return response;
  },

  getMessages: async (servicoId: number, propostaId?: number) => {
    const url = propostaId
      ? `/chat?servicoId=${servicoId}&propostaId=${propostaId}`
      : `/chat?servicoId=${servicoId}`;
    const { data } = await api.get(url);
    return data;
  },

  getConversas: async () => {
    const { data } = await api.get('/chat/conversas');
    return data;
  },
};