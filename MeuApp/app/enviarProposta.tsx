import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Proposta, propostaRepository } from '../database/propostaRepository';

export default function EnviarProposta() {
  const router = useRouter();
  const { servicoId } = useLocalSearchParams<{ servicoId: string }>();

  const [valor, setValor] = useState('');
  const [prazo, setPrazo] = useState('7 dias');
  const [descricao, setDescricao] = useState('');

  const prazos = ['1 dia', '3 dias', '7 dias', '15 dias', '30 dias', 'A combinar'];

  const handleEnviar = () => {
    if (!valor || parseFloat(valor) < 0) {
      Alert.alert('Erro', 'Por favor, informe um valor válido.');
      return;
    }

    if (!descricao || descricao.trim().length < 10) {
      Alert.alert('Erro', 'Por favor, descreva sua proposta com pelo menos 10 caracteres.');
      return;
    }

    try {
      propostaRepository.insert({
        servicoId: parseInt(servicoId as string),
        prestadorId: 1, // Mockado: em app real, viria do usuário logado
        valor: parseFloat(valor),
        prazo: prazo,
        descricao: descricao,
        status: 'PENDENTE',
      } as Omit<Proposta, 'id' | 'criado_em'>);

      Alert.alert('Sucesso', 'Sua proposta foi enviada com sucesso!', [
        {
          text: 'OK',
          onPress: () => router.push('/homePrestador')
        }
      ]);
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao enviar a proposta. Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#0a1f44" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enviar Proposta</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* INFO DO SERVIÇO */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="description" size={20} color="#ff6600" />
              <Text style={styles.infoTitle}>Detalhes do Serviço</Text>
            </View>
            <Text style={styles.infoText}>
              Preencha os dados abaixo para enviar sua proposta ao contratante.
            </Text>
          </View>

          {/* SEÇÃO: ORÇAMENTO */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionAccent} />
            <View>
              <Text style={styles.sectionTitle}>Orçamento</Text>
              <Text style={styles.sectionSubtitle}>Informe o valor da sua proposta.</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>VALOR DA PROPOSTA (R$)</Text>
              <View style={styles.inputWithPrefix}>
                <Text style={styles.prefixText}>R$</Text>
                <TextInput
                  style={[styles.input, { flex: 1, borderBottomWidth: 0, borderRadius: 0 }]}
                  placeholder="0,00"
                  keyboardType="numeric"
                  value={valor}
                  onChangeText={setValor}
                  placeholderTextColor="#ccc"
                />
              </View>
            </View>
          </View>

          {/* SEÇÃO: PRAZO */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionAccent} />
            <View>
              <Text style={styles.sectionTitle}>Prazo de Execução</Text>
              <Text style={styles.sectionSubtitle}>Quanto tempo você levará para executar o serviço.</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>PRAZO</Text>
              <View style={styles.prazoContainer}>
                {prazos.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.prazoBtn, prazo === p && styles.prazoBtnActive]}
                    onPress={() => setPrazo(p)}
                  >
                    <Text style={[styles.prazoBtnText, { color: prazo === p ? '#fff' : '#666' }]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* SEÇÃO: DESCRIÇÃO */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionAccent} />
            <View>
              <Text style={styles.sectionTitle}>Descrição da Proposta</Text>
              <Text style={styles.sectionSubtitle}>Explique como você executará o serviço.</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>DESCRIÇÃO</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descreva sua proposta detalhadamente..."
                multiline
                numberOfLines={5}
                value={descricao}
                onChangeText={setDescricao}
                textAlignVertical="top"
                placeholderTextColor="#ccc"
              />
            </View>

            <View style={styles.tipsContainer}>
              <Ionicons name="bulb-outline" size={16} color="#ff6600" />
              <Text style={styles.tipsText}>
                Dica: Mencione sua experiência, materiais incluídos e etapas do serviço.
              </Text>
            </View>
          </View>

          {/* RESUMO */}
          <View style={styles.resumeCard}>
            <Text style={styles.resumeTitle}>Resumo da Proposta</Text>
            <View style={styles.resumeRow}>
              <Text style={styles.resumeLabel}>Valor:</Text>
              <Text style={styles.resumeValue}>
                {valor ? `R$ ${parseFloat(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
              </Text>
            </View>
            <View style={styles.resumeRow}>
              <Text style={styles.resumeLabel}>Prazo:</Text>
              <Text style={styles.resumeValue}>{prazo}</Text>
            </View>
            <View style={styles.resumeRow}>
              <Text style={styles.resumeLabel}>Status:</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>PENDENTE</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* FOOTER */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, !valor && styles.submitButtonDisabled]}
            onPress={handleEnviar}
            disabled={!valor}
          >
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.submitButtonText}>ENVIAR PROPOSTA</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  keyboardView: {
    flex: 1,
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
    paddingBottom: 120,
  },

  infoCard: {
    backgroundColor: '#fff5f0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6600',
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a1f44',
  },

  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
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
    marginTop: 4,
  },

  fieldContainer: {
    marginBottom: 10,
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

  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    paddingRight: 15,
  },

  prefixText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    paddingLeft: 15,
  },

  textArea: {
    minHeight: 120,
    paddingTop: 15,
  },

  prazoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  prazoBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#f1f3f5',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  prazoBtnActive: {
    backgroundColor: '#ff6600',
    borderColor: '#ff6600',
  },

  prazoBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff5f0',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 10,
  },

  tipsText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },

  resumeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  resumeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginBottom: 16,
  },

  resumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  resumeLabel: {
    fontSize: 14,
    color: '#666',
  },

  resumeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a1f44',
  },

  statusBadge: {
    backgroundColor: '#fff3e0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ff6600',
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

  submitButton: {
    backgroundColor: '#ff6600',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#ff6600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  submitButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },

  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});