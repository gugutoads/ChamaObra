import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { servicoRepository } from '../database/servicoRepository';
import { getUsuarioId } from '../database/authService';

export default function PostarServico() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFoto, setLoadingFoto] = useState(false);

  // Form States
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>([]);
  const [fotos, setFotos] = useState<string[]>([]);

  const [cep, setCep] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [tipoImovel, setTipoImovel] = useState('');
  const [urgencia, setUrgencia] = useState('');

  const [materiais, setMateriais] = useState('');
  const [metragem, setMetragem] = useState('');

  useEffect(() => {
    const carregarId = async () => {
      const id = await getUsuarioId();
      setUsuarioId(id);
    };
    carregarId();
  }, []);

  const categorias = ['Pedreiro', 'Pintor', 'Eletricista', 'Encanador', 'Gesseiro', 'Azulejista', 'Marceneiro'];
  const tiposImovel = [
    { label: 'Casa', icon: 'home' },
    { label: 'Apartamento', icon: 'apartment' },
    { label: 'Comercial', icon: 'store' },
  ];
  const urgencias = ['Urgente', 'Essa semana', 'Esse mês', 'Sem prazo definido'];
  const opcoesMateriais = ['Sim', 'Não', 'Parcialmente'];

  const toggleCategoria = (cat: string) => {
    if (categoriasSelecionadas.includes(cat)) {
      setCategoriasSelecionadas(categoriasSelecionadas.filter(item => item !== cat));
    } else {
      setCategoriasSelecionadas([...categoriasSelecionadas, cat]);
    }
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      setLoadingFoto(true);
      let result;

      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissão negada', 'Precisamos de acesso à câmera para tirar fotos.');
          setLoadingFoto(false);
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: false, // Removendo a parte de cortar
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false, // Removendo a parte de cortar
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        if (fotos.length < 6) {
          setFotos([...fotos, result.assets[0].uri]);
        } else {
          Alert.alert('Limite atingido', 'Você pode adicionar no máximo 6 fotos.');
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    } finally {
      setLoadingFoto(false);
    }
  };

  const removeFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    if (!titulo) {
      Alert.alert('Atenção', 'Por favor, insira o título do projeto.');
      return false;
    }
    if (categoriasSelecionadas.length === 0) {
      Alert.alert('Atenção', 'Por favor, selecione pelo menos uma categoria.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!cep || !numero) {
      Alert.alert('Atenção', 'Por favor, preencha o CEP e o número do endereço.');
      return false;
    }
    if (!tipoImovel) {
      Alert.alert('Atenção', 'Por favor, selecione o tipo de imóvel.');
      return false;
    }
    if (!urgencia) {
      Alert.alert('Atenção', 'Por favor, selecione a urgência.');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!materiais) {
      Alert.alert('Atenção', 'Por favor, informe sobre os materiais.');
      return false;
    }
    return true;
  };

  const handleFinalizar = async () => {
    if (!usuarioId) {
      Alert.alert('Erro', 'Usuário não identificado.');
      return;
    }

    setLoading(true);
    try {
      await servicoRepository.insert({
        clienteId: usuarioId,
        titulo,
        descricao,
        metragem,
        categoria: categoriasSelecionadas.join(', '), // Enviando as múltiplas categorias como string separada por vírgula
        urgencia,
        materiais,
        endereco: `${cep}, ${numero} ${complemento}`,
        cep,
        numero,
        complemento,
        tipoImovel,
        status: 'EM_ANDAMENTO',
        fotos,
      });

      Alert.alert('Sucesso', 'Seu pedido foi postado com sucesso!', [
        { text: 'OK', onPress: () => router.push('/meusProjetos') }
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao postar o serviço.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => {
    const progress = (step / 3) * 100;
    return (
      <View style={styles.progressWrapper}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0a1f44" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Projeto</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {renderProgressBar()}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Postar novo pedido</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>TÍTULO DO PROJETO</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Reforma completa de banheiro"
                value={titulo}
                onChangeText={setTitulo}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>DESCRIÇÃO</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descreva detalhadamente o que você precisa..."
                multiline
                value={descricao}
                onChangeText={setDescricao}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>CATEGORIAS</Text>
              <View style={styles.chipsContainer}>
                {categorias.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, categoriasSelecionadas.includes(cat) && styles.chipActive]}
                    onPress={() => toggleCategoria(cat)}
                  >
                    <Text style={[styles.chipText, categoriasSelecionadas.includes(cat) && styles.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.rowBetween}>
                <Text style={styles.label}>FOTOS</Text>
                <Text style={styles.counterText}>{fotos.length}/6</Text>
              </View>
              <View style={styles.photoGrid}>
                <TouchableOpacity
                  style={styles.addPhotoBtn}
                  onPress={() => {
                    Alert.alert(
                      'Adicionar Foto',
                      'Escolha a origem da imagem',
                      [
                        { text: 'Tirar Foto', onPress: () => pickImage(true) },
                        { text: 'Escolher da Galeria', onPress: () => pickImage(false) },
                        { text: 'Cancelar', style: 'cancel' },
                      ]
                    );
                  }}
                  disabled={loadingFoto}
                >
                  {loadingFoto ? (
                    <ActivityIndicator size="small" color="#ff6600" />
                  ) : (
                    <>
                      <Ionicons name="camera" size={24} color="#adb5bd" />
                      <Text style={styles.addPhotoText}>ADICIONAR</Text>
                    </>
                  )}
                </TouchableOpacity>
                {fotos.map((uri, index) => (
                  <View key={index} style={styles.photoWrapper}>
                    <Image source={{ uri }} style={styles.photoPreview} />
                    <TouchableOpacity style={styles.removePhotoBtn} onPress={() => removeFoto(index)}>
                      <Ionicons name="close-circle" size={20} color="#ff0000" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Onde e Quando?</Text>
            <Text style={styles.stepSubtitle}>Precisamos desses detalhes para conectar você ao profissional ideal na sua região.</Text>

            <View style={styles.fieldGroup}>
              <View style={styles.rowIcon}>
                <Ionicons name="location" size={18} color="#0a1f44" />
                <Text style={styles.labelBold}> Endereço (Obrigatório)</Text>
              </View>

              <Text style={styles.subLabel}>CEP</Text>
              <TextInput
                style={styles.input}
                placeholder="00000-000"
                keyboardType="numeric"
                value={cep}
                onChangeText={setCep}
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.subLabel}>Número</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: 123"
                    value={numero}
                    onChangeText={setNumero}
                  />
                </View>
                <View style={{ flex: 2 }}>
                  <Text style={styles.subLabel}>Complemento</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Apto, Bloco..."
                    value={complemento}
                    onChangeText={setComplemento}
                  />
                </View>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="home" size={18} color="#0a1f44" />
                <Text style={styles.labelBold}> Tipo do imóvel (Obrigatório)</Text>
              </View>
              <View style={styles.typeGrid}>
                {tiposImovel.map((tipo) => (
                  <TouchableOpacity
                    key={tipo.label}
                    style={[styles.typeCard, tipoImovel === tipo.label && styles.typeCardActive]}
                    onPress={() => setTipoImovel(tipo.label)}
                  >
                    <MaterialIcons name={tipo.icon} size={24} color={tipoImovel === tipo.label ? '#fff' : '#0a1f44'} />
                    <Text style={[styles.typeCardText, tipoImovel === tipo.label && styles.typeCardTextActive]}>{tipo.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="schedule" size={18} color="#0a1f44" />
                <Text style={styles.labelBold}> Urgência (Obrigatório)</Text>
              </View>
              <View style={styles.urgencyList}>
                {urgencias.map((urg) => (
                  <TouchableOpacity
                    key={urg}
                    style={[styles.urgencyItem, urgencia === urg && styles.urgencyItemActive]}
                    onPress={() => setUrgencia(urg)}
                  >
                    <View style={styles.radioCircle}>
                      {urgencia === urg && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[styles.urgencyText, urgencia === urg && styles.urgencyTextActive]}>{urg}</Text>
                    {urg === 'Urgente' && <MaterialIcons name="priority-high" size={18} color="#ff6600" />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.coverageBtn}>
              <View style={styles.coverageIcon}>
                <Ionicons name="locate" size={20} color="#0a1f44" />
              </View>
              <Text style={styles.coverageText}>Verificar cobertura na região</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Materiais e Medidas</Text>
            <Text style={styles.stepSubtitle}>Forne uma detalhe técnico para orçamentos mais precisos.</Text>

            <View style={styles.cardContainer}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="inventory" size={18} color="#0a1f44" />
                <Text style={styles.labelBold}> Material (Obrigatório)</Text>
              </View>>
              <Text style={styles.cardText}>Já possui os materiais necessários para a obra?</Text>
              <View style={styles.materialOptions}>
                {opcoesMateriais.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.materialBtn, materiais === opt && styles.materialBtnActive]}
                    onPress={() => setMateriais(opt)}
                  >
                    <Ionicons
                      name={opt === 'Sim' ? 'checkmark-circle' : opt === 'Não' ? 'close-circle' : 'refresh-circle'}
                      size={20}
                      color={materiais === opt ? '#fff' : '#0a1f44'}
                    }
                    />
                    <Text style={[styles.materialBtnText, materiais === opt && styles.materialBtnTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="straighten" size={18} color="#0a1f44" />
                <Text style={styles.labelBold}> Área aproximada (m²) (Opcional)</Text>
              </View>
              <View style={styles.measureContainer}>
                <TextInput
                  style={styles.measureInput}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={metragem}
                  onChangeText={setMetragem}
                />
                <Text style={styles.measureUnit}>m²</Text>
              </View>
              <Text style={styles.infoText}>Informe a metragem total para ajudar o profissional a estimar o tempo.</Text>
            </View>

            <View style={styles.tipBox}>
              <Ionicons name="bulb" size={20} color="#4c6ef5" />
              <Text style={styles.tipText}> Projetos com materiais e medidas detalhadas costumam receber orçamentos até 40% mais rápidos.</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButtonFooter} onPress={() => setStep(step - 1)}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        )}

        {step < 3 ? (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => {
              if (step === 1 && validateStep1()) setStep(2);
              else if (step === 2 && validateStep2()) setStep(3);
            }}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.finalizeButton}
            onPress={() => {
              if (validateStep3()) {
                handleFinalizar();
              }
            }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.finalizeButtonText}>Finalizar Pedido</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        )}
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
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  backButton: {
    padding: 5,
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
  },
  progressWrapper: {
    width: '100%',
    height: 6,
    backgroundColor: '#eee',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ff6600',
    transitionDuration: '0.3s',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginBottom: 8,
    marginTop: 10,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 25,
    lineHeight: 22,
  },
  fieldGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  labelBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginLeft: 8,
  },
  subLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  counterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f3f5',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  chipActive: {
    backgroundColor: '#0a1f44',
    borderColor: '#0a1f44',
  },
  chipText: {
    fontSize: 14,
    color: '#0a1f44',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  addPhotoBtn: {
    width: 100,
    height: 100,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    gap: 8,
  },
  addPhotoBtnActive: {
    borderColor: '#ff6600',
  },
  addPhotoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#adb5bd',
  },
  photoWrapper: {
    position: 'relative',
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 15,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  rowIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  typeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  typeCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  typeCardActive: {
    backgroundColor: '#0a1f44',
    borderColor: '#0a1f44',
  },
  typeCardText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  typeCardTextActive: {
    color: '#fff',
  },
  urgencyList: {
    gap: 10,
  },
  urgencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#eee',
  },
  urgencyItemActive: {
    borderColor: '#ff6600',
    backgroundColor: '#fff',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff6600',
  },
  urgencyText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  urgencyTextActive: {
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  coverageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f1f3f5',
    gap: 10,
    marginTop: 10,
  },
  coverageIcon: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  coverageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  cardContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  materialOptions: {
    gap: 12,
  },
  materialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    gap: 12,
  },
  materialBtnActive: {
    backgroundColor: '#0a1f44',
    borderColor: '#0a1f44',
  },
  materialBtnText: {
    fontSize: 15,
    color: '#0a1f44',
    fontWeight: '500',
  },
  materialBtnTextActive: {
    color: '#fff',
  },
  measureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    paddingRight: 15,
  },
  measureInput: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 0,
  },
  measureUnit: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  infoText: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
    lineHeight: 18,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#edf2ff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#4c6ef5',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  backButtonFooter: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#ff6600',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  finalizeButton: {
    backgroundColor: '#ff6600',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  finalizeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
