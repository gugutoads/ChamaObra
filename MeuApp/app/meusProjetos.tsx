import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { servicoRepository } from '../database/servicoRepository';
import { Servico } from '../database/types';
import { getUsuarioId } from '../database/authService';

export default function MeusProjetos() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('EM ANDAMENTO');
  const [projects, setProjects] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);

  useEffect(() => {
    inicializar();
  }, []);

  const inicializar = async () => {
    const id = await getUsuarioId();
    setUsuarioId(id);
    if (id) {
      loadProjects(id, activeTab);
    }
  };

  useEffect(() => {
    if (usuarioId) {
      loadProjects(usuarioId, activeTab);
    }
  }, [activeTab, usuarioId]);

const loadProjects = async (id: number, tab: string) => {
  setLoading(true);
  try {
    const status = tab === 'EM ANDAMENTO' ? 'EM_ANDAMENTO' : 'CONCLUIDO';
    const data = await servicoRepository.getByStatus(id, status);
    setProjects(data);
  } catch (error) {
    console.error('Erro ao carregar projetos:', error);
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#0a1f44" />
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color="#0a1f44" />
          </TouchableOpacity>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100' }}
            style={styles.avatar}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.categoryLabel}>MANAGEMENT HUB</Text>
        <Text style={styles.mainTitle}>My Projects</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('EM ANDAMENTO')}
            style={[styles.tab, activeTab === 'EM ANDAMENTO' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'EM ANDAMENTO' && styles.tabTextActive]}>EM ANDAMENTO</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('CONCLUÍDOS')}
            style={[styles.tab, activeTab === 'CONCLUÍDOS' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'CONCLUÍDOS' && styles.tabTextActive]}>CONCLUÍDOS</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#ff6600" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.projectsList}>
            {projects.length > 0 ? (
              projects.map((project) => (
                <View key={project.id ?? project.titulo} style={styles.projectCard}>
                  <Image
                    source={{ uri: 'https://picsum.photos/seed/' + project.id + '/500/300' }}
                    style={styles.projectImage}
                  />

                  <View style={styles.cardContent}>
                    <View style={styles.titleRow}>
                      <Text style={styles.projectTitle}>{project.titulo}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: project.status === 'EM_ANDAMENTO' ? '#ff9800' : '#4caf50' }]}>
                        <Text style={styles.statusText}>
                          {project.status === 'EM_ANDAMENTO' ? 'EM ANDAMENTO' : 'CONCLUÍDO'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.professionalRow}>
                      <Ionicons name="person-outline" size={14} color="#666" />
                      <Text style={styles.professionalText}>
                        {project.categoria} - {project.urgencia}
                      </Text>
                    </View>

                    <Text style={styles.valueLabel}>LOCALIZAÇÃO</Text>
                    <Text style={styles.valueText}>{project.endereco}</Text>

                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() => project.id && router.push(`/servicoDetalhe?servicoId=${project.id}`)}
                    >
                      <Text style={styles.detailsButtonText}>VER DETALHES</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Nenhum projeto encontrado.</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.ctaCard}
          onPress={() => router.push('/postarServico')}
        >
          <View style={styles.ctaContent}>
            <View style={styles.ctaIconCircle}>
              <Ionicons name="add" size={20} color="#fff" />
            </View>
            <Text style={styles.ctaTitle}>New Project</Text>
            <Text style={styles.ctaDescription}>
              Ready to begin your next construction milestone? Initiate a new blueprint authority review.
            </Text>
          </View>
          <View style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>INITIATE NEW PROJECT</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Tab Mock */}
            <View style={styles.bottomNav}>
              <TouchableOpacity style={styles.navItem} onPress={() => router.push('/homeContratante')}>
                <Ionicons name="home-outline" size={20} color="#ff6600" />
                <Text style={[styles.navText, { color: '#ff6600', fontWeight: 'bold' }]}>INÍCIO</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem} onPress={() => {}}>
                <Ionicons name="search-outline" size={20} color="#666" />
                <Text style={styles.navText}>EXPLORAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.navItem, styles.navItemActive]} onPress={() => router.push('/postarServico')}>
                <View style={styles.navCenterButton}>
                  <Ionicons name="add" size={24} color="#fff" />
                </View>
                <Text style={[styles.navText, { color: '#ff6600', fontWeight: 'bold' }]}>POSTAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem}>
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  menuButton: {
    padding: 5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 15,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 18,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff6600',
    letterSpacing: 1,
    marginTop: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    gap: 20,
  },
  tab: {
    paddingBottom: 8,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#ff6600',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
  },
  tabTextActive: {
    color: '#0a1f44',
  },
  projectsList: {
    gap: 20,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  projectImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  professionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 15,
  },
  professionalText: {
    fontSize: 14,
    color: '#666',
  },
  valueLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginBottom: 20,
  },
  detailsButton: {
    borderWidth: 1,
    borderColor: '#0a1f44',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  ctaCard: {
    marginTop: 30,
    backgroundColor: '#0a1f44',
    borderRadius: 20,
    overflow: 'hidden',
  },
  ctaContent: {
    padding: 20,
  },
  ctaIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff6600',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  ctaDescription: {
    fontSize: 14,
    color: '#bdc3c7',
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: '#ff6600',
    paddingVertical: 15,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 30,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navItemActive: {
    // Special style for the center button is handled via navCenterButton
  },
  navText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  navCenterButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
