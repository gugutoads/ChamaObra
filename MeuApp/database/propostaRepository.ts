import api from './api';

export interface Proposta {
  id: number;
  servicoId: number;
  prestadorId: number;
  valor: number;
  prazo: string;
  descricao: string;
  status: string;
  criado_em: string;
  data_agendada?: string;
  horario_agendado?: string;
}

export const propostaRepository = {
  insert: async (proposta: Omit<Proposta, 'id' | 'criado_em'>) => {
    const { data } = await api.post('/propostas', proposta);
    return data;
  },
  getByServicoId: async (servicoId: number) => {
    const { data } = await api.get(`/propostas/servico/${servicoId}`);
    return data;
  },
  updateStatus: async (id: number, status: string) => {
    const { data } = await api.patch(`/propostas/${id}/status`, { status });
    return data;
  },
  updateScheduling: async (id: number, data_agendada: string, horario_agendado: string) => {
    const { data } = await api.patch(`/propostas/${id}/agendamento`, { data_agendada, horario_agendado });
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get(`/propostas/${id}`);
    return data;
  },
};

