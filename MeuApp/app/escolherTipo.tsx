import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function EscolherTipo() {
  const router = useRouter();
  const [tipoSelecionado, setTipoSelecionado] = useState<'cliente' | 'prestador' | null>(null);

  const handleProximo = async () => {
    if (tipoSelecionado) {
      await SecureStore.setItemAsync('user_role', tipoSelecionado);
      router.replace('/'); // Navega para tela de login (index.tsx)
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header - Removido */}

        {/* Título */}
        <Text style={styles.mainTitle}>Como você deseja usar a plataforma?</Text>

        {/* Opções */}
        <View style={styles.optionsContainer}>
          {/* Opção Cliente */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              tipoSelecionado === 'cliente' && styles.optionCardSelected
            ]}
            onPress={() => setTipoSelecionado('cliente')}
          >
            <View style={styles.optionHeader}>
              {tipoSelecionado === 'cliente' && (
                <View style={styles.selecionadoBadge}>
                  <Text style={styles.selecionadoText}>SELECIONADO</Text>
                </View>
              )}
              <MaterialIcons
                name="person"
                size={40}
                color={tipoSelecionado === 'cliente' ? '#ff6600' : '#666'}
                style={styles.optionIcon}
              />
            </View>
            <Text style={styles.optionTitle}>SOU CLIENTE</Text>
            <Text style={styles.optionDescription}>
              Quero postar serviços e contratar profissionais qualificados para meus projetos.
            </Text>
          </TouchableOpacity>

          {/* Opção Prestador */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              tipoSelecionado === 'prestador' && styles.optionCardSelected
            ]}
            onPress={() => setTipoSelecionado('prestador')}
          >
            <View style={styles.optionHeaderPrestador}>
              {tipoSelecionado === 'prestador' && (
                <View style={styles.selecionadoBadge}>
                  <Text style={styles.selecionadoText}>SELECIONADO</Text>
                </View>
              )}
              <MaterialIcons
                name="build"
                size={40}
                color={tipoSelecionado === 'prestador' ? '#ff6600' : '#666'}
                style={styles.optionIcon}
              />
            </View>
            <Text style={styles.optionTitle}>SOU PRESTADOR</Text>
            <Text style={styles.optionDescription}>
              Quero enviar propostas, realizar serviços e expandir minha base de clientes.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Indicador de progresso */}
        <Text style={styles.progressIndicator}>Passo 1 de 3</Text>

        {/* Botão Próximo */}
        <TouchableOpacity
          style={[
            styles.buttonProximo,
            !tipoSelecionado && styles.buttonProximoDisabled
          ]}
          onPress={handleProximo}
          disabled={!tipoSelecionado}
        >
          <Text style={styles.buttonText}>PRÓXIMO</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    display: 'none',
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#0a1f44',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0a1f44',
    marginBottom: 25,
    textAlign: 'left',
    lineHeight: 36,
  },
  optionsContainer: {
    gap: 15,
    marginBottom: 15,
  },
  optionCard: {
    borderWidth: 2,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#f9f9f9',
    transitionDuration: '200ms',
  },
  optionCardSelected: {
    borderColor: '#ff6600',
    backgroundColor: '#fff5f0',
  },
  optionHeader: {
    marginBottom: 15,
    alignItems: 'flex-start',
    position: 'relative',
  },
  optionHeaderPrestador: {
    marginBottom: 15,
    alignItems: 'flex-start',
    position: 'relative',
  },
  selecionadoBadge: {
    backgroundColor: '#ff6600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
    alignSelf: 'flex-end',
  },
  selecionadoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  optionIcon: {
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a1f44',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  progressIndicator: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginBottom: 12,
  },
  buttonProximo: {
    backgroundColor: '#ff6600',
    paddingVertical: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonProximoDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
