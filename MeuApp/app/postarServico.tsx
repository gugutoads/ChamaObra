
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { Alert, ActivityIndicator, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { servicoRepository } from '../database/servicoRepository';
import { getUsuarioId } from '../database/authService';

// Import condicional do mapa - só funciona em build nativo
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

try {
  const maps = require('react-native-maps');
  MapView = maps.MapView;
  Marker = maps.Marker;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
} catch (e) {
  console.log('Maps não disponível no modo Expo Go');
}

export default function PostarServico() {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [metragem, setMetragem] = useState('');
  const [endereco, setEndereco] = useState('');
  const [categoria, setCategoria] = useState('Reforma');
  const [urgencia, setUrgencia] = useState('Hoje');
  const [materiais, setMateriais] = useState('Apenas mão de obra');
  const [descricao, setDescricao] = useState('');
  const [usuarioId, setUsuarioId] = useState<number | null>(null);

  // Estados para o mapa
  const [modalVisible, setModalVisible] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: -23.55052,
    longitude: -46.633308,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [markerPosition, setMarkerPosition] = useState({
    latitude: -23.55052,
    longitude: -46.633308,
  });
  const [selectedAddress, setSelectedAddress] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const mapViewRef = useRef<MapView>(null);

  // Estados para fotos
  const [fotos, setFotos] = useState<string[]>([]);
  const [loadingFoto, setLoadingFoto] = useState(false);

  useEffect(() => {
    const carregarId = async () => {
      const id = await getUsuarioId();
      setUsuarioId(id);
    };
    carregarId();
  }, []);

  // Debug: Log quando fotos mudarem
  useEffect(() => {
    console.log('=== FOTOS ATUALIZADAS ===', fotos);
  }, [fotos]);

  // Função para buscar localização atual do usuário
  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da permissão de localização para buscar sua posição atual.');
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(newRegion);
      setMarkerPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      mapViewRef.current?.animateToRegion(newRegion, 1000);

      // Geocodificação reversa para obter o endereço
      await reverseGeocode(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Erro ao buscar localização:', error);
      Alert.alert('Erro', 'Não foi possível buscar sua localização atual.');
    }
    setLoadingLocation(false);
  };

  // Função de geocodificação reversa
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      // Verificar permissão primeiro
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const location = results[0];
        const addressParts = [
          location.streetNumber || '',
          location.street || '',
          location.district || location.subregion || '',
          location.city || '',
          location.region || '',
        ].filter(Boolean);

        const fullAddress = addressParts.join(', ');
        setSelectedAddress(fullAddress);
      }
    } catch (error) {
      console.error('Erro na geocodificação:', error);
    }
  };

  // Função chamada quando o usuário arrasta o marcador
  const onMarkerDragEnd = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
    await reverseGeocode(latitude, longitude);
  };

  // Função para confirmar a seleção do endereço
  const confirmAddress = () => {
    if (selectedAddress) {
      setEndereco(selectedAddress);
      setModalVisible(false);
    } else {
      Alert.alert('Erro', 'Selecione uma localização no mapa.');
    }
  };

  // Funções para upload de fotos
  const pickImageFromGallery = async () => {
    try {
      setLoadingFoto(true);
      console.log('=== ABRINDO GALERIA ===');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('=== RESULTADO GALERIA ===', result);
      if (!result.canceled && result.assets[0]) {
        const newFoto = result.assets[0].uri;
        console.log('=== NOVA FOTO ===', newFoto);
        if (fotos.length < 6) {
          setFotos([...fotos, newFoto]);
          console.log('=== FOTOS ATUALIZADAS ===', [...fotos, newFoto]);
        } else {
          Alert.alert('Limite atingido', 'Você pode adicionar no máximo 6 fotos.');
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    } finally {
      setLoadingFoto(false);
    }
  };

  const takePhoto = async () => {
    try {
      setLoadingFoto(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da permissão da câmera para tirar fotos.');
        setLoadingFoto(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newFoto = result.assets[0].uri;
        if (fotos.length < 6) {
          setFotos([...fotos, newFoto]);
        } else {
          Alert.alert('Limite atingido', 'Você pode adicionar no máximo 6 fotos.');
        }
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    } finally {
      setLoadingFoto(false);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Adicionar Foto',
      'Escolha uma opção',
      [
        { text: 'Galeria', onPress: pickImageFromGallery },
        { text: 'Câmera', onPress: takePhoto },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const removeFoto = (index: number) => {
    const newFotos = fotos.filter((_, i) => i !== index);
    setFotos(newFotos);
  };

  // Função para buscar endereço pelo texto
  const searchAddress = async (text: string) => {
    if (text.length < 3) return;

    try {
      // Verificar permissão primeiro
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos da permissão de localização para buscar endereços.');
        return;
      }

      const results = await Location.geocodeAsync(text);
      if (results.length > 0) {
        const location = results[0];
        const newRegion = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setMapRegion(newRegion);
        setMarkerPosition({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        mapViewRef.current?.animateToRegion(newRegion, 1000);
        await reverseGeocode(location.latitude, location.longitude);
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
    }
  };

  const categorias = ['Reforma', 'Elétrica', 'Hidráulica', 'Pintura', 'Outros'];
  const urgencias = ['Hoje', 'Esta Semana', 'Agendar'];

 const handlePostar = async () => {
  if (!titulo || !endereco) {
    Alert.alert('Erro', 'Por favor, preencha o título e o endereço.');
    return;
  }

  if (!usuarioId) {
    Alert.alert('Erro', 'Usuário não identificado. Faça login novamente.');
    return;
  }

  try {
    console.log('=== ENVIANDO DADOS PARA API ===');
    console.log('fotos:', fotos);
    console.log('fotos length:', fotos.length);

    await servicoRepository.insert({
      clienteId: usuarioId,
      titulo,
      descricao,
      metragem,
      categoria,
      urgencia,
      materiais,
      endereco,
      status: 'EM_ANDAMENTO',
      fotos,
    });

    Alert.alert('Sucesso', 'Seu pedido foi postado com sucesso!', [
      { text: 'OK', onPress: () => router.push('/meusProjetos') }
    ]);
  } catch (error) {
    Alert.alert('Erro', 'Ocorreu um erro ao postar o serviço.');
  }
};

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color="#0a1f44" />
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
        <Text style={styles.title}>Postar novo Pedido</Text>

        {/* SEÇÃO: DADOS BÁSICOS */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionAccent} />
          <View>
            <Text style={styles.sectionTitle}>Dados Básicos</Text>
            <Text style={styles.sectionSubtitle}>Comece com o essencial para atrair os melhores profissionais.</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>TÍTULO DO SERVIÇO</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Reforma completa de banheiro social"
              value={titulo}
              onChangeText={setTitulo}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>DESCRIÇÃO DETALHADA</Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Descreva detalhadamente o que precisa ser feito..."
              multiline
              value={descricao}
              onChangeText={setDescricao}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>CATEGORIA DO SERVIÇO</Text>
            <View style={styles.categoryContainer}>
              {categorias.slice(0, 2).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryBtn, categoria === cat && styles.categoryBtnActive]}
                  onPress={() => setCategoria(cat)}
                >
                  <MaterialIcons
                    name={cat === 'Reforma' ? 'build' : 'bolt'}
                    size={20}
                    color={categoria === cat ? '#fff' : '#0a1f44'}
                  />
                  <Text style={[styles.categoryBtnText, { color: categoria === cat ? '#fff' : '#0a1f44' }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* SEÇÃO: ESPECIFICAÇÕES */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionAccent} />
          <View>
            <Text style={styles.sectionTitle}>Especificações</Text>
            <Text style={styles.sectionSubtitle}>Detalhes técnicos garantem orçamentos mais precisos.</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>METRAGEM (M²)</Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={[styles.input, { flex: 1, borderBottomWidth: 0, borderRadius: 0 }]}
                placeholder="0.00"
                keyboardType="numeric"
                value={metragem}
                onChangeText={setMetragem}
              />
              <Text style={styles.unitText}>m²</Text>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>MATERIAIS INCLUSOS</Text>
            <View style={styles.selectInput}>
              <Text style={styles.selectText}>{materiais}</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>URGÊNCIA DO SERVIÇO</Text>
            <View style={styles.urgencyContainer}>
              {urgencias.map((urg) => (
                <TouchableOpacity
                  key={urg}
                  style={[styles.urgencyBtn, urgencia === urg && styles.urgencyBtnActive]}
                  onPress={() => setUrgencia(urg)}
                >
                  <Text style={[styles.urgencyBtnText, { color: urgencia === urg ? '#fff' : '#666' }]}>
                    {urg}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* SEÇÃO: LOCAL E FOTOS */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionAccent} />
          <View>
            <Text style={styles.sectionTitle}>Local e Fotos</Text>
            <Text style={styles.sectionSubtitle}>Mostre o que precisa ser feito para gerar confiança.</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>ENDEREÇO DO LOCAL</Text>
            <View style={styles.inputWithIcon}>
              <Ionicons name="location-outline" size={20} color="#666" style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.input, { flex: 1, borderBottomWidth: 0, borderRadius: 0 }]}
                placeholder="Rua, Número, Bairro, Cidade"
                value={endereco}
                onChangeText={setEndereco}
              />
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="map-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            {endereco ? (
              <Text style={styles.addressConfirmed}>Endereço confirmado</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.mapPreview}
            onPress={() => setModalVisible(true)}
          >
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map" size={40} color="#adb5bd" />
              <Text style={styles.mapText}>
                {endereco ? endereco : 'Toque para selecionar no mapa'}
              </Text>
              {endereco ? (
                <View style={styles.editMapText}>
                  <Text style={styles.editMapTextInner}>Editar localização</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>FOTOS DO LOCAL (MÍNIMO 2)</Text>
            <View style={styles.photoGrid}>
              <TouchableOpacity
                style={styles.photoUploadBtn}
                onPress={showImagePickerOptions}
                disabled={loadingFoto}
              >
                {loadingFoto ? (
                  <ActivityIndicator size="small" color="#ff6600" />
                ) : (
                  <>
                    <View style={styles.uploadCircle}>
                      <Ionicons name="add" size={30} color="#ff6600" />
                    </View>
                    <Text style={styles.uploadText}>ADICIONAR</Text>
                  </>
                )}
              </TouchableOpacity>

              {fotos.map((foto, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: foto }} style={styles.photoPreview} />
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={() => removeFoto(index)}
                  >
                    <Ionicons name="close-circle" size={22} color="#ff0000" />
                  </TouchableOpacity>
                </View>
              ))}

              {/*Slots vazios para completar até 4 fotos */}
              {[...Array(Math.max(0, 3 - fotos.length))].map((_, index) => (
                <View key={`empty-${index}`} style={styles.photoEmpty}>
                  <Ionicons name="image-outline" size={30} color="#ccc" />
                </View>
              ))}
            </View>

            {fotos.length > 0 && (
              <Text style={styles.photoCount}>{fotos.length} foto(s) adicionada(s)</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handlePostar}
        >
          <Text style={styles.submitButtonText}>POSTAR SERVIÇO</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Seleção de Local no Mapa */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#0a1f44" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Selecione o Local</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar endereço..."
              onSubmitEditing={(e) => searchAddress(e.nativeEvent.text)}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.myLocationButton}
              onPress={getCurrentLocation}
              disabled={loadingLocation}
            >
              <Ionicons
                name={loadingLocation ? 'hourglass-outline' : 'locate-outline'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {selectedAddress ? (
            <View style={styles.selectedAddressContainer}>
              <Ionicons name="location-sharp" size={20} color="#ff6600" />
              <Text style={styles.selectedAddressText}>{selectedAddress}</Text>
            </View>
          ) : null}

          <View style={styles.mapContainer}>
            {MapView ? (
              <MapView
                ref={mapViewRef}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={mapRegion}
                onRegionChangeComplete={setMapRegion}
                showsUserLocation
                showsMyLocationButton={false}
              >
                <Marker
                  draggable
                  coordinate={markerPosition}
                  onDragEnd={onMarkerDragEnd}
                  title="Local do Serviço"
                >
                  <View style={styles.customMarker}>
                    <Ionicons name="location" size={30} color="#ff6600" />
                  </View>
                </Marker>
              </MapView>
            ) : (
              <View style={styles.expoGoMapPlaceholder}>
                <Ionicons name="map" size={60} color="#adb5bd" />
                <Text style={styles.expoGoMapTitle}>Modo Expo Go</Text>
                <Text style={styles.expoGoMapText}>
                  Use o botão de localização para buscar seu endereço atual, ou digite um endereço na busca acima.
                </Text>
                <Text style={styles.expoGoMapTextSmall}>
                  Para visualizar o mapa, faça o build nativo do app.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmAddress}
            >
              <Text style={styles.confirmButtonText}>CONFIRMAR LOCAL</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

     
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
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
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginBottom: 25,
    marginTop: 10,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  sectionAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#ff6600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    color: '#333',
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    paddingRight: 15,
  },
  unitText: {
    fontWeight: 'bold',
    color: '#666',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    padding: 15,
  },
  selectText: {
    fontSize: 15,
    color: '#333',
  },
  urgencyContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    padding: 5,
  },
  urgencyBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  urgencyBtnActive: {
    backgroundColor: '#ff6600',
  },
  urgencyBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryBtnActive: {
    backgroundColor: '#0a1f44',
    borderColor: '#0a1f44',
  },
  categoryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  mapText: {
    color: '#adb5bd',
    fontSize: 14,
  },
  mapMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff6600',
    position: 'absolute',
    top: '40%',
    left: '50%',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoUploadBtn: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ff6600',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadCircle: {
    backgroundColor: '#fff',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  uploadText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ff6600',
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  photoContainer: {
    position: 'relative',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 11,
  },
  photoCount: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
    marginTop: 10,
  },
  photoEmpty: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f1f3f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#ff6600',
    paddingVertical: 18,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#ff6600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
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
  // Estilos do Mapa
  mapButton: {
    backgroundColor: '#ff6600',
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addressConfirmed: {
    color: '#28a745',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  mapPreview: {
    marginBottom: 20,
  },
  editMapText: {
    marginTop: 8,
    alignSelf: 'center',
  },
  editMapTextInner: {
    color: '#ff6600',
    fontSize: 12,
    fontWeight: '600',
  },
  // Estilos do Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  myLocationButton: {
    backgroundColor: '#ff6600',
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedAddressText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  customMarker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  expoGoMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    padding: 20,
  },
  expoGoMapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
  },
  expoGoMapText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  expoGoMapTextSmall: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
  },
  modalFooter: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmButton: {
    backgroundColor: '#ff6600',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
