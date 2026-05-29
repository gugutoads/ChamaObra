import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface WorkInProgressViewProps {
  servico: any;
  onBack: () => void;
  onChat: () => void;
  onCancel: () => void;
}

export default function WorkInProgressView({ servico, onBack, onChat, onCancel }: WorkInProgressViewProps) {
  // Mock data for progress as the API might not have this yet
  const progress = 50;
  const currentStage = "O profissional está a caminho";

  const mockTechnicalSpecs = [
    { icon: 'category', label: 'CATEGORIA', value: servico?.categoria || 'Reforço Estrutural' },
    { icon: 'straighten', label: 'ÁREA TOTAL', value: servico?.metragem ? `${servico.metragem} m²` : '450 sq. ft.' },
    { icon: 'layers', label: 'MATERIAIS', value: servico?.materiais || 'Vigas de Aço, Concreto Mix' },
    { icon: 'calendar-today', label: 'DATA DE INÍCIO', value: '12 de Outubro, 2023' },
  ];

  const mockProgressPhotos = [
    'https://images.unsplash.com/photo-1503387762-592dee58296b?q=80&w=400',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=400',
    'https://images.unsplash.com/photo-1541888946425-e6ed56886a8b?q=80&w=400',
  ];

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Projeto</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* TOP STATUS */}
        <View style={styles.statusSection}>
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>EM PROGRESSO</Text>
            </View>
            <Text style={styles.completionText}>{progress}% Concluído</Text>
          </View>
          <Text style={styles.projectTitle}>{servico?.titulo || 'Reforço de Cozinha'}</Text>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* PAYMENT CARD */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentLabel}>CONTRATADO POR</Text>
          <Text style={styles.paymentValue}>
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(servico?.valor || 12450)}
          </Text>
          <View style={styles.escrowBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#fff" />
            <Text style={styles.escrowBadgeText}>Garantido por Escrow Seguro</Text>
          </View>
        </View>

        {/* CURRENT STATUS CARD */}
        <View style={styles.stageCard}>
          <View style={styles.stageHeader}>
            <MaterialIcons name="local-shipping" size={20} color="#ff6600" />
            <Text style={styles.stageLabel}>STATUS ATUAL</Text>
          </View>
          <Text style={styles.stageText}>{currentStage}</Text>
          <TouchableOpacity style={styles.trackButton}>
            <Text style={styles.trackButtonText}>ACOMPANHAR SERVIÇO</Text>
          </TouchableOpacity>
        </View>

        {/* PROFESSIONAL CARD */}
        <View style={styles.professionalCard}>
          <Image source={{ uri: 'https://i.pravatar.cc/100?u=marcus' }} style={styles.profAvatar} />
          <View style={styles.profInfo}>
            <View style={styles.profNameRow}>
              <Text style={styles.profName}>Marcus Thorne</Text>
              <Text style={styles.profRating}>⭐ 4.9</Text>
            </View>
            <Text style={styles.profRole}>Engenheiro Civil & Especialista em Estruturas</Text>
          </View>
          <TouchableOpacity style={styles.chatBtn} onPress={onChat}>
            <Text style={styles.chatBtnText}>MENSAGEM</Text>
          </TouchableOpacity>
        </View>

        {/* TECHNICAL SPECS */}
        <Text style={styles.sectionTitle}>ESPECIFICAÇÕES TÉCNICAS</Text>
        <View style={styles.specsGrid}>
          {mockTechnicalSpecs.map((spec, i) => (
            <View key={i} style={styles.specItem}>
              <MaterialIcons name={spec.icon as any} size={20} color="#ff6600" />
              <View style={styles.specTextContainer}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* DESCRIPTION */}
        <Text style={styles.sectionTitle}>DESCRIÇÃO DO PROJETO</Text>
        <Text style={styles.descriptionText}>{servico?.descricao || 'Descrição detalhada do projeto de reforço estrutural.'}</Text>

        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="pencil-outline" size={16} color="#666" />
          <Text style={styles.editBtnText}>Editar Projeto</Text>
        </TouchableOpacity>

        {/* PHOTOS SECTION */}
        <View style={styles.photosHeader}>
          <Text style={styles.sectionTitle}>DOCUMENTAÇÃO & FOTOS</Text>
          <TouchableOpacity><Text style={styles.seeAllText}>VER TUDO</Text></TouchableOpacity>
        </View>
        <View style={styles.photosGrid}>
          {mockProgressPhotos.map((url, i) => (
            <Image key={i} source={{ uri: url }} style={styles.photoThumbnail} />
          ))}
          <View style={styles.addPhotoPlaceholder}>
            <Ionicons name="camera-outline" size={24} color="#ccc" />
            <Text style={styles.addPhotoText}>255 FOTOS</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>CANCELAR PROJETO</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statusSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    backgroundColor: '#ff6600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  completionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6600',
  },
  projectTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0a1f44',
    marginBottom: 15,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ff6600',
  },
  paymentCard: {
    backgroundColor: '#0a1f44',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  paymentLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  paymentValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  escrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  escrowBadgeText: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  stageCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
    alignItems: 'center',
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  stageLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
  },
  stageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  trackButton: {
    backgroundColor: '#ff6600',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  professionalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
  },
  profAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  profName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  profRating: {
    fontSize: 12,
    color: '#ff6600',
    fontWeight: 'bold',
  },
  profRole: {
    fontSize: 12,
    color: '#666',
  },
  chatBtn: {
    backgroundColor: '#0a1f44',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  chatBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  specsGrid: {
    gap: 15,
    marginBottom: 25,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  specTextContainer: {
    flex: 1,
  },
  specLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: 'bold',
  },
  specValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 25,
  },
  editBtnText: {
    color: '#666',
    fontSize: 14,
  },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    color: '#ff6600',
    fontSize: 12,
    fontWeight: 'bold',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  photoThumbnail: {
    width: (width - 40 - 10) / 2,
    height: 120,
    borderRadius: 15,
  },
  addPhotoPlaceholder: {
    width: (width - 40 - 10) / 2,
    height: 120,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  addPhotoText: {
    fontSize: 10,
    color: '#999',
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: '#0a1f44',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 40,
  },
  cancelBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
