import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { MovieConfig, TheaterLocation, BookingConfig, SeatSelection } from '../types';
import { formatShowtime, validateEmail, validatePhone } from '../utils';

const { width: screenWidth } = Dimensions.get('window');

interface BookingFlowNativeProps {
  movie: MovieConfig;
  theater: TheaterLocation;
  onBookingComplete: (booking: BookingConfig) => void;
  mobileOptimized?: boolean;
  theme?: any;
  containerStyle?: any;
}

type BookingStep = 'showtime' | 'seats' | 'details' | 'payment' | 'confirmation';

export const BookingFlowNative: React.FC<BookingFlowNativeProps> = ({
  movie,
  theater,
  onBookingComplete,
  mobileOptimized = true,
  theme,
  containerStyle = {}
}) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('showtime');
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [selectedShowtime, setSelectedShowtime] = useState<string>('');
  const [selectedSeats, setSelectedSeats] = useState<SeatSelection[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const styles = createStyles(movie, theme);

  const steps = [
    { id: 'showtime', label: 'Showtime', icon: '🎬' },
    { id: 'seats', label: 'Seats', icon: '🎫' },
    { id: 'details', label: 'Details', icon: '👤' },
    { id: 'payment', label: 'Payment', icon: '💳' },
    { id: 'confirmation', label: 'Done', icon: '✅' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const handleNext = () => {
    const stepOrder: BookingStep[] = ['showtime', 'seats', 'details', 'payment', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const stepOrder: BookingStep[] = ['showtime', 'seats', 'details', 'payment', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 'showtime':
        if (!selectedFormat) newErrors.format = 'Please select a format';
        if (!selectedShowtime) newErrors.showtime = 'Please select a showtime';
        break;
      case 'seats':
        if (selectedSeats.length === 0) newErrors.seats = 'Please select at least one seat';
        break;
      case 'details':
        if (!customerInfo.name.trim()) newErrors.name = 'Name is required';
        if (!validateEmail(customerInfo.email)) newErrors.email = 'Valid email is required';
        if (customerInfo.phone && !validatePhone(customerInfo.phone)) {
          newErrors.phone = 'Valid phone number is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStepSubmit = async () => {
    if (!validateStep()) return;

    if (currentStep === 'payment') {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const booking: BookingConfig = {
          movie_id: movie.id,
          theater_id: theater.id,
          showtime: selectedShowtime,
          format: selectedFormat,
          seats: selectedSeats,
          customer_info: customerInfo
        };

        onBookingComplete(booking);
        setCurrentStep('confirmation');
      } catch (error) {
        Alert.alert('Payment Failed', 'Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      handleNext();
    }
  };

  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.progressContent}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.progressStep}>
            <View style={[
              styles.progressIcon,
              { backgroundColor: index <= currentStepIndex ? movie.accent_color || '#ef4444' : 'rgba(255, 255, 255, 0.1)' }
            ]}>
              <Text style={styles.progressIconText}>
                {index < currentStepIndex ? '✓' : step.icon}
              </Text>
            </View>
            <Text style={[styles.progressLabel, { opacity: index <= currentStepIndex ? 1 : 0.5 }]}>
              {step.label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'showtime':
        return <ShowtimeSelectionNative {...{ theater, selectedFormat, selectedShowtime, setSelectedFormat, setSelectedShowtime, styles, errors }} />;
      case 'seats':
        return <SeatSelectionNative {...{ theater, selectedSeats, setSelectedSeats, styles, errors }} />;
      case 'details':
        return <CustomerDetailsNative {...{ customerInfo, setCustomerInfo, styles, errors }} />;
      case 'payment':
        return <PaymentSectionNative {...{ movie, theater, selectedSeats, styles, errors }} />;
      case 'confirmation':
        return <ConfirmationSectionNative {...{ movie, theater, selectedSeats, customerInfo, styles }} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {renderProgressIndicator()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {currentStep !== 'confirmation' && (
        <View style={styles.buttonContainer}>
          {currentStep !== 'showtime' && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.nextButton, loading && styles.disabledButton]}
            onPress={handleStepSubmit}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.nextButtonText}>Processing...</Text>
              </View>
            ) : (
              <Text style={styles.nextButtonText}>
                {currentStep === 'payment' ? 'Complete Booking' : 'Continue'}
                {movie.primary_button?.emoji && ` ${movie.primary_button.emoji}`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Sub-components
const ShowtimeSelectionNative: React.FC<any> = ({ 
  theater, selectedFormat, selectedShowtime, setSelectedFormat, setSelectedShowtime, styles, errors 
}) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>Select Format</Text>
    {errors.format && <Text style={styles.errorText}>{errors.format}</Text>}
    
    <View style={styles.formatGrid}>
      {theater.formats.map((format, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.formatCard,
            selectedFormat === format.type && styles.formatCardSelected
          ]}
          onPress={() => setSelectedFormat(format.type)}
        >
          <Text style={[styles.formatTitle, selectedFormat === format.type && styles.formatTitleSelected]}>
            {format.type}
          </Text>
          <Text style={[styles.formatSubtitle, selectedFormat === format.type && styles.formatSubtitleSelected]}>
            {format.times.length} showtimes
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    {selectedFormat && (
      <View style={styles.showtimeSection}>
        <Text style={styles.stepTitle}>Select Showtime</Text>
        {errors.showtime && <Text style={styles.errorText}>{errors.showtime}</Text>}
        
        <View style={styles.showtimeGrid}>
          {theater.formats
            .find(f => f.type === selectedFormat)
            ?.times.map((time, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.showtimeButton,
                  selectedShowtime === time && styles.showtimeButtonSelected
                ]}
                onPress={() => setSelectedShowtime(time)}
              >
                <Text style={[
                  styles.showtimeButtonText,
                  selectedShowtime === time && styles.showtimeButtonTextSelected
                ]}>
                  {formatShowtime(time)}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </View>
    )}
  </View>
);

const SeatSelectionNative: React.FC<any> = ({ 
  theater, selectedSeats, setSelectedSeats, styles, errors 
}) => {
  // Mock seat map
  const seatMap = Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 10 }, (_, seat) => ({
      row: String.fromCharCode(65 + row),
      seat: seat + 1,
      type: seat < 2 || seat > 7 ? 'premium' : 'standard',
      price: seat < 2 || seat > 7 ? 15.99 : 12.99,
      available: Math.random() > 0.2
    }))
  );

  const handleSeatPress = (seatInfo: any) => {
    if (!seatInfo.available) return;

    const seatId = `${seatInfo.row}${seatInfo.seat}`;
    const isSelected = selectedSeats.some(s => `${s.row}${s.seat}` === seatId);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => `${s.row}${s.seat}` !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatInfo]);
    }
  };

  const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Your Seats</Text>
      {errors.seats && <Text style={styles.errorText}>{errors.seats}</Text>}

      {/* Screen */}
      <View style={styles.screenContainer}>
        <View style={styles.screen} />
        <Text style={styles.screenLabel}>SCREEN</Text>
      </View>

      {/* Seat Map */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.seatMapContainer}>
          {seatMap.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.seatRow}>
              <Text style={styles.rowLabel}>{row[0].row}</Text>
              {row.map((seat, seatIndex) => {
                const isSelected = selectedSeats.some(s => 
                  s.row === seat.row && s.seat === seat.seat
                );
                
                return (
                  <TouchableOpacity
                    key={seatIndex}
                    style={[
                      styles.seat,
                      !seat.available && styles.seatUnavailable,
                      isSelected && styles.seatSelected,
                      seat.type === 'premium' && styles.seatPremium
                    ]}
                    onPress={() => handleSeatPress(seat)}
                    disabled={!seat.available}
                  >
                    <Text style={[styles.seatText, isSelected && styles.seatTextSelected]}>
                      {seat.seat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, styles.seatAvailable]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, styles.seatSelected]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, styles.seatPremium]} />
          <Text style={styles.legendText}>Premium</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, styles.seatUnavailable]} />
          <Text style={styles.legendText}>Unavailable</Text>
        </View>
      </View>

      {/* Summary */}
      {selectedSeats.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Selected Seats ({selectedSeats.length})</Text>
          <View style={styles.selectedSeatsContainer}>
            {selectedSeats.map((seat, index) => (
              <View key={index} style={styles.selectedSeatBadge}>
                <Text style={styles.selectedSeatText}>{seat.row}{seat.seat}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.totalPrice}>Total: ${total.toFixed(2)}</Text>
        </View>
      )}
    </View>
  );
};

const CustomerDetailsNative: React.FC<any> = ({ 
  customerInfo, setCustomerInfo, styles, errors 
}) => (
  <View style={styles.stepContainer}>
    <Text style={styles.stepTitle}>Your Details</Text>
    
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Full Name *</Text>
      <TextInput
        style={[styles.input, errors.name && styles.inputError]}
        value={customerInfo.name}
        onChangeText={(text) => setCustomerInfo({ ...customerInfo, name: text })}
        placeholder="Enter your full name"
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
      />
      {errors.name && <Text style={styles.inputErrorText}>{errors.name}</Text>}
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Email Address *</Text>
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        value={customerInfo.email}
        onChangeText={(text) => setCustomerInfo({ ...customerInfo, email: text })}
        placeholder="Enter your email"
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.inputErrorText}>{errors.email}</Text>}
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
      <TextInput
        style={[styles.input, errors.phone && styles.inputError]}
        value={customerInfo.phone}
        onChangeText={(text) => setCustomerInfo({ ...customerInfo, phone: text })}
        placeholder="Enter your phone number"
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        keyboardType="phone-pad"
      />
      {errors.phone && <Text style={styles.inputErrorText}>{errors.phone}</Text>}
    </View>
  </View>
);

const PaymentSectionNative: React.FC<any> = ({ 
  movie, theater, selectedSeats, styles, errors 
}) => {
  const total = selectedSeats.reduce((sum: number, seat: any) => sum + seat.price, 0);
  const tax = total * 0.08;
  const finalTotal = total + tax;

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Payment</Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryCardTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Movie:</Text>
          <Text style={styles.summaryValue}>{movie.movie_title}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Theater:</Text>
          <Text style={styles.summaryValue}>{theater.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Seats:</Text>
          <Text style={styles.summaryValue}>
            {selectedSeats.map((seat: any) => `${seat.row}${seat.seat}`).join(', ')}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax:</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabelBold}>Total:</Text>
          <Text style={styles.summaryValueBold}>${finalTotal.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.paymentInfo}>
        <Text style={styles.paymentInfoText}>Secure payment processing powered by Stripe</Text>
        <View style={styles.paymentIcons}>
          <Text style={styles.paymentIcon}>💳</Text>
          <Text style={styles.paymentIcon}>🍎</Text>
          <Text style={styles.paymentIcon}>📱</Text>
          <Text style={styles.paymentIcon}>🔒</Text>
        </View>
        {errors.payment && <Text style={styles.errorText}>{errors.payment}</Text>}
      </View>
    </View>
  );
};

const ConfirmationSectionNative: React.FC<any> = ({ 
  movie, theater, selectedSeats, customerInfo, styles 
}) => (
  <View style={styles.confirmationContainer}>
    <Text style={styles.confirmationIcon}>🎉</Text>
    <Text style={styles.confirmationTitle}>Booking Confirmed!</Text>
    <Text style={styles.confirmationSubtitle}>
      Your tickets have been sent to {customerInfo.email}
    </Text>

    <View style={styles.confirmationCard}>
      <Text style={styles.confirmationCardTitle}>Booking Details</Text>
      <View style={styles.confirmationRow}>
        <Text style={styles.confirmationLabel}>Movie:</Text>
        <Text style={styles.confirmationValue}>{movie.movie_title}</Text>
      </View>
      <View style={styles.confirmationRow}>
        <Text style={styles.confirmationLabel}>Theater:</Text>
        <Text style={styles.confirmationValue}>{theater.name}</Text>
      </View>
      <View style={styles.confirmationRow}>
        <Text style={styles.confirmationLabel}>Seats:</Text>
        <Text style={styles.confirmationValue}>
          {selectedSeats.map((seat: any) => `${seat.row}${seat.seat}`).join(', ')}
        </Text>
      </View>
      <View style={styles.confirmationRow}>
        <Text style={styles.confirmationLabel}>Confirmation:</Text>
        <Text style={styles.confirmationValue}>#MV{Date.now().toString().slice(-6)}</Text>
      </View>
    </View>

    <Text style={styles.confirmationNote}>
      Please arrive 30 minutes before showtime
    </Text>
  </View>
);

const createStyles = (movie: MovieConfig, theme?: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: movie.background_color || '#000000',
  },
  progressContainer: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressContent: {
    paddingHorizontal: 16,
    gap: 24,
  },
  progressStep: {
    alignItems: 'center',
    minWidth: 60,
  },
  progressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressIconText: {
    fontSize: 16,
    color: '#ffffff',
  },
  progressLabel: {
    fontSize: 10,
    color: movie.text_color || '#ffffff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: movie.accent_color || '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginBottom: 8,
  },
  formatGrid: {
    gap: 12,
    marginBottom: 24,
  },
  formatCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  formatCardSelected: {
    borderColor: movie.accent_color || '#ef4444',
    backgroundColor: `${movie.accent_color || '#ef4444'}20`,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: movie.text_color || '#ffffff',
    marginBottom: 4,
  },
  formatTitleSelected: {
    color: movie.accent_color || '#ef4444',
  },
  formatSubtitle: {
    fontSize: 12,
    color: movie.text_color || '#ffffff',
    opacity: 0.8,
  },
  formatSubtitleSelected: {
    opacity: 1,
  },
  showtimeSection: {
    marginTop: 16,
  },
  showtimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  showtimeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    minWidth: 80,
  },
  showtimeButtonSelected: {
    borderColor: movie.accent_color || '#ef4444',
    backgroundColor: `${movie.accent_color || '#ef4444'}20`,
  },
  showtimeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: movie.text_color || '#ffffff',
    textAlign: 'center',
  },
  showtimeButtonTextSelected: {
    color: movie.accent_color || '#ef4444',
  },
  screenContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  screen: {
    width: screenWidth * 0.8,
    height: 6,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    marginBottom: 8,
  },
  screenLabel: {
    fontSize: 12,
    color: movie.text_color || '#ffffff',
    opacity: 0.8,
  },
  seatMapContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  rowLabel: {
    width: 20,
    fontSize: 12,
    fontWeight: '600',
    color: movie.text_color || '#ffffff',
    textAlign: 'center',
  },
  seat: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatSelected: {
    backgroundColor: movie.accent_color || '#ef4444',
  },
  seatPremium: {
    backgroundColor: '#fbbf24',
  },
  seatUnavailable: {
    backgroundColor: '#666666',
  },
  seatAvailable: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  seatText: {
    fontSize: 10,
    fontWeight: '600',
    color: movie.text_color || '#ffffff',
  },
  seatTextSelected: {
    color: '#ffffff',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginVertical: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendSeat: {
    width: 16,
    height: 16,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: movie.text_color || '#ffffff',
  },
  summaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${movie.accent_color || '#ef4444'}30`,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: movie.text_color || '#ffffff',
    marginBottom: 8,
  },
  selectedSeatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  selectedSeatBadge: {
    backgroundColor: movie.accent_color || '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  selectedSeatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: movie.text_color || '#ffffff',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: movie.text_color || '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: movie.text_color || '#ffffff',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  inputErrorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${movie.accent_color || '#ef4444'}30`,
    marginBottom: 24,
  },
  summaryCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: movie.text_color || '#ffffff',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: movie.text_color || '#ffffff',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: movie.text_color || '#ffffff',
    flex: 2,
    textAlign: 'right',
  },
  summaryLabelBold: {
    fontSize: 16,
    fontWeight: '700',
    color: movie.text_color || '#ffffff',
    flex: 1,
  },
  summaryValueBold: {
    fontSize: 16,
    fontWeight: '700',
    color: movie.text_color || '#ffffff',
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  paymentInfo: {
    alignItems: 'center',
  },
  paymentInfoText: {
    fontSize: 14,
    color: movie.text_color || '#ffffff',
    opacity: 0.8,
    marginBottom: 16,
    textAlign: 'center',
  },
  paymentIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  paymentIcon: {
    fontSize: 24,
  },
  confirmationContainer: {
    alignItems: 'center',
    padding: 32,
  },
  confirmationIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: movie.accent_color || '#ef4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmationSubtitle: {
    fontSize: 16,
    color: movie.text_color || '#ffffff',
    opacity: 0.8,
    marginBottom: 24,
    textAlign: 'center',
  },
  confirmationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${movie.accent_color || '#ef4444'}30`,
    width: '100%',
    marginBottom: 24,
  },
  confirmationCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: movie.text_color || '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  confirmationLabel: {
    fontSize: 14,
    color: movie.text_color || '#ffffff',
    fontWeight: '600',
  },
  confirmationValue: {
    fontSize: 14,
    color: movie.text_color || '#ffffff',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  confirmationNote: {
    fontSize: 12,
    color: movie.text_color || '#ffffff',
    opacity: 0.6,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: movie.accent_color || '#ef4444',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: movie.accent_color || '#ef4444',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: movie.accent_color || '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});