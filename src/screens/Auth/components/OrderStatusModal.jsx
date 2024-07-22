import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
} from 'react-native';
import colors from 'constants/colors';
import firestore from '@react-native-firebase/firestore';

const OrderStatusModal = ({ isVisible, onClose }) => {
  const [showStatus, setShowStatus] = useState(false);
  const [orderNum, setOrderNum] = useState('');
  const isCheckStatusDisabled = orderNum.length < 6;
  const [orderStatus, setOrderStatus] = useState(null);

  const handleCheckStatus = async () => {
    try {
      const orderQuerySnapshot = await firestore()
        .collection('orders')
        .where('orderNum', '==', orderNum)
        .get();

      if (orderQuerySnapshot.empty) {
        console.log('No order found with this order number.');
        setOrderStatus({
          title: 'Order Not Found',
          description: 'Please check the order number and try again.',
        });
        setShowStatus(true);
        return;
      }

      orderQuerySnapshot.forEach(doc => {
        const { orderStats } = doc.data();
        switch (orderStats) {
          case 'received':
            setOrderStatus({
              title: 'Order Received',
              description: 'Restaurant will start preparing your order soon.',
            });
            break;
          case 'ready':
            setOrderStatus({
              title: 'Order Ready',
              description: 'Your food is ready to be picked up.',
            });
            break;
          case 'picked':
            setOrderStatus({
              title: 'Order Picked up',
              description:
                'Our runner has picked up your order and is on the way to deliver the food to the locker.',
            });
            break;
          case 'delivered':
            setOrderStatus({
              title: 'Order Delivered',
              description:
                'Your order has been delivered to the locker. Please enter the pickup code received on your mobile and pickup your food.',
            });
            break;
          case 'completed':
            setOrderStatus({
              title: 'Order Completed',
              description: 'This is a completed order.',
            });
            break;
          default:
            setOrderStatus({
              title: 'Unknown Status',
              description: 'The status of your order is not recognized.',
            });
        }
        setShowStatus(true);
      });
    } catch (error) {
      console.error('Error fetching order status:', error);
      setOrderStatus({
        title: 'Error',
        description: 'There was an error fetching the order status. Please try again.',
      });
      setShowStatus(true);
    }
  };

  const handleInputChange = text => {
    setOrderNum(text);
    if (showStatus) {
      setShowStatus(false); // Hide status and enable the button again
    }
  };

  const handleClose = () => {
    setShowStatus(false);
    setOrderNum('');
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <ImageBackground
          source={require('assets/images/modal-bg.png')}
          resizeMode="cover"
          style={styles.imageBackground}
        >
          <View style={styles.modalView}>
            <Text style={styles.helloText}>Hello!</Text>
            <Text style={styles.modalText}>Check Order Status</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="rgba(1,1,1,0.25)"
              onChangeText={handleInputChange}
              value={orderNum}
              placeholder="Enter Order Number"
              maxLength={10}
            />
            {showStatus && (
              <View style={styles.statusContainer}>
                <View style={styles.statusTitle}>
                  <Image style={styles.infoIcon} source={require('assets/images/info.png')} />
                  <Text style={styles.statusMessage}>{orderStatus.title}</Text>
                </View>
                <Text style={styles.statusDescription}>{orderStatus.description}</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.button, showStatus ? styles.buttonClose : styles.buttonOpen]}
              onPress={handleCheckStatus}
              disabled={showStatus || isCheckStatusDisabled}
            >
              <Text style={styles.textStyle}>Check Status</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={handleClose}>
              <Text style={styles.textStyle}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end', // Changed to position at the bottom
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  button: {
    padding: 16,
    borderRadius: 6,
    width: '100%',
    marginTop: 10,
  },
  buttonOpen: {
    backgroundColor: 'black',
  },
  buttonClose: {
    backgroundColor: '#9A9A9A',
  },
  helloText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoIcon: {
    width: 16,
    height: 16,
  },
  textStyle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 22,
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderColor: 'black',
    backgroundColor: 'rgba(201, 201, 201, 0.25)',
    borderWidth: 2,
    borderRadius: 6,
    paddingLeft: 10,
    paddingVertical: 16,
    marginVertical: 15,
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
    width: '100%',
  },
  statusContainer: {
    width: '100%',
    backgroundColor: 'rgba(46, 94, 130, .15)',
    borderColor: 'rgba(46, 94, 130, .25)',
    borderWidth: 1,
    borderRadius: 12,
    marginVertical: 20,
    padding: 16,
  },
  statusTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusMessage: {
    fontSize: 18,
    color: colors.theme,
    fontWeight: 'bold',
  },
  statusDescription: {
    fontSize: 14,
    color: colors.theme,
    fontWeight: '500',
    marginTop: 10,
    lineHeight: 34,
  },
});

export default OrderStatusModal;
