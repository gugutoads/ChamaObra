import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { propostaRepository } from '../database/propostaRepository';

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
}

export default function AceitarProposta() {
  const router = useRouter();
  const { propostaId } = useLocalSearchParams();
  const [proposta, setProposta] = useState<PropostaCompleta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propostaId) {
      const carregarProposta = async () => {
        try {
          const propostaData = await propostaRepository.getById(parseInt(propostaId as string));
          if (propostaData) {
            setProposta(propostaData as PropostaCompleta);
          }
        } catch (error) {
          console.error('Erro ao carregar proposta:', error);
        } finally {
          setLoading(false);
        }
      };
      carregarProposta();
    } else {
      setLoading(false);
    }
  }, [propostaId]);

  const formatReais = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleAceitar = () => {
    router.push({
      pathname: '/confirmarContratacao',
      params: { propostaId: proposta?.id }
    });
  };

  if (loading || !proposta) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando...</Text>
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
        <Text style={styles.headerTitle}>Detalhes da Proposta</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* PROFISSIONAL CARD */}
        <View style={styles.profCard}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150' }}
            style={styles.profAvatar}
          />
          <View style={styles.profInfo}>
            <Text style={styles.profNome}>{proposta.prestadorNome || 'Prestador'}</Text>
            <View style={styles.profRating}>
              <Text style={styles.ratingText}>⭐ 4.9</Text>
              <Text style={styles.ratingCount}>(127 avaliações)</Text>
            </View>
            <View style={styles.profBadge}>
              <MaterialIcons name="build" size={14} color="#ff6600" />
              <Text style={styles.profBadgeText}>{proposta.prestadorServico || 'Serviços Gerais'}</Text>
            </View>
          </View>
        </View>

        {/* EXPERIÊNCIA */}
        {proposta.prestadorExperiencia && (
          <View style={styles.expCard}>
            <View style={styles.expHeader}>
              <Ionicons name="school-outline" size={18} color="#0a1f44" />
              <Text style={styles.expTitle}>Experiência</Text>
            </View>
            <Text style={styles.expText}>{proposta.prestadorExperiencia}</Text>
          </View>
        )}

        {/* VALOR E PRAZO */}
        <View style={styles.valueCard}>
          <View style={styles.valueItem}>
            <View style={styles.valueIconBg}>
              <Ionicons name="cash-outline" size={24} color="#ff6600" />
            </View>
            <Text style={styles.valueLabel}>Valor Proposto</Text>
            <Text style={styles.valueAmount}>{formatReais(proposta.valor)}</Text>
          </View>

          <View style={styles.valueDivider} />

          <View style={styles.valueItem}>
            <View style={styles.valueIconBg}>
              <Ionicons name="time-outline" size={24} color="#ff6600" />
            </View>
            <Text style={styles.valueLabel}>Prazo de Execução</Text>
            <Text style={styles.valueAmount}>{proposta.prazo}</Text>
          </View>
        </View>

        {/* DESCRIÇÃO DA PROPOSTA */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color="#ff6600" />
            <Text style={styles.sectionTitle}>Descrição da Proposta</Text>
          </View>
          <Text style={styles.descriptionText}>
            {proposta.descricao || 'O profissional não forneceu uma descrição detalhada.'}
          </Text>
        </View>

        {/* INFORMAÇÕES ADICIONAIS */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#666" />
            <Text style={styles.infoLabel}>Enviada em:</Text>
            <Text style={styles.infoValue}>{formatDate(proposta.criado_em)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="hourglass-outline" size={18} color="#666" />
            <Text style={styles.infoLabel}>Status:</Text>
            <View style={[styles.statusBadge, proposta.status === 'PENDENTE' && styles.statusPendente]}>
              <Text style={[styles.statusText, proposta.status === 'PENDENTE' && styles.statusTextPendente]}>
                {proposta.status}
              </Text>
            </View>
          </View>
        </View>

        {/* AVALIAÇÕES */}
        <View style={styles.reviewsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Avaliações Recentes</Text>
          </View>

          {[1, 2].map((_, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Image source={{ uri: 'https://i.pravatar.cc/50' }} style={styles.reviewAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewName}>Cliente {i + 1}</Text>
                  <Text style={styles.reviewDate}>Hace 2 semanas</Text>
                </View>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Text key={s} style={styles.star}>⭐</Text>
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>
                Excelente profissional!very attentive and accurate in the service delivery. I recommend!
              </Text>
            </View>
          ))}
        </View>

        {/* ESPAÇO */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* FOOTER COM BOTÃO */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={handleAceitar}
        >
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={styles.acceptButtonText}>ACEITAR PROPOSTA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => router.push({
            pathname: '/chat',
            params: {
              servicoId: proposta.servicoId,
              propostaId: proposta.id
            }
          })}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#0a1f44" />
          <Text style={styles.contactButtonText}>Conversar com Profissional</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f0eb',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a1f44',
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 150,
  },

  profCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  profAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#ff6600',
  },

  profInfo: {
    flex: 1,
    marginLeft: 15,
  },

  profNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginBottom: 4,
  },

  profRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a1f44',
  },

  ratingCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },

  profBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 4,
  },

  profBadgeText: {
    fontSize: 12,
    color: '#ff6600',
    fontWeight: '600',
  },

  expCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6600',
  },

  expHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  expTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a1f44',
  },

  expText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  valueCard: {
    backgroundColor: '#0a1f44',
    borderRadius: 20,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  valueItem: {
    flex: 1,
    alignItems: 'center',
  },

  valueDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  valueIconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  valueLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },

  valueAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },

  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a1f44',
  },

  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a1f44',
  },

  statusBadge: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },

  statusPendente: {
    backgroundColor: '#fff3e0',
  },

  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4caf50',
  },

  statusTextPendente: {
    color: '#ff6600',
  },

  reviewsSection: {
    marginBottom: 20,
  },

  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },

  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },

  reviewName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a1f44',
  },

  reviewDate: {
    fontSize: 12,
    color: '#999',
  },

  reviewStars: {
    flexDirection: 'row',
  },

  star: {
    fontSize: 12,
  },

  reviewText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  bottomSpacer: {
    height: 20,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: 35,
  },

  acceptButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  contactButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  contactButtonText: {
    color: '#0a1f44',
    fontSize: 14,
    fontWeight: '600',
  },
});