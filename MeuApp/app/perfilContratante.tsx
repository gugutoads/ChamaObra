import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { atualizarUsuario, obterPerfilUsuario } from '../database/userService';

export default function PerfilContratanteScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [photo, setPhoto] = useState(null);
  const [tfaEnabled, setTfaEnabled] = useState(false);

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      const resultado = await obterPerfilUsuario();
      if (resultado.sucesso) {
        const user = resultado.usuario;
        setNome(user.nome || '');
        setEmail(user.email || '');
        setTelefone(user.telefone || '');
        setEndereco(user.endereco || '');
        // Nota: Se o backend tiver campo de foto, usar user.photo.
        // Por enquanto, mantemos vazio como solicitado.
        setPhoto(user.photo || null);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const escolherFoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const dadosParaSalvar = {
      nome,
      telefone,
      endereco,
    };

    // Se houve mudança na foto, adicionamos o arquivo para upload
    if (photo) {
      // Aqui estamos simplificando: enviamos o URI como photoFile
      // Em um app real, pegaríamos os detalhes do arquivo
      dadosParaSalvar.photoFile = {
        uri: photo,
        name: 'profile.jpg',
        type: 'image/jpeg'
      };
    }

    const resultado = await atualizarUsuario(dadosParaSalvar);

    if (resultado.sucesso) {
      carregarPerfil();
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } else {
      Alert.alert('Erro', resultado.mensagem);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6600" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileImageContainer}>
          <Image
            source={photo ? { uri: photo } : { uri: 'https://cdn-icons-png.flaticon.com/512/1491/1491009.png' }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.cameraButton} onPress={escolherFoto}>
            <Ionicons name="camera" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{nome || 'Usuário'}</Text>
        <Text style={styles.userSubtitle}>Contratante</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>NOME COMPLETO</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome completo"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: '#999' }]}
                value={email}
                editable={false} // Email geralmente não é editável
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>TELEFONE</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={telefone}
                onChangeText={setTelefone}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
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
                placeholder="Rua, número, bairro..."
              />
            </View>
          </View>

          <View style={styles.securityCard}>
            <View style={styles.securityTextContainer}>
              <Text style={styles.securityTitle}>SEGURANÇA DA CONTA</Text>
              <Text style={styles.securitySubtitle}>Autenticação de Dois Fatores</Text>
            </View>
            <TouchableOpacity
              style={[styles.tfaToggle, !tfaEnabled && styles.tfaToggleDisabled]}
              onPress={() => setTfaEnabled(!tfaEnabled)}
            >
              <Text style={styles.tfaToggleText}>{tfaEnabled ? 'ATIVADO' : 'DESATIVADO'}</Text>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdfdfd'
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
