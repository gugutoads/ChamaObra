import api from './api';
import { Servico } from './types';
import * as FileSystem from 'expo-file-system';

export const servicoRepository = {
  insert: async (servico: Omit<Servico, 'id' | 'criado_em'>) => {
    // Preparar FormData para enviar arquivos
    const formData = new FormData();
    
    // Adicionar campos de texto
    formData.append('titulo', servico.titulo || '');
    formData.append('descricao', servico.descricao || '');
    formData.append('metragem', servico.metragem || '');
    formData.append('categoria', servico.categoria || '');
    formData.append('urgencia', servico.urgencia || '');
    formData.append('materiais', servico.materiais || '');
    formData.append('endereco', servico.endereco || '');
    formData.append('status', servico.status || 'EM_ANDAMENTO');
    if (servico.valor) {
      formData.append('valor', String(servico.valor));
    }

    // Adicionar imagens se houver
    if (servico.fotos && servico.fotos.length > 0) {
      for (let i = 0; i < servico.fotos.length; i++) {
        const photoUri = servico.fotos[i];
        
        try {
          // Ler arquivo para obter tamanho e validar existência
          const fileInfo = await FileSystem.getInfoAsync(photoUri);
          if (fileInfo.exists) {
            // Obter tipo MIME baseado na extensão
            const filename = photoUri.split('/').pop() || `photo_${i}.jpg`;
            const mimeType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
            
            // Criar blob do arquivo
            const file = {
              uri: photoUri,
              type: mimeType,
              name: filename,
            } as any;
            
            formData.append('fotos', file);
          }
        } catch (error) {
          console.error(`Erro ao processar foto ${i}:`, error);
        }
      }
    }

    console.log('=== ENVIANDO FORMDATA COM FOTOS ===');
    console.log('Número de fotos:', servico.fotos?.length || 0);
    
    const { data } = await api.post('/servicos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } as any);
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