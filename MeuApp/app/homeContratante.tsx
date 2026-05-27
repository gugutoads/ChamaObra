import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, SafeAreaView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import api from '../database/api';

export default function HomeScreen() {
  const router = useRouter();
  const [prestadores, setPrestadores] = useState<any[]>([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarPrestadores();
  }, []);

  const carregarPrestadores = async () => {
    try {
      const { data } = await api.get('/usuarios/prestadores');
      setPrestadores(data);
    } catch (error) {
      console.log('Erro ao buscar prestadores:', error);
    }
  };

  const prestadoresFiltrados = prestadores.filter((p) =>
    p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    p.servico?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container}>

      {/* TOPO */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.menuBtn}>
          <Ionicons name="menu" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.topRight}>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100' }}
            style={styles.avatar}
          />
        </View>
      </View>

      <View style={styles.alertBox}>
        <View style={styles.alertContent}>
          <View style={styles.alertIcon}>
            <Ionicons name="mail" size={20} color="#ff6600" />
          </View>
          <Text style={styles.alertText}>Você recebeu 3 propostas para seus projetos</Text>
        </View>
        <TouchableOpacity style={styles.alertButton}>
          <Text style={styles.alertButtonText}>VER AGORA</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Qual trabalho você precisa?</Text>
        <Text style={styles.heroSubtitle}>Poste seu pedido e receba propostas de profissionais qualificados em minutos.</Text>
        <TouchableOpacity style={styles.postButton} onPress={() => router.push('/postarServico')}>
          <Text style={styles.postButtonText}>+ POSTAR UM PEDIDO</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionLabel}>ESPECIALIDADES</Text>
          <Text style={styles.sectionTitle}>Categorias de Serviços</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.verTodos}>Ver todos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {['Pedreiro', 'Eletricista', 'Encanador', 'Pintor'].map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.categoryItem}
            onPress={() => setBusca(item)}
          >
            <View style={styles.categoryIconCircle}>
              <MaterialIcons
                name={item === 'Pedreiro' ? 'build' : item === 'Eletricista' ? 'bolt' : item === 'Encanador' ? 'plumbing' : 'format-paint'}
                size={30}
                color="#ff6600"
              />
            </View>
            <Text style={styles.categoryText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionLabel}>DESTAQUES DA SEMANA</Text>
          <Text style={styles.sectionTitle}>Talentos Verificados</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar profissional por nome ou especialidade..."
          style={styles.search}
          value={busca}
          onChangeText={setBusca}
          placeholderTextColor="#999"
        />
      </View>

      {prestadoresFiltrados.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?img=' + (index + 10) }}
                style={styles.profileImage}
              />
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{item.nome}</Text>
              <Text style={styles.prof}>{item.servico || 'Mestre de Obras'}</Text>
              <Text style={styles.rating}>⭐ 4.9 <Text style={{ color: '#999', fontWeight: 'normal' }}>(128 avaliações)</Text></Text>
            </View>
          </View>

          <View style={styles.tags}>
            {item.servico && <View style={styles.tag}><Text style={styles.tagText}>{item.servico.toUpperCase()}</Text></View>}
            <View style={styles.tag}><Text style={styles.tagText}>LEITURA DE PLANTAS</Text></View>
          </View>

          <View style={styles.cardButtons}>
            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>SOLICITAR ORÇAMENTO</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>VER PERFIL</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* BOTÃO FLUTUANTE */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/postarServico')}
      >
        <Text style={{ color: '#fff', fontSize: 24 }}>+</Text>
      </TouchableOpacity>

    </ScrollView>

    {/* Menu Inferior */}
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/homeContratante')}>
        <Ionicons name="home" size={24} color="#ff6600" />
        <Text style={[styles.navText, { color: '#ff6600' }]}>INÍCIO</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => {}}>
        <Ionicons name="search" size={24} color="#666" />
        <Text style={styles.navText}>EXPLORAR</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/postarServico')}>
        <View style={styles.navCenterButton}>
          <Ionicons name="add" size={28} color="#fff" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/meusProjetos')}>
        <Ionicons name="hammer" size={24} color="#666" />
        <Text style={styles.navText}>PEDIDOS</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('/mensagens')}>
        <Ionicons name="chatbubble" size={24} color="#666" />
        <Text style={styles.navText}>MENSAGENS</Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 10,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtn: {
    marginRight: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee'
  },
  alertBox: {
    backgroundColor: '#FFF0E6',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertIcon: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 10,
    marginRight: 12,
  },
  alertText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  alertButton: {
    backgroundColor: '#ff6600',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  hero: {
    backgroundColor: '#0a1f44',
    padding: 25,
    borderRadius: 30,
    marginBottom: 30,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
  },
  heroSubtitle: {
    color: '#a0aec0',
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  postButton: {
    backgroundColor: '#ff6600',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  sectionLabel: {
    color: '#ff6600',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a202c'
  },
  verTodos: {
    color: '#ff6600',
    fontSize: 14,
    fontWeight: '600'
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIconCircle: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '600'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
    height: 50,
  },
  searchIcon: {
    marginRight: 10
  },
  search: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 15
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#3182ce',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c'
  },
  prof: {
    color: '#718096',
    fontSize: 14,
    marginBottom: 4
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a202c'
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20
  },
  tag: {
    backgroundColor: '#f7fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#edf2f7'
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4a5568'
  },
  cardButtons: {
    flexDirection: 'row',
    gap: 10
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#ff6600',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#4a5568',
    fontWeight: '600',
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: 25,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 10,
    color: '#a0aec0',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  navCenterButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff6600',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#ff6600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
});