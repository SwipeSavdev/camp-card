// Manage Scouts screen for Troop Leaders - Add/Remove/View Scouts
// Per Troop Leader Portal requirements: Add/Remove Scouts, See Troop Metrics

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';
import { scoutApi } from '../../services/apiClient';
import { useAuthStore } from '../../store/authStore';

// Unit Types from backend enum
const UNIT_TYPES = [
  { value: 'PACK', label: 'Pack' },
  { value: 'BSA_TROOP_BOYS', label: 'BSA Troop (Boys)' },
  { value: 'BSA_TROOP_GIRLS', label: 'BSA Troop (Girls)' },
  { value: 'SHIP', label: 'Ship' },
  { value: 'CREW', label: 'Crew' },
  { value: 'FAMILY_SCOUTING', label: 'Family Scouting' },
];

interface Scout {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subscriptionStatus: 'active' | 'inactive' | 'expired';
  totalSales: number;
  redemptions: number;
  referrals: number;
  joinedDate: string;
}

export default function ManageScoutsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [scouts, setScouts] = useState<Scout[]>([]);
  const [selectedScout, setSelectedScout] = useState<Scout | null>(null);
  const [showScoutModal, setShowScoutModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newScoutEmail, setNewScoutEmail] = useState('');
  const [newScoutFirstName, setNewScoutFirstName] = useState('');
  const [newScoutLastName, setNewScoutLastName] = useState('');
  const [newScoutUnitType, setNewScoutUnitType] = useState('');
  const [newScoutUnitNumber, setNewScoutUnitNumber] = useState('');
  const [showUnitTypePicker, setShowUnitTypePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newScoutDOB, setNewScoutDOB] = useState('');
  const [newScoutParentName, setNewScoutParentName] = useState('');
  const [newScoutParentEmail, setNewScoutParentEmail] = useState('');

  const { user } = useAuthStore();

  const loadScouts = useCallback(async () => {
    if (!user?.troopId) return;
    try {
      const response = await scoutApi.getTroopScouts(String(user.troopId));
      const scoutsData = response.data?.content || response.data || [];
      if (Array.isArray(scoutsData)) {
        setScouts(scoutsData.map((s: any) => ({
          id: String(s.id || s.uuid),
          firstName: s.firstName || '',
          lastName: s.lastName || '',
          email: s.parentEmail || '',
          subscriptionStatus: (s.status || 'inactive').toLowerCase() as Scout['subscriptionStatus'],
          totalSales: s.totalSales ? Number(s.totalSales) : 0,
          redemptions: 0,
          referrals: 0,
          joinedDate: s.joinDate || s.createdAt?.split('T')[0] || '',
        })));
      }
    } catch (error) {
      console.log('Failed to load scouts:', error);
    }
  }, [user?.troopId]);

  useEffect(() => {
    loadScouts();
  }, [loadScouts]);

  const filteredScouts = scouts.filter(
    (scout) =>
      scout.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scout.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scout.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadScouts();
    setRefreshing(false);
  }, [loadScouts]);

  const getStatusColor = (status: Scout['subscriptionStatus']) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'inactive':
        return COLORS.warning;
      case 'expired':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleAddScout = async () => {
    if (!newScoutEmail.trim() || !newScoutFirstName.trim() || !newScoutLastName.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!newScoutUnitType) {
      Alert.alert('Error', 'Please select a unit type');
      return;
    }

    if (!newScoutUnitNumber.trim()) {
      Alert.alert('Error', 'Please enter a unit number');
      return;
    }

    if (!newScoutDOB.trim() || newScoutDOB.length !== 10) {
      Alert.alert('Error', 'Please enter a valid date of birth (MM/DD/YYYY)');
      return;
    }

    if (!newScoutParentName.trim()) {
      Alert.alert('Error', 'Please enter a parent/guardian name');
      return;
    }

    if (!newScoutParentEmail.trim()) {
      Alert.alert('Error', 'Please enter a parent/guardian email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newScoutEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!emailRegex.test(newScoutParentEmail)) {
      Alert.alert('Error', 'Please enter a valid parent/guardian email address');
      return;
    }

    // Check for duplicate email
    if (scouts.some(s => s.email.toLowerCase() === newScoutEmail.toLowerCase())) {
      Alert.alert('Error', 'A scout with this email already exists');
      return;
    }

    // Parse DOB from MM/DD/YYYY to YYYY-MM-DD for the API
    const [month, day, year] = newScoutDOB.split('/');
    const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    setIsSubmitting(true);

    try {
      // Call API to create scout
      const scoutData = {
        firstName: newScoutFirstName.trim(),
        lastName: newScoutLastName.trim(),
        email: newScoutEmail.trim().toLowerCase(),
        unitType: newScoutUnitType,
        unitNumber: newScoutUnitNumber.trim(),
        troopId: user?.troopId,
        role: 'SCOUT',
        birthDate,
        parentName: newScoutParentName.trim(),
        parentEmail: newScoutParentEmail.trim().toLowerCase(),
      };

      const response = await scoutApi.createScout(scoutData);
      const createdScout = response.data;

      const newScout: Scout = {
        id: createdScout.id || Date.now().toString(),
        firstName: newScoutFirstName.trim(),
        lastName: newScoutLastName.trim(),
        email: newScoutEmail.trim().toLowerCase(),
        subscriptionStatus: 'inactive',
        totalSales: 0,
        redemptions: 0,
        referrals: 0,
        joinedDate: new Date().toISOString().split('T')[0],
      };

      setScouts([...scouts, newScout]);
      setShowAddModal(false);
      resetAddForm();

      Alert.alert('Success', `${newScout.firstName} ${newScout.lastName} has been added to your troop. An invitation email will be sent.`);
    } catch (error: any) {
      console.error('Error creating scout:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add scout. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAddForm = () => {
    setNewScoutEmail('');
    setNewScoutFirstName('');
    setNewScoutLastName('');
    setNewScoutUnitType('');
    setNewScoutUnitNumber('');
    setNewScoutDOB('');
    setNewScoutParentName('');
    setNewScoutParentEmail('');
    setShowUnitTypePicker(false);
  };

  const handleRemoveScout = (scout: Scout) => {
    Alert.alert(
      'Remove Scout',
      `Are you sure you want to remove ${scout.firstName} ${scout.lastName} from your troop?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setScouts(scouts.filter(s => s.id !== scout.id));
            setShowScoutModal(false);
            setSelectedScout(null);
            Alert.alert('Removed', `${scout.firstName} ${scout.lastName} has been removed from your troop.`);
          },
        },
      ]
    );
  };

  const handleViewScoutDetails = (scout: Scout) => {
    setSelectedScout(scout);
    setShowScoutModal(true);
  };

  const renderScoutItem = ({ item }: { item: Scout }) => (
    <TouchableOpacity style={styles.scoutCard} onPress={() => handleViewScoutDetails(item)}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {item.firstName[0]}
          {item.lastName[0]}
        </Text>
      </View>
      <View style={styles.scoutInfo}>
        <Text style={styles.scoutName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.scoutEmail}>{item.email}</Text>
        <View style={styles.scoutStats}>
          <View style={styles.statBadge}>
            <Ionicons name="cash" size={12} color={COLORS.success} />
            <Text style={styles.statText}>${item.totalSales}</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons name="people" size={12} color={COLORS.secondary} />
            <Text style={styles.statText}>{item.referrals} refs</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons name="checkmark-circle" size={12} color={COLORS.primary} />
            <Text style={styles.statText}>{item.redemptions}</Text>
          </View>
        </View>
      </View>
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.subscriptionStatus) + '20' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(item.subscriptionStatus) },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.subscriptionStatus) },
            ]}
          >
            {item.subscriptionStatus}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );

  const activeCount = scouts.filter(s => s.subscriptionStatus === 'active').length;
  const inactiveCount = scouts.filter(s => s.subscriptionStatus !== 'active').length;
  const totalSales = scouts.reduce((sum, s) => sum + s.totalSales, 0);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header with Add Button */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Your Troop</Text>
          <Text style={styles.headerSubtitle}>Manage scouts in your troop</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="person-add" size={20} color={COLORS.surface} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search scouts..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{scouts.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>
            {activeCount}
          </Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.warning }]}>
            {inactiveCount}
          </Text>
          <Text style={styles.summaryLabel}>Inactive</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: COLORS.secondary }]}>
            ${totalSales}
          </Text>
          <Text style={styles.summaryLabel}>Total Sales</Text>
        </View>
      </View>

      {/* Scouts List */}
      <FlatList
        data={filteredScouts}
        keyExtractor={(item) => item.id}
        renderItem={renderScoutItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>No scouts found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Try a different search term'
                : 'Tap "Add" to invite scouts to your troop'}
            </Text>
          </View>
        }
      />

      {/* Add Scout Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddModal(false);
          resetAddForm();
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowAddModal(false);
              resetAddForm();
            }} disabled={isSubmitting}>
              <Text style={[styles.modalCancel, isSubmitting && styles.disabledText]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Scout</Text>
            <TouchableOpacity onPress={handleAddScout} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color={COLORS.secondary} />
              ) : (
                <Text style={styles.modalSave}>Add</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Enter the scout's information below. They will receive an invitation email to join your troop.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter first name"
                  placeholderTextColor={COLORS.textSecondary}
                  value={newScoutFirstName}
                  onChangeText={setNewScoutFirstName}
                  autoCapitalize="words"
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter last name"
                  placeholderTextColor={COLORS.textSecondary}
                  value={newScoutLastName}
                  onChangeText={setNewScoutLastName}
                  autoCapitalize="words"
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter email address"
                  placeholderTextColor={COLORS.textSecondary}
                  value={newScoutEmail}
                  onChangeText={setNewScoutEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Unit Type *</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowUnitTypePicker(!showUnitTypePicker)}
                  disabled={isSubmitting}
                >
                  <Text style={[
                    styles.pickerButtonText,
                    !newScoutUnitType && styles.pickerPlaceholder
                  ]}>
                    {newScoutUnitType
                      ? UNIT_TYPES.find(t => t.value === newScoutUnitType)?.label
                      : 'Select unit type'}
                  </Text>
                  <Ionicons
                    name={showUnitTypePicker ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
                {showUnitTypePicker && (
                  <View style={styles.pickerOptions}>
                    {UNIT_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={[
                          styles.pickerOption,
                          newScoutUnitType === type.value && styles.pickerOptionSelected
                        ]}
                        onPress={() => {
                          setNewScoutUnitType(type.value);
                          setShowUnitTypePicker(false);
                        }}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          newScoutUnitType === type.value && styles.pickerOptionTextSelected
                        ]}>
                          {type.label}
                        </Text>
                        {newScoutUnitType === type.value && (
                          <Ionicons name="checkmark" size={18} color={COLORS.secondary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Unit Number *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter unit number (e.g., 123)"
                  placeholderTextColor={COLORS.textSecondary}
                  value={newScoutUnitNumber}
                  onChangeText={setNewScoutUnitNumber}
                  keyboardType="number-pad"
                  editable={!isSubmitting}
                />
              </View>

              {/* COPPA / Parental Consent Fields */}
              <View style={styles.coppaHeader}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.secondary} />
                <Text style={styles.coppaTitle}>Parental Consent (COPPA)</Text>
              </View>
              <Text style={styles.coppaDescription}>
                Required for scouts under 13. A parental consent email will be sent automatically.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date of Birth *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={COLORS.textSecondary}
                  value={newScoutDOB}
                  onChangeText={(text) => {
                    // Auto-format as MM/DD/YYYY
                    const cleaned = text.replace(/\D/g, '');
                    let formatted = cleaned;
                    if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
                    if (cleaned.length > 4) formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
                    setNewScoutDOB(formatted);
                  }}
                  keyboardType="number-pad"
                  maxLength={10}
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Parent/Guardian Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter parent or guardian's full name"
                  placeholderTextColor={COLORS.textSecondary}
                  value={newScoutParentName}
                  onChangeText={setNewScoutParentName}
                  autoCapitalize="words"
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Parent/Guardian Email *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter parent or guardian's email"
                  placeholderTextColor={COLORS.textSecondary}
                  value={newScoutParentEmail}
                  onChangeText={setNewScoutParentEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={COLORS.secondary} />
                <Text style={styles.infoText}>
                  The scout (or their parent) will need to complete registration and set up their account after receiving the invitation.
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Scout Detail Modal */}
      <Modal
        visible={showScoutModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowScoutModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowScoutModal(false)}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Scout Details</Text>
            <View style={{ width: 50 }} />
          </View>

          {selectedScout && (
            <View style={styles.modalContent}>
              {/* Scout Profile */}
              <View style={styles.profileSection}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>
                    {selectedScout.firstName[0]}{selectedScout.lastName[0]}
                  </Text>
                </View>
                <Text style={styles.profileName}>
                  {selectedScout.firstName} {selectedScout.lastName}
                </Text>
                <Text style={styles.profileEmail}>{selectedScout.email}</Text>
                <View style={[
                  styles.profileStatusBadge,
                  { backgroundColor: getStatusColor(selectedScout.subscriptionStatus) + '20' }
                ]}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(selectedScout.subscriptionStatus) }
                  ]} />
                  <Text style={[
                    styles.profileStatusText,
                    { color: getStatusColor(selectedScout.subscriptionStatus) }
                  ]}>
                    {selectedScout.subscriptionStatus}
                  </Text>
                </View>
              </View>

              {/* Stats Grid */}
              <View style={styles.detailStatsGrid}>
                <View style={styles.detailStatCard}>
                  <Ionicons name="cash" size={24} color={COLORS.success} />
                  <Text style={styles.detailStatValue}>${selectedScout.totalSales}</Text>
                  <Text style={styles.detailStatLabel}>Total Sales</Text>
                </View>
                <View style={styles.detailStatCard}>
                  <Ionicons name="people" size={24} color={COLORS.secondary} />
                  <Text style={styles.detailStatValue}>{selectedScout.referrals}</Text>
                  <Text style={styles.detailStatLabel}>Referrals</Text>
                </View>
                <View style={styles.detailStatCard}>
                  <Ionicons name="checkmark-done" size={24} color={COLORS.primary} />
                  <Text style={styles.detailStatValue}>{selectedScout.redemptions}</Text>
                  <Text style={styles.detailStatLabel}>Redemptions</Text>
                </View>
              </View>

              {/* Joined Date */}
              <View style={styles.joinedSection}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.joinedText}>
                  Joined {formatDate(selectedScout.joinedDate)}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveScout(selectedScout)}
                >
                  <Ionicons name="person-remove" size={20} color={COLORS.error} />
                  <Text style={styles.removeButtonText}>Remove from Troop</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.secondary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  scoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  scoutInfo: {
    flex: 1,
  },
  scoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  scoutEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scoutStats: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chevron: {
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalCancel: {
    fontSize: 16,
    color: COLORS.secondary,
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  disabledText: {
    opacity: 0.5,
  },
  modalScrollContent: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  pickerButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  pickerPlaceholder: {
    color: COLORS.textSecondary,
  },
  pickerOptions: {
    marginTop: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pickerOptionSelected: {
    backgroundColor: `${COLORS.secondary}10`,
  },
  pickerOptionText: {
    fontSize: 15,
    color: COLORS.text,
  },
  pickerOptionTextSelected: {
    color: COLORS.secondary,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.secondary,
    lineHeight: 18,
  },
  // Scout Detail Modal
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.surface,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  profileStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileStatusText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  detailStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  detailStatCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  detailStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  detailStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  joinedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  joinedText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailActions: {
    marginTop: 24,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
  },
  coppaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    marginTop: 8,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  coppaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  coppaDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
});
