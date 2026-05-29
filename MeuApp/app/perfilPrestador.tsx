import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function PerfilPrestadorScreen() {
  const router = useRouter();

  // Mock data for the provider profile
  const provider = {
    name: 'Marcus Thorne',
    rating: 4.9,
    reviewsCount: 126,
    badge: 'MASTER BUILDER',
    experience: '15+ YRS',
    projects: '280+',
    location: 'London',
    available: 'May 24',
    about: 'Specializing in high-end residential structural engineering and sustainable architecture. Marcus focuses on delivering precision-engineered solutions that blend aesthetic vision with structural integrity.',
    specialties: ['Industrial Design', 'Structural Integrity', 'Sustainable Materials', 'Blueprinting', 'Luxury Renovations'],
    portfolio: [
      { id: 1, title: 'The Glass House Residency', category: 'RESIDENTIAL', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400' },
      { id: 2, title: 'Skyline Corporate Hub', category: 'CORPORATE', image: 'https://images.unsplash.com/photo-1486406146926-c627a92//q=80&w=400' },
      { id: 3, title: 'Mayfair Interior Design', category: 'INTERIOR', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=400' },
    ],
    reviews: [
      {
        id: 1,
        user: 'Julian Ricardo',
        role: 'Property Developer',
        rating: 5,
        comment: '"O trabalho do Marcus é simplesmente impecável. Ele conseguiu transformar minha visão em algo concretamente sólido."'
      },
      {
        id: 2,
        user: 'Elena Kostas',
        role: 'Arquiteta Sênior',
        rating: 5,
        comment: '"Profissional raro. Marcus entende profundamente os materiais e processos construtivos. Sua precisão é assustadora."'
      },
    ]
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROJETOS</Text>
        <Image
          source={{ uri: 'https://i.pravatar.cc/100?u=marcus' }}
          style={styles.headerAvatar}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* PROFILE SECTION */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/300?u=marcus' }}
              style={styles.mainAvatar}
            />
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={14} color="#fff" />
            <Text style={styles.badgeText}>{provider.badge}</Text>
          </View>

          <Text style={styles.providerName}>{provider.name}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons key={i} name="star" size={16} color="#ff6700" />
              ))}
            </View>
            <Text style={styles.ratingText}>{provider.rating} ({provider.reviewsCount} Reviews)</Text>
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.msgButton}>
              <Text style={styles.msgButtonText}>MENSAGEM</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.workButton}>
              <Text style={styles.workButtonText}>ENVIAR TRABALHO</Text>
            </TouchableOpacity>
          </View>

          {/* INFO GRID */}
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>EXPERIENCE</Text>
              <Text style={styles.infoValue}>{provider.experience}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>PROJECTS</Text>
              <Text style={styles.infoValue}>{provider.projects}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>LOCATION</Text>
              <Text style={styles.infoValue}>{provider.location}</Text>
            </View>
            <View style={[styles.infoBox, styles.infoBoxActive]}>
              <Text style={[styles.infoLabel, styles.infoLabelActive]}>AVAILABLE</Text>
              <Text style={[styles.infoValue, styles.infoValueActive]}>{provider.available}</Text>
            </View>
          </View>

          {/* ABOUT SECTION */}
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.aboutText}>{provider.about}</Text>

          {/* SPECIALTIES */}
          <Text style={styles.sectionTitle}>Especialidades</Text>
          <View style={styles.specialtiesContainer}>
            {provider.specialties.map((spec, index) => (
              <View key={index} style={styles.specialtyPill}>
                <Text style={styles.specialtyText}>{spec}</Text>
              </View>
            ))}
          </View>

          {/* PORTFOLIO */}
          <View style={styles.portfolioHeader}>
            <Text style={styles.sectionTitle}>Portfólio</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.portfolioGrid}>
            <View style={styles.largeProjectCard}>
              <Image
                source={{ uri: provider.portfolio[0].image }}
                style={styles.projectImageLarge}
              />
              <View style={styles.projectOverlay}>
                <Text style={styles.projectCategory}>{provider.portfolio[0].category}</Text>
                <Text style={styles.projectTitle}>{provider.portfolio[0].title}</Text>
              </View>
            </View>
            <View style={styles.smallProjectContainer}>
              <View style={styles.smallProjectCard}>
                <Image
                  source={{ uri: provider.portfolio[1].image }}
                  style={styles.projectImageSmall}
                />
                <View style={styles.projectOverlaySmall}>
                  <Text style={styles.projectTitleSmall}>{provider.portfolio[1].title}</Text>
                </View>
              </View>
              <View style={styles.smallProjectCard}>
                <Image
                  source={{ uri: provider.portfolio[2].image }}
                  style={styles.projectImageSmall}
                />
                <View style={styles.projectOverlaySmall}>
                  <Text style={styles.projectTitleSmall}>{provider.portfolio[2].title}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* REVIEWS */}
          <Text style={styles.sectionTitle}>Avaliações</Text>
          {provider.reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Image
                  source={{ uri: `https://i.pravatar.cc/100?u=${review.user}` }}
                  style={styles.reviewAvatar}
                />
                <View>
                  <Text style={styles.reviewUserName}>{review.user}</Text>
                  <Text style={styles.reviewUserRole}>{review.role}</Text>
                </View>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons key={i} name="star" size={12} color="#ff6700" />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  mainAvatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#fff',
  },
  favoriteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a237e', // Dark blue from CLAUDE.md
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  providerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 25,
  },
  msgButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  msgButtonText: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
  workButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#ff6700',
    alignItems: 'center',
  },
  workButtonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  infoBox: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoBoxActive: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  infoLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoLabelActive: {
    color: '#bbb',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoValueActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginTop: 10,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'left',
    marginBottom: 20,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 25,
  },
  specialtyPill: {
    backgroundColor: '#fff0e6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffccaa',
  },
  specialtyText: {
    fontSize: 12,
    color: '#ff6700',
    fontWeight: '500',
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  seeAllText: {
    color: '#ff6700',
    fontWeight: 'bold',
    fontSize: 14,
  },
  portfolioGrid: {
    width: '100%',
    gap: 12,
    marginBottom: 25,
  },
  largeProjectCard: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  projectImageLarge: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  projectOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  projectCategory: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  projectTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  smallProjectContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  smallProjectCard: {
    flex: 1,
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  projectImageSmall: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  projectOverlaySmall: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  projectTitleSmall: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewCard: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewUserRole: {
    fontSize: 12,
    color: '#999',
  },
  reviewStars: {
    marginLeft: 'auto',
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
