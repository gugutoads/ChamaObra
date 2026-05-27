import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cadastrarUsuario } from '../database/userService';

export default function PrestadorScreen() {
  const router = useRouter();
  const { tipo } = useLocalSearchParams();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [servico, setServico] = useState('');
  const [experiencia, setExperiencia] = useState('');
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
      tipo: 'prestador',
      endereco,
      servico,
      experiencia
    });

    if (!resultado.sucesso) {
      alert(resultado.mensagem);
      return;
    }

    alert('Prestador cadastrado 🔥');
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.icon}>🛠️</Text>
        <Text style={styles.title}>Junte-se à maior rede de</Text>
        <Text style={styles.highlight}>profissionais</Text>
      </View>

      {/* BLOQUINHOS */}
      <Text style={styles.labelTop}>Você é:</Text>

      <View style={styles.tipoContainer}>
        <TouchableOpacity
          style={[
            styles.tipoBox,
            tipo === 'contratante' && styles.tipoAtivo
          ]}
          onPress={() => router.push('/contratante?tipo=contratante')}
        >
          <Text>Contratante</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tipoBox,
            styles.tipoAtivo // sempre ativo aqui
          ]}
        >
          <Text>Prestador</Text>
        </TouchableOpacity>
      </View>

      {/* FORM */}
      <Text style={styles.label}>NOME COMPLETO</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} />

      <Text style={styles.label}>EMAIL</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} />

      <Text style={styles.label}>CPF</Text>
      <TextInput style={styles.input} value={cpf} onChangeText={setCpf} />

      <Text style={styles.label}>SENHA</Text>
      <TextInput style={styles.input} secureTextEntry value={senha} onChangeText={setSenha} />

      <Text style={styles.label}>CONFIRMAR SENHA</Text>
      <TextInput style={styles.input} secureTextEntry value={confirmarSenha} onChangeText={setConfirmarSenha} />

      <Text style={styles.label}>SERVIÇO</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Pintura, elétrica..."
        value={servico}
        onChangeText={setServico}
      />

      <Text style={styles.label}>EXPERIÊNCIA</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 5 anos"
        value={experiencia}
        onChangeText={setExperiencia}
      />

      <Text style={styles.label}>ENDEREÇO</Text>
      <TextInput
        style={styles.input}
        placeholder="Rua, número e bairro"
        value={endereco}
        onChangeText={setEndereco}
      />

      {/* BOTÃO */}
      <TouchableOpacity style={styles.button} onPress={cadastrar}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      {/* VOLTAR */}
      <TouchableOpacity onPress={() => router.push('/')}>
        <Text style={styles.loginLink}>Já possui uma conta? Entre aqui</Text>
      </TouchableOpacity>

    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff8f6',
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },

  icon: {
    fontSize: 30,
  },

  title: {
    fontSize: 18,
    textAlign: 'center',
  },

  highlight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6700',
  },

  labelTop: {
    marginBottom: 10,
    fontWeight: 'bold',
  },

  tipoContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  tipoBox: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  tipoAtivo: {
    borderColor: '#ff6600',
  },

  label: {
    marginTop: 10,
    fontSize: 12,
    color: 'gray',
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  button: {
    backgroundColor: '#ff6700',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  loginLink: {
    textAlign: 'center',
    marginTop: 15,
    color: '#007bff',
  },
});