import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cadastrarUsuario } from '../database/userService';

export default function CadastroScreen() {
  const router = useRouter();

  const [tipo, setTipo] = useState<'cliente' | 'prestador'>('cliente');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [endereco, setEndereco] = useState('');

  const cadastrar = async () => {
    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem');
      return;
    }

    const resultado = await cadastrarUsuario({
      nome,
      email,
      cpf,
      senha,
      tipo: 'cliente',
      endereco,
    });

    if (!resultado.sucesso) {
      alert(resultado.mensagem);
      return;
    }

    alert('Conta criada 🔥');
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.header}>
        <Text style={styles.logo}>🛠️</Text>
        <Text style={styles.title}>Junte-se à maior rede de</Text>
        <Text style={styles.highlight}>profissionais.</Text>
      </View>

      <Text style={styles.labelTop}>Você é:</Text>
      <View style={styles.tipoContainer}>
        <TouchableOpacity
          style={[styles.tipoBox, tipo === 'cliente' && styles.tipoAtivo]}
          onPress={() => setTipo('cliente')}
        >
          <Text>Contratante</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tipoBox, tipo === 'prestador' && styles.tipoAtivo]}
          onPress={() => {
            router.push('/prestador?tipo=prestador');
          }}
        >
          <Text>Prestador de serviço</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>NOME COMPLETO</Text>
      <TextInput style={styles.input} placeholder="Como deseja ser chamado" value={nome} onChangeText={setNome} />

      <Text style={styles.label}>EMAIL</Text>
      <TextInput style={styles.input} placeholder="seu@email.com" value={email} onChangeText={setEmail} />

      <Text style={styles.label}>CPF</Text>
      <TextInput style={styles.input} placeholder="000.000.000-00" value={cpf} onChangeText={setCpf} />

      <Text style={styles.label}>SENHA</Text>
      <TextInput style={styles.input} secureTextEntry value={senha} onChangeText={setSenha} />

      <Text style={styles.label}>CONFIRMAR SENHA</Text>
      <TextInput style={styles.input} secureTextEntry value={confirmarSenha} onChangeText={setConfirmarSenha} />

      <Text style={styles.label}>ENDEREÇO</Text>
      <TextInput style={styles.input} placeholder="Rua, número e bairro" value={endereco} onChangeText={setEndereco} />

      <TouchableOpacity style={styles.button} onPress={cadastrar}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/')}>
        <Text style={styles.loginLink}>Já possui uma conta? Entre aqui</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f5f0eb' },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { fontSize: 30 },
  title: { fontSize: 18, textAlign: 'center' },
  highlight: { fontSize: 18, fontWeight: 'bold', color: '#007bff' },
  labelTop: { marginBottom: 10, fontWeight: 'bold' },
  tipoContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  tipoBox: { flex: 1, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginRight: 10, alignItems: 'center', backgroundColor: '#fff' },
  tipoAtivo: { borderColor: '#ff6600' },
  label: { marginTop: 10, fontSize: 12, color: 'gray' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginTop: 5 },
  button: { backgroundColor: '#ff6600', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  loginLink: { textAlign: 'center', marginTop: 15, color: '#007bff' },
});