import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'cliente' | 'prestador' | null>(null);

  const handleNext = () => {
    if (!selectedRole) {
      alert('Por favor, selecione como deseja usar a plataforma.');
      return;
    }

    // Redireciona para a tela de login conforme solicitado
    router.push('/login');
  };

  const RoleCard = ({ role, title, description, iconName }) => (
    <TouchableOpacity
      style={[
        styles.card,
        selectedRole === role && styles.cardSelected
      ]}
      onPress={() => setSelectedRole(role)}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={iconName}
            size={28}
            color="#666"
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle}>{title}</Text>
            {selectedRole === role && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>SELECIONADO</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.mainContent}>
        <Text style={styles.mainTitle}>Como você deseja usar a plataforma?</Text>

        <View style={styles.optionsContainer}>
          <RoleCard
            role="cliente"
            title="SOU CLIENTE"
            description="Quero postar serviços e contratar profissionais qualificados para meus projetos."
            iconName="account-search"
          />
          <RoleCard
            role="prestador"
            title="SOU PRESTADOR"
            description="Quero enviar propostas, realizar serviços e expandir minha base de clientes."
            iconName="wrench"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, styles.progressStepActive]} />
          <View style={styles.progressStep} />
          <View style={styles.progressStep} />
          <Text style={styles.progressText}>Passo 1 de 3</Text>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>PRÓXIMO</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
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
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center', // Centraliza o conteúdo verticalmente
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 40,
    lineHeight: 34,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 20,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 24,
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#ff6600',
    backgroundColor: '#fff',
  },
  cardContent: {
    flexDirection: 'column',
    gap: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  textContainer: {
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  badge: {
    backgroundColor: '#ff6600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  progressStep: {
    width: 30,
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#ff6600',
  },
  progressText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: '#ff6600',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
