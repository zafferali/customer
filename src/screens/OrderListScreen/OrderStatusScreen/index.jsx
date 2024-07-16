import { StyleSheet, Text, View, Image, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import Layout from 'components/common/Layout';
import colors from 'constants/colors';
import CustomButton from 'components/common/CustomButton';
import { logout } from 'redux/slices/authenticationSlice';
import { useDispatch } from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import { makeCall } from 'utils/makeCall';
import { logoutCustomer } from '../../../firebase/auth';

const OrderStatusScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = () => {
    logoutCustomer(navigation, dispatch);
  };

  const callCustomerCare = () => {
    Alert.alert(
      'Do you want to call support?',
      'Please keep the Order number ready',
      [
        {
          text: 'Call',
          onPress: () => makeCall('+919999978787'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  useEffect(() => {
    if (!route.params.orderId) return;

    setIsLoading(true);
    const unsubscribe = firestore()
      .collection('orders')
      .doc(route.params.orderId)
      .onSnapshot(
        documentSnapshot => {
          setIsLoading(false);
          if (documentSnapshot.exists) {
            const orderStatus = documentSnapshot.get('orderStatus');
            console.log('order-status is', orderStatus);
            const statusToStep = {
              received: 1,
              picked: 2,
              delivered: 3,
              completed: 4,
            };
            setCurrentStep(statusToStep[orderStatus] || 1);
          } else {
            console.log('No such order!');
          }
        },
        err => {
          setIsLoading(false);
        },
      );

    return () => unsubscribe();
  }, [route.params.orderId]);

  // Render each step
  const renderStep = (stepNumber, title, description, isLast) => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.stepNumberContainer,
            currentStep >= stepNumber ? styles.activeStepNumberContainer : {},
          ]}
        >
          {currentStep >= stepNumber ? (
            <Image style={{ height: 18, width: 18 }} source={require('assets/images/tick.png')} />
          ) : (
            <Text style={styles.stepCheckMark}>{stepNumber}</Text>
          )}
        </View>
        {!isLast && (
          <View style={styles.dashLineContainer}>
            <View style={[styles.dashLine, currentStep > stepNumber ? styles.activeDashLine : {}]} />
          </View>
        )}
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  );

  return (
    <Layout
      navigation={navigation}
      title="Your Order is Confirmed"
      title2={"Here's what happens next:"}
      bottomBar
      leftBtnText="Call Customer care"
      iconLeft={require('assets/images/phone.png')}
      onLeftBtnPress={callCustomerCare}
    >
      <View style={styles.container}>
        {renderStep(1, 'Order Placed', 'Your order has been successfully placed.', false)}
        {renderStep(
          2,
          'Delivery to Locker',
          "Sit back and relax. We're getting your food delivered to the chosen Locker station.",
          false,
        )}
        {renderStep(
          3,
          'Receive Your PIN by SMS',
          "You'll get a text message with a PIN once your order is safely in the locker.",
          false,
        )}
        {renderStep(
          4,
          'Pick Up Your Order',
          'Enter the PIN at the locker to retrieve your delicious meal. Enjoy it fresh and at the perfect temperature!',
          true,
        )}
      </View>
      <CustomButton
        title="View all Orders"
        style={{ marginTop: 20 }}
        onPress={() => navigation.navigate('OrderListScreen')}
      />
      {isLoading && (
        <View style={styles.overlayStyle}>
          <ActivityIndicator size="large" color={colors.theme} />
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </Layout>
  );
};

export default OrderStatusScreen;

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  stepNumberContainer: {
    width: 35,
    height: 35,
    borderRadius: 100,
    borderColor: colors.theme,
    borderWidth: 2,
    backgroundColor: colors.themeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStepNumberContainer: {
    backgroundColor: colors.theme,
  },
  dashLineContainer: {
    position: 'absolute',
    top: 35,
    left: 17,
    width: 1,
    height: '100%',
    zIndex: -1,
  },
  dashLine: {
    width: '100%',
    minHeight: 40,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.themeLight,
  },
  activeDashLine: {
    borderColor: colors.theme,
  },
  stepContent: {
    flex: 1,
    alignSelf: 'flex-start',
  },
  stepTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
    marginBottom: 2,
  },
  stepDescription: {
    color: colors.theme,
    fontSize: 12,
    fontWeight: '600',
  },
  stepCheckMark: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.theme,
  },
  overlayStyle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.5)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
});
