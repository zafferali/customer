import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import colors from 'constants/colors';
import auth from '@react-native-firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { login, register } from 'redux/slices/authenticationSlice';
import { setOtpError, clearOtpError } from 'redux/slices/uiSlice';
import { checkCustomerExists } from '../../firebase/auth';
import OrderStatusModal from './OrderStatusModal';

const LoginScreen = () => {
  const dispatch = useDispatch();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loginScreen, setLoginScreen] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [confirmationObject, setConfirmationObject] = useState(null);
  const [timer, setTimer] = useState(0);
  const [enableResend, setEnableResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef(null);
  const isButtonDisabled = phoneNumber.length < 10;
  const isOtpButtonDisabled = otp.length < 6;
  const phoneNumberInputRef = useRef(null);
  const otpInputRef = useRef(null);
  const otpError = useSelector(state => state.ui.otpError);

  async function sendOtp(phoneNumber) {
    setIsLoading(true);
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber, true); // `true` for invisible reCAPTCHA
      console.log('OTP sent');
      setConfirmationObject(confirmation);
      setLoginScreen(false);
    } catch (error) {
      Alert.alert('Failed to send OTP', error.message);
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
    }
  }

  async function verifyOtp(confirmation, code) {
    setIsLoading(true);
    try {
      const result = await confirmation.confirm(code);
      dispatch(clearOtpError());

      checkCustomerExists(phoneNumber)
        .then(querySnapshot => {
          if (!querySnapshot.empty) {
            const documentSnapshot = querySnapshot.docs[0];
            const customerData = documentSnapshot.data();

            // Convert Firestore references to paths
            const ordersPaths = customerData.orders ? customerData.orders.map(orderRef => orderRef.path) : [];
            dispatch(login({ ...customerData, id: documentSnapshot.id, orders: ordersPaths }));
          } else {
            dispatch(register({ mobile: phoneNumber }));
            setPhoneNumber('');
          }
        })
        .catch(error => {
          Alert.alert(error.message);
        });
    } catch (error) {
      Alert.alert('Failed to verify OTP:', error.message);
      dispatch(setOtpError('Incorrect OTP, please try again.'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!loginScreen) {
      setTimer(45);
      setEnableResend(false);
      timerRef.current = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            clearInterval(timerRef.current);
            setEnableResend(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [loginScreen]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.container}>
      {/* <StatusBar translucent backgroundColor="transparent" /> */}
      <ImageBackground source={require('assets/images/home.png')} style={styles.backgroundImage}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image style={styles.logo} source={require('assets/images/logo.png')} />
          </View>

          <View style={styles.content}>
            <Text style={styles.heading}>Place a new Order</Text>
            {loginScreen ? (
              <>
                <View style={styles.inputContainer}>
                  <View style={[styles.phoneNumberInput, { flex: 1 }]}>
                    <Text style={styles.code}>+91</Text>
                  </View>
                  <TextInput
                    ref={phoneNumberInputRef}
                    autoFocus
                    placeholder="Your Mobile Number"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    keyboardType="phone-pad"
                    inputMode="numeric"
                    maxLength={10}
                    onSubmitEditing={() => {
                      sendOtp(`+91${phoneNumber}`);
                      phoneNumberInputRef.current?.blur();
                    }}
                    style={[styles.phoneNumberInput, { paddingLeft: 24 }]}
                    onChangeText={text => {
                      const filteredText = text.replace(/[^0-9]/g, '');
                      setPhoneNumber(filteredText);
                    }}
                    value={phoneNumber}
                  />
                </View>
                <View style={{ width: '100%', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
                    onPress={() => {
                      sendOtp(`+91${phoneNumber}`);
                      phoneNumberInputRef.current?.blur();
                    }}
                    disabled={isButtonDisabled}
                  >
                    <Text
                      style={[
                        styles.code,
                        isButtonDisabled && {
                          color: 'rgba(255,255,255,0.15)',
                          fontSize: 16,
                          fontWeight: '600',
                        },
                      ]}
                    >
                      Continue
                    </Text>
                  </TouchableOpacity>
                </View>

                <View>
                  <Image style={styles.or} source={require('assets/images/or.png')} />
                </View>

                <View style={{ width: '100%', alignItems: 'center' }}>
                  <TouchableOpacity style={styles.orderStatusButton} onPress={toggleModal}>
                    <Text style={styles.code}>Check Order Status</Text>
                  </TouchableOpacity>
                </View>
                <OrderStatusModal isVisible={isModalVisible} onClose={toggleModal} />
              </>
            ) : (
              <>
                <View>
                  <Text style={styles.otpMessage}>OTP has been sent to +91{phoneNumber}</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    ref={otpInputRef}
                    autoFocus
                    placeholder="Enter OTP"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    keyboardType="phone-pad"
                    inputMode="numeric"
                    maxLength={6}
                    onSubmitEditing={() => {
                      verifyOtp(confirmationObject, otp);
                      otpInputRef.current?.blur();
                      setOtp('');
                    }}
                    style={[styles.phoneNumberInput, { paddingLeft: 24 }]}
                    onChangeText={text => {
                      const filteredText = text.replace(/[^0-9]/g, '');
                      setOtp(filteredText);
                    }}
                    value={otp}
                  />
                </View>
                <View style={styles.dualButtonsContainer}>
                  <View style={styles.dualButton}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        { backgroundColor: colors.bgLight },
                        !enableResend && styles.buttonDisabled,
                      ]}
                      onPress={() => {
                        sendOtp(`+91${phoneNumber}`);
                        otpInputRef.current?.blur();
                      }}
                      disabled={!enableResend}
                    >
                      <Text
                        style={[
                          styles.code,
                          { fontSize: 16 },
                          !enableResend && {
                            color: 'rgba(255,255,255,0.15)',
                            fontSize: 16,
                            fontWeight: '600',
                          },
                        ]}
                      >
                        Resend OTP
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.timerText}>{enableResend ? '' : `Please wait ${timer} seconds`}</Text>
                  </View>
                  <View style={styles.dualButton}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => {
                        verifyOtp(confirmationObject, otp);
                        otpInputRef.current?.blur();
                        setOtp('');
                      }}
                      disabled={isOtpButtonDisabled}
                    >
                      <Text
                        style={[
                          styles.code,
                          { fontSize: 16 },
                          isOtpButtonDisabled && { color: 'rgba(255,255,255,0.5)' },
                        ]}
                      >
                        Get Started
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Change Phone Number */}
                <View style={{ width: '100%', marginTop: 12, alignItems: 'center' }}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.bgLight }]}
                    onPress={() => {
                      setPhoneNumber('');
                      setOtp('');
                      setLoginScreen(true);
                    }}
                  >
                    <Text style={[styles.code, { fontSize: 16 }]}>Change Phone Number</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Terms and Conditions */}
            <View style={styles.terms}>
              <Text style={styles.text}>By signing up, you agree to the</Text>
              <View style={styles.linkContainer}>
                <Text
                  style={styles.linkText}
                  onPress={() => {
                    /* TODO: Navigate to Terms */
                  }}
                >
                  Terms & Policy
                </Text>
                <Text style={styles.text}> & </Text>
                <Text
                  style={styles.linkText}
                  onPress={() => {
                    /* TODO: Navigate to Privacy Policy */
                  }}
                >
                  Privacy Policy
                </Text>
              </View>
            </View>
          </View>
        </View>
        {isLoading ? (
          <View style={styles.overlayStyle}>
            <ActivityIndicator size={25} color={colors.theme} />
          </View>
        ) : null}
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '30%',
  },
  content: {
    // flex: 1,
    paddingTop: '15%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 280,
    height: 100,
  },
  heading: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
    marginTop: 40,
    width: '100%',
  },
  code: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  phoneNumberInput: {
    backgroundColor: colors.bgLight,
    flex: 4,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 6,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'justify',
  },
  button: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 6,
    fontWeight: '600',
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  or: {
    marginVertical: 14,
    maxWidth: '100%',
    resizeMode: 'contain',
  },
  orderStatusButton: {
    paddingVertical: 12,
    borderRadius: 6,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  otpMessage: {
    color: '#EBF0F3B2',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 40,
    marginBottom: -20,
  },
  otpError: {
    color: '#D2474F',
    fontSize: 16,
    fontWeight: '600',
  },
  dualButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    // paddingHorizontal: 40,
  },
  dualButton: {
    flex: 1,
  },
  timerText: {
    fontSize: 12,
    color: 'white',
    marginTop: 5,
    fontWeight: '500',
    textAlign: 'center',
  },
  terms: {
    alignSelf: 'center',
    color: 'white',
    fontSize: 12,
    marginTop: 80,
  },
  text: {
    color: 'white',
    opacity: 0.5,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkText: {
    color: 'white',
    textDecorationLine: 'underline',
    fontWeight: '600',
    fontSize: 12,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  overlayStyle: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: '100%',
    height: '100%',
    justifyContent: 'center', // Ensure this is centered
    alignItems: 'center',
    zIndex: 2,
  },
});

export default LoginScreen;
