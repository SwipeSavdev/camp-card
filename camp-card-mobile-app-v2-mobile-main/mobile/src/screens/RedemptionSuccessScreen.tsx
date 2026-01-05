import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

interface Redemption {
  id: number;
  redemptionCode: string;
  offerId: number;
  userId: number;
  redeemedAt: string;
  expiresAt: string;
}

interface Offer {
  merchantName: string;
  title: string;
  discountPercentage: number;
}

export default function RedemptionSuccessScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { redemption, offer } = route.params as { redemption: Redemption; offer: Offer };
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDone = () => {
    navigation.navigate('Home');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // QR code data for merchant scanning
  const qrData = JSON.stringify({
    type: 'campcard_redemption',
    code: redemption.redemptionCode,
    offerId: redemption.offerId,
    userId: redemption.userId,
    timestamp: redemption.redeemedAt
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        </View>
        
        <Text style={styles.title}>Offer Redeemed!</Text>
        <Text style={styles.subtitle}>
          Show this QR code to the merchant
        </Text>
        
        {/* QR Code */}
        <View style={styles.qrContainer}>
          <QRCode
            value={qrData}
            size={200}
            backgroundColor="white"
            color="black"
          />
        </View>
        
        {/* Redemption Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Ionicons name="storefront" size={20} color="#003f87" />
            <Text style={styles.detailLabel}>Merchant</Text>
          </View>
          <Text style={styles.detailValue}>{offer.merchantName}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Ionicons name="pricetag" size={20} color="#003f87" />
            <Text style={styles.detailLabel}>Discount</Text>
          </View>
          <Text style={styles.detailValue}>{offer.discountPercentage}% OFF</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Ionicons name="timer" size={20} color="#003f87" />
            <Text style={styles.detailLabel}>Valid Until</Text>
          </View>
          <Text style={styles.detailValue}>{formatDate(redemption.expiresAt)}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <Ionicons name="key" size={20} color="#003f87" />
            <Text style={styles.detailLabel}>Code</Text>
          </View>
          <Text style={styles.codeValue}>{redemption.redemptionCode}</Text>
        </View>
        
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Ionicons name="information-circle" size={20} color="#666" />
          <Text style={styles.instructions}>
            This code is valid for one-time use and expires in 15 minutes
          </Text>
        </View>
      </Animated.View>
      
      {/* Done Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={handleDone}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003f87',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  codeValue: {
    fontSize: 18,
    color: '#ce1126',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 15,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  instructions: {
    flex: 1,
    fontSize: 13,
    color: '#856404',
    marginLeft: 10,
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  doneButton: {
    backgroundColor: '#003f87',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
