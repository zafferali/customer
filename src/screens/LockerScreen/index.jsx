import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import Layout from 'components/common/Layout';
import colors from 'constants/colors';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import RazorpayCheckout from 'react-native-razorpay';
import KEYS from 'constants/KEYS';
import firestore from '@react-native-firebase/firestore';
import { GlobalStyles } from 'constants/GlobalStyles';
import { setCurrentOrderId } from 'redux/slices/ordersSlice';
import { resetCart } from 'redux/slices/cartSlice';
import { generateOrderID } from './generateOrderID';
import { generatePickupCode } from './generatePickupCode';

const LockerScreen = ({ navigation }) => {
  const [selectedId, setSelectedId] = useState(1);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isComponentMounted, setIsComponentMounted] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const dispatch = useDispatch();

  const cart = useSelector(state => state.cart);
  const items = cart.items.map(item => ({
    id: item.itemId,
    cartItemId: item.cartItemId,
    price: item.price,
    name: item.name,
    quantity: item.quantity,
  }));
  const customer = useSelector(state => state.authentication.customer);
  const { currentRestaurant, selectedTimeSlot } = useSelector(state => state.restaurants);
  const customerRef = firestore().collection('customers').doc(customer.id);
  const lockerRef = firestore().collection('lockers').doc('GPfcvKf73QLEoh09yZfX');
  const restaurantRef = firestore().collection('restaurants').doc(cart.restaurantId);

  useEffect(() => {
    const getRestaurant = async () => {
      const restaurantDoc = await restaurantRef.get();
      setRestaurant(restaurantDoc.data());
    };

    getRestaurant();
  }, []);

  const briskit_logo =
    'https://firebasestorage.googleapis.com/v0/b/briskit-52b77.appspot.com/o/logo-black.png?alt=media&token=4bf8ca06-8031-41d4-9b54-5f9102a9b0ac';
  const RAZORPAY_CREATE_ORDER = 'https://us-central1-briskit-52b77.cloudfunctions.net/createOrder';
  const RAZORPAY_VERIFY_PAYMENT = 'https://us-central1-briskit-52b77.cloudfunctions.net/verifyPayment';

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(RAZORPAY_CREATE_ORDER, { amount: cart.total });
      const { data } = response;
      if (data && data.id) {
        startPayment(data.id, data.amount); // Razorpay checkout starts here
      } else {
        console.log('Failed to create order');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startPayment = (order_id, amount) => {
    const options = {
      description: `Payment for ${currentRestaurant.name} Order`,
      image: briskit_logo,
      currency: 'INR',
      key: KEYS.razorpay_api,
      amount,
      name: 'Briskit Technology Pvt Ltd',
      order_id,
      prefill: {
        email: customer.email || '',
        contact: customer.mobile,
        name: customer.name || '',
      },
      theme: { color: colors.theme },
    };
    setIsLoading(true);
    RazorpayCheckout.open(options)
      .then(data => {
        const paymentData = {
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_order_id: data.razorpay_order_id,
          razorpay_signature: data.razorpay_signature,
        };
        verifyPayment(paymentData);
        console.log(`Success: ${data.razorpay_payment_id}`);
      })
      .catch(error => {
        console.log(`Error: ${error.code} | ${error.description}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const verifyPayment = async paymentData => {
    setIsProcessingPayment(true);
    try {
      const verificationResponse = await axios.post(RAZORPAY_VERIFY_PAYMENT, paymentData);
      if (verificationResponse.data.success) {
        await createBriskitOrder(paymentData);
        setPaymentSuccess(true);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      Alert.alert(
        `${error.message}`,
        'There was an issue verifying your payment. Please contact customer support.',
      );
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const incrementCustomerOrderCount = async () => {
    const customerDoc = await customerRef.get();

    if (customerDoc.exists) {
      const customerData = customerDoc.data();
      const newOrderCount = (customerData.orderCount || 0) + 1;

      await customerRef.update({
        orderCount: newOrderCount,
      });
    } else {
      await customerRef.set(
        {
          orderCount: 1,
        },
        { merge: true },
      );
    }
  };

  const createBriskitOrder = async paymentData => {
    const generatedOrderId = await generateOrderID();
    const pickupCode = await generatePickupCode(cart.restaurantId, generatedOrderId);

    const orderData = {
      customer: customerRef,
      restaurant: restaurantRef,
      locker: lockerRef,
      customerId: customer.id,
      restaurantId: cart.restaurantId,
      restaurantName: restaurant.name,
      customerName: customer.name,
      ...(restaurant.branch && { branchName: restaurant.branch }),
      restaurantImage: restaurant.thumbnailUrl || '',
      deliveryTime: selectedTimeSlot,
      orderNum: generatedOrderId,
      pickupCode,
      items,
      subTotal: cart.subTotal,
      taxes: {
        gst: cart.tax,
      },
      totalPrice: cart.total,
      orderStatus: 'received',
      paymentInfo: {
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpayPaymentId: paymentData.razorpay_payment_id,
      },
      timeStamps: { orderPlaced: firestore.Timestamp.now() },
    };

    try {
      const docRef = await firestore().collection('orders').add(orderData);
      if (isComponentMounted) {
        setOrderId(docRef.id);
      }
      await incrementCustomerOrderCount();

      return docRef.id; // Optionally return it if needed elsewhere
    } catch (error) {
      console.log('Error adding document: ', error);
    }
  };

  useEffect(() => {
    if (paymentSuccess && orderId) {
      const timer = setTimeout(() => {
        setPaymentSuccess(false);
        dispatch(setCurrentOrderId(orderId));
        dispatch(resetCart());
        navigation.navigate('HomeStackScreen', {
          screen: 'HomeScreen',
          // params: {
          //   orderId,
          // },
        });
      }, 2000); // Show success message for 2 seconds

      return () => clearTimeout(timer);
    }

    return () => {
      setIsComponentMounted(false);
    };
  }, [paymentSuccess, orderId, navigation]);

  const locations = [
    { id: 1, title: 'Front lobby' },
    { id: 2, title: "Women's Hostel" },
  ];

  const renderItem = ({ item }) => {
    const isSelected = item.id === selectedId;
    return (
      <TouchableOpacity
        onPress={() => setSelectedId(item.id)}
        style={[styles.item, isSelected && styles.itemSelected]}
      >
        <View style={styles.radioCircle}>{isSelected && <View style={styles.innerCircle} />}</View>
        <Text style={styles.title}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Layout
        navigation={navigation}
        backTitle="Choose Locker"
        bottomBar
        rightButton
        price={cart.total.toString()}
        icon={require('assets/images/shopping-bag.png')}
        btnText="Checkout"
        onBtnPress={handlePayment}
        isPaymentScreen
        timeDuration={300}
      >
        <Text style={styles.heading}>Available Lockers</Text>
        <View style={GlobalStyles.lightBorder}>
          <FlatList
            data={locations}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            extraData={selectedId}
          />
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={paymentSuccess}
          onRequestClose={() => {
            setPaymentSuccess(false);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Image style={styles.successImage} source={require('assets/images/success.png')} />
              <Text style={styles.successText}>Success!</Text>
              <Text style={styles.successSubText}>Your order has been received.</Text>
            </View>
          </View>
        </Modal>
      </Layout>
      {(isLoading || isProcessingPayment) && (
        <View style={styles.overlayStyle}>
          {isProcessingPayment && (
            <Text style={styles.verifyPaymentText}> Verifying Payment. Please wait..</Text>
          )}
          <ActivityIndicator size="large" color={colors.theme} />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    marginVertical: 14,
  },
  item: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 4,
    alignItems: 'center',
    borderRadius: 4,
  },
  itemSelected: {
    backgroundColor: colors.selectedLightBg,
  },
  radioCircle: {
    height: 16,
    width: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.theme,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  innerCircle: {
    height: 8,
    width: 8,
    borderRadius: 8,
    backgroundColor: colors.theme,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
  },
  // success popup
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.theme,
  },
  modalView: {
    borderRadius: 20,
    alignItems: 'center',
  },
  successImage: {
    width: 250,
    height: 250,
  },
  successText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: -60,
    marginBottom: 15,
  },
  successSubText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  overlayStyle: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  verifyPaymentText: {
    color: 'gray',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
});

export default LockerScreen;
