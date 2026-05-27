import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AgendarScreen() {
  const router = useRouter();
  const { servicoId } = useLocalSearchParams<{ servicoId: string }>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#0a1f44" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Agendar Serviço</Text>
          <Text style={styles.subtitle}>Serviço {servicoId || '-'}</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Escolha uma data</Text>
        <Text style={styles.infoText}>
          Esta tela ainda não está completa, mas a rota agora existe e a navegação funciona corretamente.
        </Text>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={() => router.back()}>
        <Text style={styles.confirmText}>Voltar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0a1f44' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  infoBox: { backgroundColor: '#fff', borderRadius: 18, padding: 20, marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  infoTitle: { fontSize: 16, fontWeight: '700', color: '#0a1f44', marginBottom: 10 },
  infoText: { fontSize: 14, color: '#444', lineHeight: 20 },
  confirmButton: { backgroundColor: '#ff6600', paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
