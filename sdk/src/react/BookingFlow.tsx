import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MovieConfig, TheaterLocation, BookingConfig, SeatSelection } from '../types';
import { formatShowtime, generateGradientCSS, validateEmail, validatePhone } from '../utils';
import { ANIMATION_PRESETS } from '../constants';

interface BookingFlowProps {
  movie: MovieConfig;
  theater: TheaterLocation;
  onBookingComplete: (booking: BookingConfig) => void;
  mobileOptimized?: boolean;
  theme?: any;
}

type BookingStep = 'showtime' | 'seats' | 'details' | 'payment' | 'confirmation';

export const BookingFlow: React.FC<BookingFlowProps> = ({
  movie,
  theater,
  onBookingComplete,
  mobileOptimized = true,
  theme
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

  const primaryGradient = movie.primary_gradient || { 
    type: 'linear', 
    direction: '135deg', 
    colors: ['#ef4444', '#dc2626'], 
    stops: [0, 100] 
  };

  const containerStyle = {
    padding: mobileOptimized ? '16px' : '24px',
    backgroundColor: movie.background_color || '#000000',
    color: movie.text_color || '#ffffff',
    fontFamily: movie.typography?.font_family || 'Inter, sans-serif'
  };

  const stepHeaderStyle = {
    marginBottom: '24px',
    textAlign: 'center' as const
  };

  const titleStyle = {
    fontSize: mobileOptimized ? '24px' : '32px',
    fontWeight: '700',
    marginBottom: '8px',
    color: movie.accent_color || '#ef4444'
  };

  const subtitleStyle = {
    fontSize: '16px',
    opacity: 0.8,
    marginBottom: '0'
  };

  const buttonStyle = {
    backgroundColor: movie.primary_button?.background_color || '#ef4444',
    color: movie.primary_button?.text_color || '#ffffff',
    border: 'none',
    padding: mobileOptimized ? '12px 24px' : '16px 32px',
    borderRadius: `${movie.primary_button?.border_radius || 8}px`,
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minHeight: mobileOptimized ? '44px' : '48px',
    width: mobileOptimized ? '100%' : 'auto'
  };

  const steps = [
    { id: 'showtime', label: 'Select Showtime', icon: '🎬' },
    { id: 'seats', label: 'Choose Seats', icon: '🎫' },
    { id: 'details', label: 'Your Details', icon: '👤' },
    { id: 'payment', label: 'Payment', icon: '💳' },
    { id: 'confirmation', label: 'Confirmation', icon: '✅' }
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
        // Simulate payment processing
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
        setErrors({ payment: 'Payment failed. Please try again.' });
      } finally {
        setLoading(false);
      }
    } else {
      handleNext();
    }
  };

  return (
    <div style={containerStyle}>
      {/* Progress Indicator */}
      <motion.div 
        style={{ 
          marginBottom: '32px',
          overflowX: 'auto'
        }}
        {...ANIMATION_PRESETS.FADE_IN}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minWidth: mobileOptimized ? '400px' : 'auto',
          padding: mobileOptimized ? '0 16px' : '0'
        }}>
          {steps.map((step, index) => (
            <div
              key={step.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                opacity: index <= currentStepIndex ? 1 : 0.5,
                transition: 'opacity 0.3s ease'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: index <= currentStepIndex 
                  ? movie.accent_color || '#ef4444'
                  : 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                marginBottom: '8px',
                transition: 'all 0.3s ease'
              }}>
                {index < currentStepIndex ? '✓' : step.icon}
              </div>
              <span style={{
                fontSize: mobileOptimized ? '10px' : '12px',
                textAlign: 'center',
                maxWidth: '60px'
              }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 'showtime' && (
          <ShowtimeSelection
            theater={theater}
            selectedFormat={selectedFormat}
            selectedShowtime={selectedShowtime}
            onFormatSelect={setSelectedFormat}
            onShowtimeSelect={setSelectedShowtime}
            mobileOptimized={mobileOptimized}
            theme={theme}
            errors={errors}
          />
        )}

        {currentStep === 'seats' && (
          <SeatSelection
            theater={theater}
            selectedSeats={selectedSeats}
            onSeatSelect={setSelectedSeats}
            mobileOptimized={mobileOptimized}
            theme={theme}
            errors={errors}
          />
        )}

        {currentStep === 'details' && (
          <CustomerDetails
            customerInfo={customerInfo}
            onInfoChange={setCustomerInfo}
            mobileOptimized={mobileOptimized}
            theme={theme}
            errors={errors}
          />
        )}

        {currentStep === 'payment' && (
          <PaymentSection
            movie={movie}
            theater={theater}
            selectedSeats={selectedSeats}
            mobileOptimized={mobileOptimized}
            theme={theme}
            errors={errors}
          />
        )}

        {currentStep === 'confirmation' && (
          <ConfirmationSection
            movie={movie}
            theater={theater}
            selectedSeats={selectedSeats}
            customerInfo={customerInfo}
            mobileOptimized={mobileOptimized}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      {currentStep !== 'confirmation' && (
        <motion.div 
          style={{
            marginTop: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
            flexDirection: mobileOptimized ? 'column-reverse' : 'row'
          }}
          {...ANIMATION_PRESETS.SLIDE_UP}
        >
          {currentStep !== 'showtime' && (
            <motion.button
              onClick={handleBack}
              style={{
                ...buttonStyle,
                backgroundColor: 'transparent',
                border: `2px solid ${movie.accent_color || '#ef4444'}`,
                color: movie.accent_color || '#ef4444'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ← Back
            </motion.button>
          )}

          <motion.button
            onClick={handleStepSubmit}
            disabled={loading}
            style={{
              ...buttonStyle,
              background: loading 
                ? 'rgba(128, 128, 128, 0.5)'
                : generateGradientCSS(primaryGradient),
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <motion.div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff30',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%'
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Processing...
              </div>
            ) : (
              <>
                {currentStep === 'payment' ? 'Complete Booking' : 'Continue'}
                {movie.primary_button?.emoji && ` ${movie.primary_button.emoji}`}
              </>
            )}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

// Sub-components for each step
const ShowtimeSelection: React.FC<any> = ({ 
  theater, selectedFormat, selectedShowtime, onFormatSelect, onShowtimeSelect, 
  mobileOptimized, theme, errors 
}) => (
  <motion.div {...ANIMATION_PRESETS.SLIDE_UP}>
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Select Format</h3>
      {errors.format && <p style={{ color: '#ff4444', fontSize: '14px', marginBottom: '8px' }}>{errors.format}</p>}
      <div style={{
        display: 'grid',
        gridTemplateColumns: mobileOptimized ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px'
      }}>
        {theater.formats.map((format, index) => (
          <motion.button
            key={index}
            onClick={() => onFormatSelect(format.type)}
            style={{
              padding: '16px',
              borderRadius: '8px',
              border: `2px solid ${selectedFormat === format.type ? theme?.accent_color || '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
              backgroundColor: selectedFormat === format.type 
                ? `${theme?.accent_color || '#ef4444'}20`
                : 'rgba(255, 255, 255, 0.05)',
              color: theme?.text_color || '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{format.type}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {format.times.length} showtimes available
            </div>
          </motion.button>
        ))}
      </div>
    </div>

    {selectedFormat && (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Select Showtime</h3>
        {errors.showtime && <p style={{ color: '#ff4444', fontSize: '14px', marginBottom: '8px' }}>{errors.showtime}</p>}
        <div style={{
          display: 'grid',
          gridTemplateColumns: mobileOptimized ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '12px'
        }}>
          {theater.formats
            .find(f => f.type === selectedFormat)
            ?.times.map((time, index) => (
              <motion.button
                key={index}
                onClick={() => onShowtimeSelect(time)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: `2px solid ${selectedShowtime === time ? theme?.accent_color || '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                  backgroundColor: selectedShowtime === time 
                    ? `${theme?.accent_color || '#ef4444'}20`
                    : 'rgba(255, 255, 255, 0.05)',
                  color: theme?.text_color || '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: '600'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {formatShowtime(time)}
              </motion.button>
            ))}
        </div>
      </motion.div>
    )}
  </motion.div>
);

const SeatSelection: React.FC<any> = ({ 
  theater, selectedSeats, onSeatSelect, mobileOptimized, theme, errors 
}) => {
  // Mock seat map - in real implementation, this would come from API
  const seatMap = Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 12 }, (_, seat) => ({
      row: String.fromCharCode(65 + row), // A, B, C, etc.
      seat: seat + 1,
      type: seat < 2 || seat > 9 ? 'premium' : 'standard',
      price: seat < 2 || seat > 9 ? 15.99 : 12.99,
      available: Math.random() > 0.2 // 80% availability
    }))
  );

  const handleSeatClick = (seatInfo: any) => {
    if (!seatInfo.available) return;

    const seatId = `${seatInfo.row}${seatInfo.seat}`;
    const isSelected = selectedSeats.some(s => `${s.row}${s.seat}` === seatId);

    if (isSelected) {
      onSeatSelect(selectedSeats.filter(s => `${s.row}${s.seat}` !== seatId));
    } else {
      onSeatSelect([...selectedSeats, seatInfo]);
    }
  };

  return (
    <motion.div {...ANIMATION_PRESETS.SLIDE_UP}>
      <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Choose Your Seats</h3>
      {errors.seats && <p style={{ color: '#ff4444', fontSize: '14px', marginBottom: '8px' }}>{errors.seats}</p>}
      
      {/* Screen */}
      <div style={{
        width: '100%',
        height: '6px',
        background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
        borderRadius: '3px',
        marginBottom: '32px',
        position: 'relative'
      }}>
        <span style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          opacity: 0.8
        }}>
          SCREEN
        </span>
      </div>

      {/* Seat Map */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '24px',
        overflowX: 'auto',
        padding: '16px'
      }}>
        {seatMap.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ 
              width: '20px', 
              fontSize: '12px', 
              textAlign: 'center',
              fontWeight: '600'
            }}>
              {row[0].row}
            </span>
            {row.map((seat, seatIndex) => {
              const isSelected = selectedSeats.some(s => 
                s.row === seat.row && s.seat === seat.seat
              );
              
              return (
                <motion.button
                  key={seatIndex}
                  onClick={() => handleSeatClick(seat)}
                  disabled={!seat.available}
                  style={{
                    width: mobileOptimized ? '24px' : '28px',
                    height: mobileOptimized ? '24px' : '28px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: seat.available ? 'pointer' : 'not-allowed',
                    fontSize: '10px',
                    fontWeight: '600',
                    backgroundColor: !seat.available 
                      ? '#666666'
                      : isSelected 
                        ? theme?.accent_color || '#ef4444'
                        : seat.type === 'premium'
                          ? '#fbbf24'
                          : 'rgba(255, 255, 255, 0.1)',
                    color: !seat.available 
                      ? '#999999'
                      : isSelected 
                        ? '#ffffff'
                        : seat.type === 'premium'
                          ? '#000000'
                          : '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  whileHover={seat.available ? { scale: 1.1 } : {}}
                  whileTap={seat.available ? { scale: 0.9 } : {}}
                >
                  {seat.seat}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px'
          }} />
          <span style={{ fontSize: '12px' }}>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: theme?.accent_color || '#ef4444',
            borderRadius: '2px'
          }} />
          <span style={{ fontSize: '12px' }}>Selected</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#fbbf24',
            borderRadius: '2px'
          }} />
          <span style={{ fontSize: '12px' }}>Premium</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#666666',
            borderRadius: '2px'
          }} />
          <span style={{ fontSize: '12px' }}>Unavailable</span>
        </div>
      </div>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '16px',
            borderRadius: '8px',
            border: `1px solid ${theme?.accent_color || '#ef4444'}30`
          }}
        >
          <h4 style={{ marginBottom: '8px' }}>Selected Seats ({selectedSeats.length})</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {selectedSeats.map((seat, index) => (
              <span key={index} style={{
                backgroundColor: theme?.accent_color || '#ef4444',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {seat.row}{seat.seat}
              </span>
            ))}
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>
            Total: ${selectedSeats.reduce((sum, seat) => sum + seat.price, 0).toFixed(2)}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const CustomerDetails: React.FC<any> = ({ 
  customerInfo, onInfoChange, mobileOptimized, theme, errors 
}) => {
  const inputStyle = {
    width: '100%',
    padding: mobileOptimized ? '12px 16px' : '16px 20px',
    borderRadius: '8px',
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: theme?.text_color || '#ffffff',
    fontSize: '16px',
    marginBottom: '16px'
  };

  return (
    <motion.div {...ANIMATION_PRESETS.SLIDE_UP}>
      <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>Your Details</h3>
      
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
            Full Name *
          </label>
          <input
            type="text"
            value={customerInfo.name}
            onChange={(e) => onInfoChange({ ...customerInfo, name: e.target.value })}
            style={{
              ...inputStyle,
              borderColor: errors.name ? '#ff4444' : 'rgba(255, 255, 255, 0.1)'
            }}
            placeholder="Enter your full name"
          />
          {errors.name && <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '-12px' }}>{errors.name}</p>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
            Email Address *
          </label>
          <input
            type="email"
            value={customerInfo.email}
            onChange={(e) => onInfoChange({ ...customerInfo, email: e.target.value })}
            style={{
              ...inputStyle,
              borderColor: errors.email ? '#ff4444' : 'rgba(255, 255, 255, 0.1)'
            }}
            placeholder="Enter your email"
          />
          {errors.email && <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '-12px' }}>{errors.email}</p>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => onInfoChange({ ...customerInfo, phone: e.target.value })}
            style={{
              ...inputStyle,
              borderColor: errors.phone ? '#ff4444' : 'rgba(255, 255, 255, 0.1)'
            }}
            placeholder="Enter your phone number"
          />
          {errors.phone && <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '-12px' }}>{errors.phone}</p>}
        </div>
      </div>
    </motion.div>
  );
};

const PaymentSection: React.FC<any> = ({ 
  movie, theater, selectedSeats, mobileOptimized, theme, errors 
}) => {
  const total = selectedSeats.reduce((sum: number, seat: any) => sum + seat.price, 0);
  const tax = total * 0.08;
  const finalTotal = total + tax;

  return (
    <motion.div {...ANIMATION_PRESETS.SLIDE_UP}>
      <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>Payment</h3>
      
      {/* Order Summary */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        border: `1px solid ${theme?.accent_color || '#ef4444'}30`
      }}>
        <h4 style={{ marginBottom: '16px' }}>Order Summary</h4>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>{movie.movie_title}</strong></p>
          <p>{theater.name}</p>
          <p>Seats: {selectedSeats.map((seat: any) => `${seat.row}${seat.seat}`).join(', ')}</p>
          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tax:</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '700' }}>
            <span>Total:</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '16px', opacity: 0.8 }}>
          Secure payment processing powered by Stripe
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span>💳</span>
          <span>🍎</span>
          <span>📱</span>
          <span>🔒</span>
        </div>
        {errors.payment && (
          <p style={{ color: '#ff4444', fontSize: '14px', marginTop: '16px' }}>{errors.payment}</p>
        )}
      </div>
    </motion.div>
  );
};

const ConfirmationSection: React.FC<any> = ({ 
  movie, theater, selectedSeats, customerInfo, mobileOptimized, theme 
}) => (
  <motion.div 
    style={{ textAlign: 'center' }}
    {...ANIMATION_PRESETS.SCALE_IN}
  >
    <motion.div
      style={{
        fontSize: '64px',
        marginBottom: '16px'
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
    >
      🎉
    </motion.div>
    
    <h2 style={{ 
      fontSize: mobileOptimized ? '24px' : '32px',
      marginBottom: '16px',
      color: theme?.accent_color || '#ef4444'
    }}>
      Booking Confirmed!
    </h2>
    
    <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '24px' }}>
      Your tickets have been sent to {customerInfo.email}
    </p>

    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: '24px',
      borderRadius: '12px',
      maxWidth: '400px',
      margin: '0 auto',
      border: `1px solid ${theme?.accent_color || '#ef4444'}30`
    }}>
      <h3 style={{ marginBottom: '16px' }}>Booking Details</h3>
      <div style={{ textAlign: 'left', fontSize: '14px', lineHeight: '1.6' }}>
        <p><strong>Movie:</strong> {movie.movie_title}</p>
        <p><strong>Theater:</strong> {theater.name}</p>
        <p><strong>Seats:</strong> {selectedSeats.map((seat: any) => `${seat.row}${seat.seat}`).join(', ')}</p>
        <p><strong>Confirmation:</strong> #MV{Date.now().toString().slice(-6)}</p>
      </div>
    </div>

    <motion.div
      style={{ marginTop: '24px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <p style={{ fontSize: '12px', opacity: 0.6 }}>
        Please arrive 30 minutes before showtime
      </p>
    </motion.div>
  </motion.div>
);