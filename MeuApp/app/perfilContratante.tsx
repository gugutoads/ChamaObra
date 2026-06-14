import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { atualizarUsuario } from '../database/userService';

export default function PerfilContratanteScreen() {
  const router = useRouter();

  // Mock data for initial state
  const [nome, setNome] = useState('Alex Miller');
  const [email, setEmail] = useState('alex.miller@email.com');
  const [telefone, setTelefone] = useState('+55 11 99999-9999');
  const [endereco, setEndereco] = useState('Rua, número, bairro...');
  const [photo, setPhoto] = useState('https://randomuser.me/api/portraits/men/32.jpg');
  const [tfaEnabled, setTfaEnabled] = useState(true);

  const handleSave = async () => {
    const resultado = await atualizarUsuario({
      nome,
      email,
      telefone,
      endereco
    });

    if (resultado.sucesso) {
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } else {
      Alert.alert('Erro', resultado.mensagem);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Client Profile</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: photo }} style={styles.profileImage} />
          <TouchableOpacity style={styles.cameraButton}>
            <Ionicons name="camera" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{nome}</Text>
        <Text style={styles.userSubtitle}>Premium Client • Member since 2023</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>FULL NAME</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PHONE NUMBER</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={telefone}
                onChangeText={setTelefone}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ENDEREÇO</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={endereco}
                onChangeText={setEndereco}
              />
            </View>
          </View>

          <View style={styles.securityCard}>
            <View style={styles.securityTextContainer}>
              <Text style={styles.securityTitle}>ACCOUNT SECURITY</Text>
              <Text style={styles.securitySubtitle}>Two-Factor Authentication</Text>
            </View>
            <TouchableOpacity
              style={[styles.tfaToggle, !tfaEnabled && styles.tfaToggleDisabled]}
              onPress={() => setTfaEnabled(!tfaEnabled)}
            >
              <Text style={styles.tfaToggleText}>{tfaEnabled ? 'ENABLED' : 'DISABLED'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>SALVAR ALTERAÇÕES</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    paddingHorizontal: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 40,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ff6600',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  userSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 30,
  },
  form: {
    width: '100%',
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  securityCard: {
    backgroundColor: '#0a192f',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 30,
  },
  securityTextContainer: {
    flexDirection: 'column',
  },
  securityTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  securitySubtitle: {
    color: '#ccc',
    fontSize: 14,
  },
  tfaToggle: {
    backgroundColor: '#ff6600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tfaToggleDisabled: {
    backgroundColor: '#444',
  },
  tfaToggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#ff6600',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
