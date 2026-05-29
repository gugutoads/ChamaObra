import api from './api';
import { Servico } from './types';

export const servicoRepository = {
  insert: async (servico: Omit<Servico, 'id' | 'criado_em'>) => {
    // Converter fotos para string JSON se for array
    let fotosValue = null;
    if (servico.fotos && servico.fotos.length > 0) {
      fotosValue = JSON.stringify(servico.fotos);
    }

    const dataToSend = {
      ...servico,
      fotos: fotosValue
    };
    console.log('=== DADOS ENVIADOS AO AXIOS ===');
    console.log('fotos:', fotosValue);
    const { data } = await api.post('/servicos', dataToSend);
    return data;
  },
  getByClienteId: async (clienteId: number) => {
    const { data } = await api.get(`/servicos/cliente/${clienteId}`);
    return data;
  },
  getByStatus: async (clienteId: number, status: string) => {
    const { data } = await api.get(`/servicos/cliente/${clienteId}?status=${status}`);
    return data;
  },
  getAll: async () => {
    const { data } = await api.get('/servicos');
    return data;
  },
  getAllOpen: async () => {
    const { data } = await api.get('/servicos?status=EM_ANDAMENTO');
    return data;
  },
  delete: async (id: number) => {
    const { data } = await api.request({
      method: 'DELETE',
      url: `/servicos/${id}`,
    });
    return data;
  },
  updateStatus: async (id: number, status: string) => {
    const { data } = await api.patch(`/servicos/${id}/status`, { status });
    return data;
  },
  cancel: async (id: number) => {
    const { data } = await api.patch(`/servicos/${id}/status`, { status: 'CANCELADO' });
    return data;
  },
};