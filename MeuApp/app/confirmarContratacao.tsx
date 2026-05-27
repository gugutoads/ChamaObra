import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { propostaRepository } from '../database/propostaRepository';

const { width } = Dimensions.get('window');

interface PropostaCompleta {
  id: number;
  servicoId: number;
  prestadorId: number;
  valor: number;
  prazo: string;
  descricao: string;
  status: string;
  criado_em: string;
  prestadorNome?: string;
  prestadorServico?: string;
  prestadorExperiencia?: string;
}

export default function ConfirmarContratacao() {
  const router = useRouter();
  const { propostaId } = useLocalSearchParams();
  const [proposta, setProposta] = useState<PropostaCompleta | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState('01:30 PM - 03:30 PM');

  const timeSlots = [
    '08:30 AM - 10:30 AM',
    '01:30 PM - 03:30 PM',
    '04:30 PM - 06:30 PM',
  ];

  useEffect(() => {
    if (propostaId) {
      const carregarProposta = async () => {
        try {
          const propostaData = await propostaRepository.getById(parseInt(propostaId as string));
          if (propostaData) {
            setProposta(propostaData as PropostaCompleta);
          }
        } catch (error) {
          console.error('Erro ao carregar proposta:', error);
        } finally {
          setLoading(false);
        }
      };
      carregarProposta();
    } else {
      setLoading(false);
    }
  }, [propostaId]);

  const handleConfirm = () => {
    Alert.alert(
      'Confirmar Pagamento',
      'Você está prestes a confirmar a contratação e realizar o pagamento via Escrow. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const propostaIdNum = proposta?.id || 0;

              // Format selected date as YYYY-MM-DD
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              const dataFormatada = `${year}-${month}-${day}`;

              await propostaRepository.updateScheduling(propostaIdNum, dataFormatada, selectedSlot);
              await propostaRepository.updateStatus(propostaIdNum, 'ACEITA');

              router.push({
                pathname: '/resumoPagamento',
                params: { propostaId: propostaIdNum }
              });
            } catch (error) {
              Alert.alert('Erro', 'Houve um problema ao processar a contratação. Tente novamente.');
              console.error(error);
            }
          }
        },
      ]
    );
  };

  const nextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(next);
  };

  const prevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(prev);
  };

  const getDaysInMonth = (year: number, month: number) => {
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Empty slots for first week
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const handleDayPress = (day: number | null) => {
    if (day === null) return;
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  if (loading || !proposta) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  const daysOfMonth = getDaysInMonth(currentYear, currentDate.getMonth());

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0a1f44" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendamento</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#0a1f44" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <Text style={styles.mainTitle}>Agendamento do serviço</Text>

        {/* SECTION: AGENDAMENTO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="event" size={20} color="#0a1f44" />
            <Text style={styles.sectionTitle}>AGENDAMENTO DE VISITA</Text>
          </View>

          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Text style={styles.monthYear}>{currentMonthName} {currentYear}</Text>
              <View style={styles.calendarArrows}>
                <TouchableOpacity style={styles.arrowBtn} onPress={prevMonth}>
                  <Ionicons name="chevron-back" size={20} color="#0a1f44" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.arrowBtn} onPress={nextMonth}>
                  <Ionicons name="chevron-forward" size={20} color="#0a1f44" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.daysGrid}>
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <Text key={day} style={styles.dayLabel}>{day}</Text>
              ))}
              {daysOfMonth.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    day !== null && isSameDay(new Date(currentYear, currentDate.getMonth(), day!), selectedDate) && styles.daySelected
                  ]}
                  onPress={() => handleDayPress(day)}
                >
                  <Text style={[
                    styles.dayText,
                    day !== null && isSameDay(new Date(currentYear, currentDate.getMonth(), day!), selectedDate) && styles.dayTextSelected
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.selectedDateDisplay}>
              SELECIONADO: {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.slotTitle}>SELECIONE O HORÁRIO</Text>
          {timeSlots.map(slot => (
            <TouchableOpacity
              key={slot}
              style={[styles.slotItem, selectedSlot === slot && styles.slotSelected]}
              onPress={() => setSelectedSlot(slot)}
            >
              <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextSelected]}>{slot}</Text>
              <Ionicons
                name={selectedSlot === slot ? "checkmark-circle" : "ellipse-outline"}
                size={22}
                color={selectedSlot === slot ? "#ff6600" : "#ccc"}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>
          <Ionicons name="arrow-forward" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcfcfc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginBottom: 20,
    textAlign: 'center',
  },
  proposalSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  proposalId: {
    fontSize: 12,
    color: '#999',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  projectName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginBottom: 10,
  },
  projectDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  providerMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a1f44',
    padding: 12,
    borderRadius: 16,
  },
  providerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  providerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  providerRating: {
    alignItems: 'flex-end',
  },
  stars: {
    color: '#ffcc00',
    fontSize: 10,
  },
  ratingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0a1f44',
    letterSpacing: 1,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  monthYear: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  calendarArrows: {
    flexDirection: 'row',
    gap: 10,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dayLabel: {
    width: (width - 70) / 7,
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
    fontWeight: '600',
  },
  dayCell: {
    width: (width - 70) / 7,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 17.5,
  },
  daySelected: {
    backgroundColor: '#ff6600',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedDateDisplay: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff6600',
  },
  slotTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    marginTop: 15,
  },
  slotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  slotSelected: {
    borderColor: '#ff6600',
    backgroundColor: '#fffaf5',
  },
  slotText: {
    fontSize: 15,
    color: '#333',
  },
  slotTextSelected: {
    color: '#ff6600',
    fontWeight: 'bold',
  },
  mapCard: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapMarker: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  mapLabel: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginTop: 4,
    overflow: 'hidden',
  },
  expandMapBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0a1f44',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginTop: 5,
  },
  addressSubtext: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  directionsBtn: {
    marginTop: 10,
  },
  directionsText: {
    color: '#ff6600',
    fontWeight: 'bold',
    fontSize: 14,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLabel: {
    color: '#666',
    fontSize: 14,
  },
  paymentValue: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  paymentDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  paymentTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  paymentTotalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ff6600',
  },
  escrowCard: {
    backgroundColor: '#fffaf5',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ffe0cc',
  },
  escrowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  escrowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe0cc',
  },
  escrowTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0a1f44',
  },
  escrowText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 15,
  },
  escrowBadges: {
    flexDirection: 'row',
    gap: 10,
  },
  escrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffe0cc',
  },
  escrowBadgeText: {
    fontSize: 11,
    color: '#ff6600',
    fontWeight: 'bold',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 20,
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  bottomSpacer: {
    height: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 35,
  },
  confirmButton: {
    backgroundColor: '#ff6600',
    paddingVertical: 18,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#ff6600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
