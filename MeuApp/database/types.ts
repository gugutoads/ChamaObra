export type TipoUsuario = 'cliente' | 'prestador';

export interface Usuario {
  id?: number;

  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  senha: string;

  tipo: TipoUsuario;

  endereco?: string;
  criado_em?: string;

  // 🔥 CAMPOS DO PRESTADOR
  servico?: string;
  experiencia?: string;
}

export interface Servico {
  id?: number;
  clienteId: number;
  titulo: string;
  descricao: string;
  metragem: string;
  categoria: string;
  urgencia: string;
  materiais: string;
  endereco: string;
  cep?: string;
  numero?: string;
  complemento?: string;
  tipoImovel?: string;
  status: 'EM_ANDAMENTO' | 'CONCLUIDO';
  valor?: number;
  fotos?: string[];
  progresso?: number;
  estagio?: number;
  criado_em?: string;
}