import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { propostaRepository } from '../database/propostaRepository';
import { pagamentoRepository } from '../database/pagamentoRepository';
import { servicoRepository } from '../database/servicoRepository';

const { width } = Dimensions.get('window');

interface PropostaCompleta {
  id: number;
  servicoId: number;
  prestadorId: number;
  valor: number;
  prazo: string;
  descricao: string;
  status: string;
  criado_em: string;
  prestadorNome?: string;
  prestadorServico?: string;
  prestadorExperiencia?: string;
  data_agendada?: string;
  horario_agendado?: string;
  servicoTitulo?: string;
  servicoLocalizacao?: string;
}

export default function ResumoPagamento() {
  const router = useRouter();
  const { propostaId } = useLocalSearchParams();
  const [proposta, setProposta] = useState<PropostaCompleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    if (propostaId) {
      const carregarDados = async () => {
        try {
          const data = await propostaRepository.getById(parseInt(propostaId as string));
          if (data) {
            setProposta(data as PropostaCompleta);
          }
        } catch (error) {
          console.error('Erro ao carregar resumo:', error);
        } finally {
          setLoading(false);
        }
      };
      carregarDados();
    }
  }, [propostaId]);

  const formatReais = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  if (loading || !proposta) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando resumo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0a1f44" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resumo do Pagamento</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#0a1f44" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.summaryLabel}>RESUMO DO PAGAMENTO</Text>
        <Text style={styles.projectTitle}>{proposta.servicoTitulo || 'Reforço Estrutural de Cozinha'}</Text>
        <Text style={styles.budgetLabel}>Orçamento do Projeto</Text>
        <Text style={styles.budgetValue}>{formatReais(proposta.valor)}</Text>

        {/* SPECIALIST CARD */}
        <View style={styles.specialistCard}>
          <Text style={styles.specialistLabel}>PROFISSIONAL ESPECIALISTA</Text>
          <Text style={styles.specialistName}>{proposta.prestadorNome || 'Profissional'}</Text>
          <Text style={styles.specialistRole}>{proposta.prestadorServico || 'Especialista'}</Text>
          <View style={styles.specialistFooter}>
            <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.avatar} />
            <View style={styles.ratingContainer}>
              <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
              <Text style={styles.ratingText}>4.9</Text>
            </View>
          </View>
        </View>

        {/* DETAILS SECTION */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialIcons name="event" size={20} color="#666" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Data de Início</Text>
              <Text style={styles.detailValue}>{proposta.data_agendada || 'A definir'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialIcons name="location-on" size={20} color="#666" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Localização</Text>
              <Text style={styles.detailValue}>{proposta.servicoLocalizacao || 'Endereço do Projeto'}</Text>
            </View>
          </View>

          <View style={styles.scopeContainer}>
            <Text style={styles.scopeLabel}>ESCOPO DO TRABALHO</Text>
            <Text style={styles.scopeText}>{proposta.descricao}</Text>
          </View>
        </View>

        {/* ESCROW PROTECTION CARD */}
        <View style={styles.escrowCard}>
          <View style={styles.escrowHeader}>
            <MaterialIcons name="verified-user" size={24} color="#ff6600" />
            <Text style={styles.escrowTitle}>Pagamento Protegido</Text>
          </View>
          <Text style={styles.escrowText}>
            Seu pagamento ficará retido com segurança e será liberado apenas após você confirmar a conclusão do serviço.
            O <Text style={styles.highlight}>ChamaObra</Text> atua como seu parceiro de escrow para garantir a entrega de qualidade antes da liberação dos fundos.
          </Text>
          <View style={styles.escrowBadges}>
            <View style={styles.badge}>
              <Ionicons name="lock-closed" size={12} color="#ff6600" />
              <Text style={styles.badgeText}>CRIPTOGRAFADO</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={12} color="#ff6600" />
              <Text style={styles.badgeText}>SEGURO</Text>
            </View>
          </View>
        </View>

        {/* BILLING DETAILS */}
        <Text style={styles.billingLabel}>DETALHES DA COBRANÇA</Text>
        <View style={styles.billingContainer}>
          <View style={styles.billingRow}>
            <Text style={styles.billingItem}>Mão de obra especializada</Text>
            <Text style={styles.billingAmount}>{formatReais(proposta.valor * 0.7)}</Text>
          </View>
          <View style={styles.billingRow}>
            <Text style={styles.billingItem}>Materiais e Logística</Text>
            <Text style={styles.billingAmount}>{formatReais(proposta.valor * 0.2)}</Text>
          </View>
          <View style={styles.billingRow}>
            <Text style={styles.billingItem}>Taxa de Plataforma</Text>
            <Text style={styles.billingAmount}>{formatReais(proposta.valor * 0.1)}</Text>
          </View>
          <View style={[styles.billingRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total a Pagar</Text>
            <Text style={styles.totalAmount}>{formatReais(proposta.valor)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.payButton, processando && styles.payButtonDisabled]}
          onPress={async () => {
            if (!proposta) return;

            setProcessando(true);
            try {
              await pagamentoRepository.create(proposta.id, proposta.valor);

              Alert.alert(
                'Pagamento Realizado!',
                'Seu pagamento foi processado com sucesso. O profissional foi notificado para iniciar o serviço.',
                [
                  {
                    text: 'OK',
                    onPress: async () => {
                      try {
                        // Update service status to 'INICIADA'
                        const servicoId = proposta.servicoId;
                        await servicoRepository.updateStatus(servicoId, 'INICIADA');
                        router.push(`/servicoDetalhe?servicoId=${servicoId}`);
                      } catch (error) {
                        console.error('Erro ao atualizar status do serviço:', error);
                        router.push('/homeContratante');
                      }
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Erro ao processar pagamento:', error);
              Alert.alert('Erro', 'Houve um problema ao processar o pagamento. Tente novamente.');
            } finally {
              setProcessando(false);
            }
          }}
          disabled={processando}
        >
          <Text style={styles.payButtonText}>
            {processando ? 'PROCESSANDO...' : 'PROCEDER PARA PAGAMENTO'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.secureText}>Transação segura processada via Infraestrutura Stripe</Text>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 10,
  },
  projectTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginBottom: 10,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff6600',
    marginBottom: 25,
  },
  specialistCard: {
    backgroundColor: '#0a1f44',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },
  specialistLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  specialistName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  specialistRole: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 15,
  },
  specialistFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stars: {
    color: '#ffcc00',
    fontSize: 12,
  },
  ratingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  detailsContainer: {
    marginBottom: 25,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 15,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  scopeContainer: {
    marginTop: 20,
  },
  scopeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 8,
  },
  scopeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  escrowCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#ff6600',
    marginBottom: 25,
  },
  escrowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  escrowTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  escrowText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  highlight: {
    color: '#ff6600',
    fontWeight: 'bold',
  },
  escrowBadges: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fffaf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffe0cc',
  },
  badgeText: {
    fontSize: 10,
    color: '#ff6600',
    fontWeight: 'bold',
  },
  billingLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 15,
  },
  billingContainer: {
    marginBottom: 30,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billingItem: {
    fontSize: 14,
    color: '#666',
  },
  billingAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6600',
  },
  payButton: {
    backgroundColor: '#ff6600',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#ff6600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secureText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#999',
    marginTop: 15,
    marginBottom: 20,
  },
  bottomSpacer: {
    height: 20,
  },
});
