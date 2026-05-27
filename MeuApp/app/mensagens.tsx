import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatRepository } from '../database/chatRepository';
import { getUsuarioId } from '../database/authService';

interface Conversa {
  servicoId: number;
  propostaId: number | null;
  outroUsuarioId: number;
  outroUsuarioNome: string;
  outroUsuarioTipo: string;
  servicoTitulo: string;
  ultimaMensagem: string;
  ultimaMensagemData: string;
  msgsNaoLidas: number;
  _key?: string;
}

export default function MensagensScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);

  useEffect(() => {
    const carregarConversas = async () => {
      const id = await getUsuarioId();
      setUsuarioId(id);

      try {
        const data = await chatRepository.getConversas();
        // Adicionar chave única para cada conversa
        const conversasUnicas = (data || []).map((c: any, index: number) => ({
          ...c,
          _key: `${c.servicoId}-${c.propostaId || 'null'}-${c.outroUsuarioId}-${index}`
        }));
        setConversas(conversasUnicas);
      } catch (error) {
        console.log('Erro ao carregar conversas:', error);
      }
      setLoading(false);
    };

    carregarConversas();
  }, []);

  const formatarData = (data: string) => {
    if (!data) return '';
    const d = new Date(data);
    const agora = new Date();
    const diffDias = Math.floor((agora.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias === 0) {
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDias === 1) {
      return 'Ontem';
    } else if (diffDias < 7) {
      return d.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }
  };

  const abrirConversa = (conversa: Conversa) => {
    router.push(`/chat?servicoId=${conversa.servicoId}&propostaId=${conversa.propostaId}`);
  };

  const renderConversa = ({ item }: { item: Conversa }) => (
    <TouchableOpacity style={styles.conversaItem} onPress={() => abrirConversa(item)}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={24} color="#fff" />
      </View>
      <View style={styles.conversaInfo}>
        <View style={styles.conversaHeader}>
          <Text style={styles.usuarioNome}>{item.outroUsuarioNome}</Text>
          <Text style={styles.conversaData}>{formatarData(item.ultimaMensagemData)}</Text>
        </View>
        <Text style={styles.servicoTitulo} numberOfLines={1}>{item.servicoTitulo}</Text>
        <Text style={styles.ultimaMensagem} numberOfLines={1}>
          {item.ultimaMensagem || 'Sem mensagens'}
        </Text>
      </View>
      {item.msgsNaoLidas > 0 && (
        <View style={styles.naoLidasBadge}>
          <Text style={styles.naoLidasText}>{item.msgsNaoLidas}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6600" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mensagens</Text>
      </View>

      {/* Lista de Conversas */}
      {conversas.length > 0 ? (
        <FlatList
          data={conversas}
          keyExtractor={(item) => item._key || `${item.servicoId}-${item.propostaId || 'null'}-${item.outroUsuarioId}`}
          renderItem={renderConversa}
          contentContainerStyle={styles.lista}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Nenhuma conversa ainda</Text>
          <Text style={styles.emptyText}>
            Quando você enviar ou receber propostas, suas conversas aparecerão aqui.
          </Text>
        </View>
      )}

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
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Ionicons name="chatbubble-outline" size={20} color="#ff6600" />
          <Text style={[styles.navText, { color: '#ff6600' }]}>MENSAGENS</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#0a1f44',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  lista: {
    paddingBottom: 100,
  },
  conversaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ff6600',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversaInfo: {
    flex: 1,
  },
  conversaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  usuarioNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a1f44',
  },
  conversaData: {
    fontSize: 12,
    color: '#999',
  },
  servicoTitulo: {
    fontSize: 12,
    color: '#ff6600',
    marginBottom: 2,
  },
  ultimaMensagem: {
    fontSize: 14,
    color: '#666',
  },
  naoLidasBadge: {
    backgroundColor: '#ff6600',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  naoLidasText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
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