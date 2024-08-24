import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
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
            console.error('Error fetching order details: ', error);
            setIsLoading(false);
          },
        );

      // Cleanup the listener on component unmount
      return () => unsubscribe();
    }
  }, [orderId]);

  const getOrderStatusInfo = status => {
    const calculateTimeDifference = deliveryTime => {
      const [deliveryHour, deliveryMinute] = deliveryTime.split(':').map(Number);
      const now = new Date();
      const deliveryDate = new Date();
      deliveryDate.setHours(deliveryHour, deliveryMinute, 0, 0);
      const differenceInMinutes = Math.round((deliveryDate - now) / (1000 * 60));
      return differenceInMinutes;
    };
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
          ete: `Your food will be dilivered to locker before ${orderDetails.deliveryTime}`,
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

  const { updateText, eta, dotIndex } = getOrderStatusInfo(orderDetails.orderStatus);

  return mapScreen ? (
    /* <View style={styles.headerContainer}>
        <View style={styles.updateContainer}>
          <Text style={styles.updateTitle}>Latest Update</Text>
        </View>
      </View>
     <View style={styles.dotsContainer}>
        {[...Array(6)].map((_, index) => (
          <View key={index} style={[styles.dot, index === dotIndex && styles.activeDot]} />
        ))}
      </View> */
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
    height: 150,
    justifyContent: 'space-between',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  updateContainer: {
    borderRadius: 4,
  },
  updateTitle: {
    fontSize: 12,
    color: '#000',
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
  dotsContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  dot: {
    width: 12,
    height: 4,
    borderRadius: 5,
    backgroundColor: colors.themeLight,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.theme,
    width: 12,
    height: 4,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
});
