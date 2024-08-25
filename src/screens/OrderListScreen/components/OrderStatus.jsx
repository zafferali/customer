import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import colors from 'constants/colors';
import CustomButton from 'components/common/CustomButton';

const OrderStatus = ({ orderId, mapScreen, onPress }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      const unsubscribe = firestore()
        .collection('orders')
        .doc(orderId)
        .onSnapshot(
          doc => {
            if (doc.exists) {
              setOrderDetails(doc.data());
            }
            setIsLoading(false);
          },
          error => {
            console.log('Error fetching order details: ', error);
            setIsLoading(false);
          },
        );

      // Cleanup the listener on component unmount
      return () => unsubscribe();
    }
  }, [orderId]);

  const getOrderStatusInfo = status => {
    // const calculateTimeDifference = deliveryTime => {
    //   const [deliveryHour, deliveryMinute] = deliveryTime.split(':').map(Number);
    //   const now = new Date();
    //   const deliveryDate = new Date();
    //   deliveryDate.setHours(deliveryHour, deliveryMinute, 0, 0);
    //   const differenceInMinutes = Math.round((deliveryDate - now) / (1000 * 60));
    //   return differenceInMinutes;
    // };
    switch (status) {
      case 'received':
        return {
          updateText: 'Order Received',
          eta: 'Restaurant will start preparing your order soon',
          dotIndex: 0,
        };
      case 'on the way':
        return {
          updateText: 'Runner Assigned',
          eta: 'Runner has been assigned and is on the way to the restaurant to pick up your order',
          dotIndex: 1,
        };
      case 'ready':
        return {
          updateText: 'Food Prepared',
          eta: 'Your food is ready. Runner will pick up your food in a while',
          dotIndex: 2,
        };
      case 'picked':
        return {
          updateText: 'Food Picked up',
          // eta: `${calculateTimeDifference(orderDetails.deliveryTime)} mins to get delivered to Locker`,
          eta: `Your food will be dilivered to locker before ${orderDetails.deliveryTime}`,
          dotIndex: 3,
        };
      case 'delivered':
        return {
          updateText: 'Food Delivered',
          eta: 'Please pick up your food from the Locker',
          dotIndex: 4,
        };
      case 'completed':
        return {
          updateText: 'Order completed',
          eta: 'Thank you for using our service',
          dotIndex: 5,
        };
      default:
        return {
          updateText: 'Status unknown',
          eta: '',
          dotIndex: -1,
        };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.theme} />
      </View>
    );
  }

  if (!orderDetails) {
    return (
      <View style={styles.infoContainer}>
        <Text style={styles.updateText}>Order details not found.</Text>
      </View>
    );
  }

  const { updateText, eta } = getOrderStatusInfo(orderDetails.orderStatus);

  return mapScreen ? (
    <View>
      <Text style={styles.updateText}>{updateText}</Text>
      <Text style={styles.eta}>{eta}</Text>
    </View>
  ) : (
    <View style={styles.orderStatusContainer}>
      <View style={styles.infoContainer}>
        <View>
          <Text style={styles.updateText}>{updateText}</Text>
          <Text style={styles.eta}>{eta}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton title="Track Order" onPress={onPress} />
        </View>
      </View>
    </View>
  );
};

export default OrderStatus;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 12,
    borderColor: 'rgba(171, 171, 171, 0.29)',
    borderWidth: 2,
    borderRadius: 12,
    margin: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  orderStatusContainer: {
    paddingBottom: 10,
  },
  updateText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
  },
  eta: {
    color: 'gray',
    fontSize: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
});
