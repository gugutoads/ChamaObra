import api from './api';

export interface Pagamento {
  id: number;
  propostaId: number;
  valor: number;
  status: string;
  metodo_pagamento: string;
  data_pagamento: string;
  data_criacao: string;
}

export const pagamentoRepository = {
  create: async (propostaId: number, valor: number) => {
    const { data } = await api.post('/pagamentos', {
      propostaId,
      valor,
      status: 'PAGO',
      metodo_pagamento: 'ESCROW'
    });
    return data;
  },
  getByPropostaId: async (propostaId: number) => {
    const { data } = await api.get(`/pagamentos/proposta/${propostaId}`);
    return data;
  },
};