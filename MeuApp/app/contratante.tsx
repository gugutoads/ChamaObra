import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  CheckBox
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cadastrarUsuario } from '../database/userService';
import { Ionicons } from '@expo/vector-icons';

export default function CadastroScreen() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [agree, setAgree] = useState(false);

  const cadastrar = async () => {
    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem');
      return;
    }

    if (!agree) {
      alert('Você deve aceitar os Termos de Serviço e a Política de Privacidade');
      return;
    }

    const resultado = await cadastrarUsuario({
      nome,
      email,
      telefone,
      senha,
      tipo: 'cliente',
    });

    if (!resultado.sucesso) {
      alert(resultado.mensagem);
      return;
    }

    alert('Conta criada com sucesso! 🔥 Agora vamos completar seu perfil.');
    router.replace('/perfilContratante');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Cadastro</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={nome}
              onChangeText={setNome}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PHONE NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="+1 (555) 000-0000"
              keyboardType="phone-pad"
              value={telefone}
              onChangeText={setTelefone}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="********"
              value={senha}
              onChangeText={setSenha}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONFIRM</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="********"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, agree && styles.checkboxChecked]}
              onPress={() => setAgree(!agree)}
            >
              {agree && <Ionicons name="checkmark" size={16} color="#fff" />}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>
              I agree to the <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy Policy</Text>.
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={cadastrar}>
            <Text style={styles.buttonText}>Create Account</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20
  },
  backButton: {
    marginTop: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginVertical: 40
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 20,
    boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
  },
  inputGroup: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#ff6600',
    borderColor: '#ff6600',
  },
  checkboxText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  link: {
    color: '#ff6600',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#ff6600',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 10
  },
});
