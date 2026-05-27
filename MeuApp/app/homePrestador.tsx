import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { servicoRepository } from '../database/servicoRepository';

interface Servico {
  id: number;
  clienteId: number;
  titulo: string;
  descricao: string;
  metragem: string;
  categoria: string;
  urgencia: string;
  materiais: string;
  endereco: string;
  status: string;
  valor?: number;
  criado_em?: string;
}

const categorias = [
  { nome: 'Reforma', icon: 'build' },
  { nome: 'Elétrica', icon: 'bolt' },
  { nome: 'Hidráulica', icon: 'water-drop' },
  { nome: 'Pintura', icon: 'format-paint' },
];

export default function ExplorarScreen() {
  const router = useRouter();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const loadServicos = useCallback(async () => {
    try {
      const data = await servicoRepository.getAllOpen() as Servico[];
      setServicos(data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  }, []);

  useEffect(() => {
    loadServicos();
  }, [loadServicos]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadServicos();
    setRefreshing(false);
  }, [loadServicos]);

  const filteredServicos = servicos.filter(servico => {
    const matchesSearch = searchText === '' ||
      servico.titulo.toLowerCase().includes(searchText.toLowerCase()) ||
      servico.descricao?.toLowerCase().includes(searchText.toLowerCase()) ||
      servico.categoria.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory = !selectedCategory ||
      servico.categoria.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins}min`;
    if (diffMins < 1440) return `há ${Math.floor(diffMins / 60)}h`;
    return `há ${Math.floor(diffMins / 1440)}d`;
  };

  const getIconForCategory = (categoria: string) => {
    const cat = categorias.find(c => c.nome.toLowerCase() === categoria.toLowerCase());
    return cat?.icon || 'build';
  };

  const renderServicoCard = ({ item }: { item: Servico }) => (
    <View style={styles.listCard}>
      <View style={styles.cardHeader}>
        <View style={styles.categoryBadge}>
          <MaterialIcons
            name={getIconForCategory(item.categoria) as any}
            size={14}
            color="#ff6600"
          />
          <Text style={styles.categoryText}>{item.categoria}</Text>
        </View>
        <View style={[styles.statusBadge, item.urgencia === 'Hoje' && styles.urgentBadge]}>
          <Text style={[styles.statusText, item.urgencia === 'Hoje' && styles.urgentText]}>
            {item.urgencia}
          </Text>
        </View>
      </View>

      <Text style={styles.jobTitle} numberOfLines={2}>
        {item.titulo}
      </Text>

      {item.descricao && (
        <Text style={styles.jobDesc} numberOfLines={2}>
          {item.descricao}
        </Text>
      )}

      <View style={styles.jobDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.detailText}>{item.endereco || 'Não informado'}</Text>
        </View>
      </View>

      {item.metragem && (
        <View style={styles.jobDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="resize" size={14} color="#666" />
            <Text style={styles.detailText}>{item.metragem} m²</Text>
          </View>
        </View>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.timeAgo}>{formatDate(item.criado_em)}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => router.push(`/servicoDetalhe?servicoId=${item.id}`)}
          >
            <Text style={styles.detailBtnText}>Detalhes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.orangeBtnSmall}
            onPress={() => router.push({ pathname: '/enviarProposta' as any, params: { servicoId: String(item.id) } })}
          >
            <Ionicons name="send" size={14} color="#fff" />
            <Text style={styles.orangeBtnText}>Proposta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ff6600']} />
        }
    >

      {/* TOPO */}
      <View style={styles.topBar}>
        <View style={styles.menuArea}>
          <Ionicons name="menu" size={24} color="#0a1f44" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={22} color="#0a1f44" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100' }}
            style={styles.avatar}
          />
        </View>
      </View>

      {/* TITULO */}
      <View style={styles.titleArea}>
        <Text style={styles.title}>
          Encontre o seu
        </Text>
        <Text style={styles.highlight}>
          próximo trabalho
        </Text>
      </View>

      {/* BUSCA */}
      <View style={styles.searchBox}>
        <View style={styles.searchIconBg}>
          <Ionicons name="search" size={18} color="#ff6600" />
        </View>
        <TextInput
          placeholder="Buscar serviços (ex: elétrica)"
          style={styles.input}
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* CATEGORIAS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categorias</Text>
        <Text style={styles.link}>Ver todas</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        <TouchableOpacity
          style={[styles.category, !selectedCategory && styles.categoryActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <View style={[styles.categoryIconBg, !selectedCategory && styles.categoryIconBgActive]}>
            <MaterialIcons name="apps" size={20} color={!selectedCategory ? '#fff' : '#666'} />
          </View>
          <Text style={[styles.categoryLabel, !selectedCategory && styles.categoryLabelActive]}>Todos</Text>
        </TouchableOpacity>

        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat.nome}
            style={[styles.category, selectedCategory === cat.nome && styles.categoryActive]}
            onPress={() => setSelectedCategory(selectedCategory === cat.nome ? null : cat.nome)}
          >
            <View style={[styles.categoryIconBg, selectedCategory === cat.nome && styles.categoryIconBgActive]}>
              <MaterialIcons
                name={cat.icon as any}
                size={20}
                color={selectedCategory === cat.nome ? '#fff' : '#666'}
              />
            </View>
            <Text style={[styles.categoryLabel, selectedCategory === cat.nome && styles.categoryLabelActive]}>
              {cat.nome}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* DESTAQUE: SERVIÇO MAIS RECENTE */}
      {servicos.length > 0 && !selectedCategory && !searchText && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mais Recentes</Text>
            <Ionicons name="time-outline" size={18} color="#666" />
          </View>

          <View style={styles.bigCard}>
            <View style={styles.bigCardImageBg}>
              <MaterialIcons name="construction" size={60} color="#ccc" />
            </View>

            <View style={styles.overlay}>
              <View style={styles.overlayBadges}>
                <View style={styles.badge}>
                  <MaterialIcons name={getIconForCategory(servicos[0].categoria) as any} size={12} color="#fff" />
                  <Text style={styles.badgeText}>{servicos[0].categoria}</Text>
                </View>
                {servicos[0].urgencia === 'Hoje' && (
                  <View style={[styles.badge, styles.urgentBadgeFull]}>
                    <Ionicons name="flash" size={12} color="#fff" />
                    <Text style={styles.badgeText}>URGENTE</Text>
                  </View>
                )}
              </View>

              <Text style={styles.cardTitle} numberOfLines={2}>
                {servicos[0].titulo}
              </Text>

              {servicos[0].descricao && (
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {servicos[0].descricao}
                </Text>
              )}

              <View style={styles.cardInfo}>
                <View style={styles.infoItem}>
                  <Ionicons name="location" size={14} color="#fff" />
                  <Text style={styles.infoText}>{servicos[0].endereco || 'Não informado'}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.orangeBtn} onPress={() => router.push(`/servicoDetalhe?servicoId=${servicos[0].id}`)}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Ver Detalhes</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* LISTA DE SERVIÇOS */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory || searchText ? 'Resultados' : 'Últimos Pedidos'}
        </Text>
        <Text style={styles.countText}>{filteredServicos.length} {filteredServicos.length === 1 ? 'serviço' : 'serviços'}</Text>
      </View>

      {filteredServicos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color="#ddd" />
          <Text style={styles.emptyTitle}>Nenhum serviço encontrado</Text>
          <Text style={styles.emptySubtitle}>
            {searchText || selectedCategory
              ? 'Tente buscar por outros termos ou categorias'
              : 'Aguarde novos pedidos dos contratantes'}
          </Text>
        </View>
      ) : (
        filteredServicos.map((item) => (
          <View key={item.id}>
            {renderServicoCard({ item })}
          </View>
        ))
      )}

      {/* ESPAÇO FINAL */}
      <View style={styles.bottomSpacer} />

    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f0eb',
    flex: 1,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },

  menuArea: {
    width: 40,
  },

  notificationBtn: {
    marginRight: 12,
    position: 'relative',
  },

  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    backgroundColor: '#ff6600',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#ff6600',
  },

  titleArea: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: '300',
    color: '#0a1f44',
  },

  highlight: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ff6600',
  },

  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 16,
    marginHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  searchIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 15,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#0a1f44',
  },

  link: {
    color: '#ff6600',
    fontWeight: '600',
    fontSize: 14,
  },

  countText: {
    color: '#666',
    fontSize: 14,
  },

  categoriesScroll: {
    paddingLeft: 20,
    marginBottom: 10,
  },

  category: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },

  categoryActive: {
    // Active state styling
  },

  categoryIconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  categoryIconBgActive: {
    backgroundColor: '#ff6600',
  },

  categoryLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  categoryLabelActive: {
    color: '#ff6600',
    fontWeight: 'bold',
  },

  bigCard: {
    height: 240,
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 20,
    backgroundColor: '#0a1f44',
  },

  bigCardImageBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a2d5a',
  },

  overlay: {
    position: 'absolute',
    padding: 20,
    bottom: 0,
    left: 0,
    right: 0,
  },

  overlayBadges: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 8,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
  },

  urgentBadgeFull: {
    backgroundColor: '#ff6600',
  },

  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  cardTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
  },

  cardDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 10,
  },

  cardInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  infoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },

  orangeBtn: {
    backgroundColor: '#ff6600',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  listCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
  },

  categoryText: {
    fontSize: 12,
    color: '#ff6600',
    fontWeight: '600',
  },

  statusBadge: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },

  urgentBadge: {
    backgroundColor: '#ff6600',
  },

  statusText: {
    fontSize: 11,
    color: '#4caf50',
    fontWeight: '600',
  },

  urgentText: {
    color: '#fff',
  },

  jobTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0a1f44',
    marginBottom: 6,
  },

  jobDesc: {
    color: '#666',
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },

  jobDetails: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  detailText: {
    color: '#666',
    fontSize: 12,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  timeAgo: {
    color: '#999',
    fontSize: 12,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
  },

  detailBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  detailBtnText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 13,
  },

  orangeBtnSmall: {
    backgroundColor: '#ff6600',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    gap: 6,
  },

  orangeBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginTop: 15,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

  bottomSpacer: {
    height: 100,
  },
});