import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Alert, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../database/api';
import { propostaRepository } from '../database/propostaRepository';
import { servicoRepository } from '../database/servicoRepository';
import WorkInProgressView from '../components/WorkInProgressView';

export default function ServicoDetalheScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { servicoId } = useLocalSearchParams<{ servicoId: string }>();
  const id = Number(servicoId);

  const [servico, setServico] = useState<any>(null);
  const [propostas, setPropostas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [fotoSelecionada, setFotoSelecionada] = useState<number>(0);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    if (!id || isNaN(id)) {
      setErro('ID do serviço inválido');
      setLoading(false);
      return;
    }

    const carregar = async () => {
      try {
        setLoading(true);
        setErro(null);

        console.log('=== BUSCANDO SERVIÇO ID:', id);
        const { data } = await api.get(`/servicos/${id}`);
        if (data) {
          setServico(data);
          try {
            const propostasData = await propostaRepository.getByServicoId(id);
            setPropostas(propostasData || []);
            console.log('=== PROPOSTAS RECEBIDAS:', propostasData);
          } catch (propostaError) {
            console.log('Erro ao carregar propostas:', propostaError);
            setPropostas([]);
          }
        } else {
          setErro('Serviço não encontrado');
        }
      } catch (error: any) {
        console.log('Erro ao carregar serviço:', error);
        console.log('ID do serviço:', id);
        if (error.response?.status === 401) {
          setErro('Faça login para ver os detalhes');
        } else if (error.response?.status === 404) {
          setErro('Serviço não encontrado');
        } else {
          setErro('Erro ao carregar serviço: ' + (error.message || 'Verifique a conexão'));
        }
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [id]);

  const formatReais = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  };

  const navegarChat = (propostaId: number) => {
    router.push(`/chat?servicoId=${id}&propostaId=${propostaId}`);
  };

  const handleCancelarProjeto = async () => {
    try {
      setCancelando(true);
      console.log('=== EXCLUINDO SERVIÇO ID:', id);
      await servicoRepository.delete(id);
      Alert.alert('Sucesso', 'Projeto excluído com sucesso!', [
        { text: 'OK', onPress: () => router.push('/meusProjetos') }
      ]);
    } catch (error: any) {
      console.log('Erro ao excluir:', error);
      Alert.alert('Erro', 'Não foi possível excluir o projeto. Tente novamente. ' + (error.message || ''));
    } finally {
      setCancelando(false);
      setCancelModalVisible(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#ff6600" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (erro) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff6600" />
          <Text style={styles.errorText}>{erro}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // RENDER a tela de "Obra em Andamento" se o status for INICIADA
  if (servico?.status === 'INICIADA') {
    return (
      <WorkInProgressView
        servico={servico}
        onBack={() => router.back()}
        onChat={() => router.push(`/chat?servicoId=${id}`)}
        onCancel={async () => {
          setCancelModalVisible(true);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Serviço</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Imagem do Serviço */}
        <View style={styles.imageContainer}>
          {(servico?.fotos || servico?.foto) && (servico?.fotos || servico?.foto)?.length > 0 ? (
            <>
              <Image
                source={{ uri: (servico?.fotos || servico?.foto)[fotoSelecionada] }}
                style={styles.servicoImage}
              />
              {/* seta foto anterior */}
              {(servico?.fotos || servico?.foto)?.length > 1 && (
                <>
                  <TouchableOpacity
                    style={[styles.photoArrow, styles.photoArrowLeft]}
                    onPress={() => setFotoSelecionada(fotoSelecionada > 0 ? fotoSelecionada - 1 : (servico?.fotos || servico?.foto).length - 1)}
                  >
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.photoArrow, styles.photoArrowRight]}
                    onPress={() => setFotoSelecionada(fotoSelecionada < (servico?.fotos || servico?.foto).length - 1 ? fotoSelecionada + 1 : 0)}
                  >
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                  </TouchableOpacity>
                </>
              )}
              {/* Indicadores de foto */}
              {(servico?.fotos || servico?.foto)?.length > 1 && (
                <View style={styles.photoIndicators}>
                  {(servico?.fotos || servico?.foto).map((_: any, index: number) => (
                    <View
                      key={index}
                      style={[styles.photoIndicator, index === fotoSelecionada && styles.photoIndicatorActive]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={[styles.servicoImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={48} color="#ccc" />
            </View>
          )}
        </View>

        {/* Mini Galeria de Fotos - Scroll Horizontal */}
        {(servico?.fotos || servico?.foto) && (servico?.fotos || servico?.foto)?.length > 0 && (
          <View style={styles.gallerySection}>
            <Text style={styles.galleryTitle}>Fotos do Local</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryScroll}
            >
              {(servico?.fotos || servico?.foto).map((foto: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setFotoSelecionada(index)}
                  style={styles.galleryItem}
                >
                  <Image
                    source={{ uri: foto }}
                    style={[styles.galleryThumbnail, index === fotoSelecionada && styles.galleryThumbnailActive]}
                  />
                  {index === fotoSelecionada && (
                    <View style={styles.gallerySelectedBadge}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Título e Categoria */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{servico?.titulo || 'Serviço sem título'}</Text>
          <View style={styles.tagRow}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{servico?.categoria || 'Geral'}</Text>
            </View>
            {servico?.urgencia && (
              <View style={[styles.urgenciaTag, servico.urgencia === 'URGENTE' && styles.urgenciaAlta]}>
                <Ionicons name="warning" size={12} color={servico.urgencia === 'URGENTE' ? '#fff' : '#ff6600'} />
                <Text style={[styles.urgenciaText, servico.urgencia === 'URGENTE' && styles.urgenciaTextAlta]}>
                  {servico.urgencia}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Informações do Serviço */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#ff6600" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>LOCALIZAÇÃO</Text>
              <Text style={styles.infoValue}>{servico?.endereco || 'Não informada'}</Text>
            </View>
          </View>

          {servico?.valor && (
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={20} color="#ff6600" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ORÇAMENTO</Text>
                <Text style={styles.infoValue}>{formatReais(servico.valor)}</Text>
              </View>
            </View>
          )}

          {servico?.metragem && (
            <View style={styles.infoRow}>
              <Ionicons name="resize-outline" size={20} color="#ff6600" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>METRAGEM</Text>
                <Text style={styles.infoValue}>{servico.metragem} m²</Text>
              </View>
            </View>
          )}
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{servico?.descricao || 'Sem descrição'}</Text>
        </View>

        {/* Materiais */}
        {servico?.materiais && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Materiais</Text>
            <Text style={styles.description}>{servico.materiais}</Text>
          </View>
        )}

        {/* Botão Agendar */}
        <TouchableOpacity
          style={styles.agendarButton}
          onPress={() => router.push(`/agendar?servicoId=${id}`)}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" />
          <Text style={styles.agendarText}>Agendar Serviço</Text>
        </TouchableOpacity>

        {/* Botão Cancelar Projeto */}
        <TouchableOpacity
          style={styles.cancelarButton}
          onPress={() => setCancelModalVisible(true)}
        >
          <Ionicons name="close-circle-outline" size={20} color="#fff" />
          <Text style={styles.cancelarText}>Excluir Projeto</Text>
        </TouchableOpacity>

        {/* Propostas Recebidas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Propostas Recebidas</Text>
            <View style={styles.propostasBadge}>
              <Text style={styles.propostasBadgeText}>{propostas.length}</Text>
            </View>
          </View>

          {propostas.length > 0 ? (
            propostas.map((p) => (
              <View key={p.id} style={styles.propostaCard}>
                <View style={styles.perfilContainer}>
                  <Image source={{ uri: p.imagem || 'https://i.pravatar.cc/100' }} style={styles.perfilImg} />
                  <View style={styles.perfilInfo}>
                    <Text style={styles.perfilNome}>{p.prestadorNome || 'Prestador'}</Text>
                    <Text style={styles.perfilServico}>{p.servico || ''}</Text>
                  </View>
                </View>

                <View style={styles.detalhesProposta}>
                  <View style={styles.detalheRow}>
                    <Ionicons name="cash-outline" size={16} color="#0a1f44" />
                    <Text style={styles.valor}>Valor: {formatReais(p.valor)}</Text>
                  </View>
                  <View style={styles.detalheRow}>
                    <Ionicons name="time-outline" size={16} color="#0a1f44" />
                    <Text style={styles.prazo}>Prazo: {p.prazo || 'A combinar'}</Text>
                  </View>
                  <View style={styles.detalheRow}>
                    <Ionicons name="flag-outline" size={16} color="#0a1f44" />
                    <Text style={styles.status}>Status: {p.status || 'Aguardando'}</Text>
                  </View>
                </View>

                <View style={styles.botoesProposta}>
                  <TouchableOpacity style={styles.aceitarBtn} onPress={() => router.push(`/aceitarProposta?propostaId=${p.id}`)}>
                    <Text style={styles.btnTexto}>Aceitar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chatBtn} onPress={() => navegarChat(p.id)}>
                    <Ionicons name="chatbubble-outline" size={16} color="#fff" />
                    <Text style={styles.btnTexto}>Chat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyPropostas}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Nenhuma proposta recebida ainda</Text>
            </View>
          )}
        </View>

        {/* Modal de Confirmação de Cancelamento */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={cancelModalVisible}
          onRequestClose={() => setCancelModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="warning" size={48} color="#ff6600" />
              </View>
              <Text style={styles.modalTitle}>Excluir Projeto?</Text>
              <Text style={styles.modalText}>
                Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setCancelModalVisible(false)}
                  disabled={cancelando}
                >
                  <Text style={styles.modalCancelText}>Não, Manter</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={handleCancelarProjeto}
                  disabled={cancelando}
                >
                  {cancelando ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalConfirmText}>Sim, Excluir</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom > 0 ? insets.bottom : 15 }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/homeContratante')}>
          <Ionicons name="home-outline" size={20} color="#666" />
          <Text style={styles.navText}>INÍCIO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <Text style={styles.navText}>EXPLORAR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/postarServico')}>
          <View style={styles.navCenterButton}>
            <Ionicons name="add" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/meusProjetos')}>
          <Ionicons name="hammer-outline" size={20} color="#666" />
          <Text style={styles.navText}>PEDIDOS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/mensagens')}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.navText}>MENSAGENS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#ff6600',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#0a1f44',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
  },
  backIcon: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  servicoImage: {
    width: '100%',
    height: 250,
  },
  placeholderImage: {
    height: 250,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoArrow: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -18,
  },
  photoArrowLeft: {
    left: 10,
  },
  photoArrowRight: {
    right: 10,
  },
  photoIndicators: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  photoIndicatorActive: {
    backgroundColor: '#ff6600',
  },
  gallerySection: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  galleryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a1f44',
    marginBottom: 10,
  },
  galleryScroll: {
    gap: 10,
    paddingRight: 15,
  },
  galleryItem: {
    position: 'relative',
  },
  galleryThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  galleryThumbnailActive: {
    borderColor: '#ff6600',
    borderWidth: 3,
  },
  gallerySelectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ff6600',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryTag: {
    backgroundColor: '#0a1f44',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  urgenciaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff3e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff6600',
  },
  urgenciaAlta: {
    backgroundColor: '#ff6600',
    borderColor: '#ff6600',
  },
  urgenciaText: {
    color: '#ff6600',
    fontSize: 12,
    fontWeight: '600',
  },
  urgenciaTextAlta: {
    color: '#fff',
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoContent: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#999',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#0a1f44',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginBottom: 8,
  },
  propostasBadge: {
    backgroundColor: '#ff6600',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propostasBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  agendarButton: {
    backgroundColor: '#ff6600',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 25,
  },
  agendarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelarButton: {
    backgroundColor: '#dc3545',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 25,
  },
  cancelarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginHorizontal: 30,
    width: '85%',
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff3e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#dc3545',
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  propostaCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  perfilContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  perfilImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  perfilInfo: {
    flex: 1,
  },
  perfilNome: {
    fontWeight: 'bold',
    color: '#0a1f44',
    fontSize: 16,
  },
  perfilServico: {
    color: '#ff6600',
    fontSize: 12,
    marginTop: 2,
  },
  detalhesProposta: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  detalheRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  valor: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0a1f44',
  },
  prazo: {
    fontSize: 13,
    color: '#555',
  },
  status: {
    fontSize: 13,
    color: '#555',
  },
  botoesProposta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  aceitarBtn: {
    backgroundColor: '#4caf50',
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  chatBtn: {
    backgroundColor: '#0a1f44',
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  btnTexto: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyPropostas: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  emptyText: {
    color: '#999',
    marginTop: 10,
    fontSize: 14,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 25,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  navCenterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff6600',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#ff6600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});