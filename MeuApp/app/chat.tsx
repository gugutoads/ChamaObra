import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../database/api';
import { chatRepository } from '../database/chatRepository';
import { getUsuarioId } from '../database/authService';
import { propostaRepository } from '../database/propostaRepository';

interface Mensagem {
  id: number;
  servicoId: number;
  propostaId: number | null;
  remetenteId: number;
  destinatarioId: number;
  mensagem: string;
  lida: boolean;
  created_at: string;
  remetenteNome?: string;
  remetenteTipo?: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { servicoId, propostaId } = useLocalSearchParams<{ servicoId: string; propostaId: string }>();

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [outroUsuario, setOutroUsuario] = useState<{ nome: string; tipo: string } | null>(null);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const carregarDados = async () => {
      const id = await getUsuarioId();
      setUsuarioId(id);

      if (servicoId) {
        try {
          const msgs = await chatRepository.getMessages(Number(servicoId), propostaId ? Number(propostaId) : undefined);
          setMensagens(msgs || []);

          // Buscar info do outro usuário (prestador ou cliente)
          if (propostaId) {
            const proposta = await propostaRepository.getById(Number(propostaId));
            if (proposta) {
              // Se o usuário logado é o prestador, mostra o cliente, e vice-versa
              const ehPrestador = id === proposta.prestadorId;
              setOutroUsuario({
                nome: proposta.clienteNome || 'Cliente',
                tipo: 'cliente'
              });
            }
          }
        } catch (error) {
          console.log('Erro ao carregar mensagens:', error);
        }
      }
      setLoading(false);
    };

    carregarDados();
  }, [servicoId, propostaId]);

  const handleEnviar = async () => {
    if (!novaMensagem.trim() || !usuarioId || !servicoId) return;

    // Preciso saber o destinatário - vou buscar isso da proposta
    try {
      setEnviando(true);

      let destinatarioId: number | undefined;

      if (propostaId) {
        const proposta = await propostaRepository.getById(Number(propostaId));
        console.log('=== PROPOSTA RECEBIDA:', proposta);
        console.log('=== USUÁRIO ATUAL:', usuarioId);
        if (proposta) {
          // O destinatário é o outro usuário (não quem está enviando)
          if (usuarioId === proposta.prestadorId) {
            destinatarioId = proposta.clienteId;
          } else {
            destinatarioId = proposta.prestadorId;
          }
          console.log('=== DESTINATÁRIO:', destinatarioId);
        }
      }

      if (!destinatarioId) {
        // Fallback: tenta buscar nos dados da conversa
        console.log('Destinatário não identificado');
        return;
      }

      await chatRepository.sendMessage({
        servicoId: Number(servicoId),
        propostaId: propostaId ? Number(propostaId) : undefined,
        destinatarioId,
        mensagem: novaMensagem.trim()
      });

      setNovaMensagem('');

      // Recarregar mensagens
      const msgs = await chatRepository.getMessages(Number(servicoId), propostaId ? Number(propostaId) : undefined);
      setMensagens(msgs || []);

    } catch (error) {
      console.log('Erro ao enviar mensagem:', error);
    } finally {
      setEnviando(false);
    }
  };

  const formatarHora = (data: string) => {
    const d = new Date(data);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMensagem = ({ item }: { item: Mensagem }) => {
    const ehMinhaMensagem = item.remetenteId === usuarioId;

    return (
      <View style={[styles.messageBubble, ehMinhaMensagem ? styles.myMessage : styles.otherMessage]}>
        <Text style={[styles.messageText, ehMinhaMensagem ? styles.myMessageText : styles.otherMessageText]}>
          {item.mensagem}
        </Text>
        <Text style={[styles.messageTime, ehMinhaMensagem ? styles.myMessageTime : styles.otherMessageTime]}>
          {formatarHora(item.created_at)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6600" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#0a1f44" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.title}>
              {outroUsuario?.nome || (propostaId ? 'Chat' : 'Conversa')}
            </Text>
            <Text style={styles.subtitle}>
              {propostaId ? `Proposta #${propostaId}` : `Serviço #${servicoId}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Lista de Mensagens */}
      <FlatList
        ref={flatListRef}
        data={mensagens}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMensagem}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input de Mensagem */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }]}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#999"
            value={novaMensagem}
            onChangeText={setNovaMensagem}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!novaMensagem.trim() || enviando) && styles.sendButtonDisabled]}
            onPress={handleEnviar}
            disabled={!novaMensagem.trim() || enviando}
          >
            {enviando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff6600',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  messagesList: {
    padding: 15,
    paddingBottom: 5,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#ff6600',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-end',
  },
  otherMessageTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f3f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ff6600',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});