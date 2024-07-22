import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import firestore from '@react-native-firebase/firestore'
import colors from 'constants/colors'

const OrderStatus = ({ orderId }) => {
  const [orderDetails, setOrderDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchOrderDetails = useCallback(async () => {
    try {
      const orderDoc = await firestore().collection('orders').doc(orderId).get()
      if (orderDoc.exists) {
        setOrderDetails(orderDoc.data())
      }
    } catch (error) {
      console.error("Error fetching order details: ", error)
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId, fetchOrderDetails])

  const getOrderStatusInfo = (status) => {
    switch (status) {
      case 'received':
        return { updateText: 'Your order has been received', eta: 'Restaurant will start preparing your order soon', dotIndex: 0 }
      case 'on the way':
        return { updateText: 'Your order is on the way', eta: 'Your order will be delivered soon', dotIndex: 1 }
      case 'ready':
        return { updateText: 'Your order is ready for pickup', eta: 'Please pick up your order from the restaurant', dotIndex: 2 }
      case 'picked':
        return { updateText: 'Food Picked up', eta: '15 mins to get delivered to Lockers', dotIndex: 3 }
      case 'delivered':
        return { updateText: 'Your order has been delivered', eta: 'Enjoy your meal!', dotIndex: 4 }
      case 'completed':
        return { updateText: 'Order completed', eta: 'Thank you for using our service', dotIndex: 5 }
      default:
        return { updateText: 'Status unknown', eta: '', dotIndex: -1 }
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.theme} />
      </View>
    )
  }

  if (!orderDetails) {
    return (
      <View style={styles.infoContainer}>
        <Text style={styles.updateText}>Order details not found.</Text>
      </View>
    )
  }

  const { updateText, eta, dotIndex } = getOrderStatusInfo(orderDetails.orderStatus)

  return (
    <View style={styles.infoContainer}>
      <View style={styles.headerContainer}>
        <View style={styles.updateContainer}>
          <Text style={styles.updateTitle}>Latest Update</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchOrderDetails}>
          <Image style={styles.refreshImage} source={require('images/refresh.png')} />
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.updateText}>{updateText}</Text>
      <Text style={styles.eta}>{eta}</Text>
      <View style={styles.dotsContainer}>
        {[...Array(6)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === dotIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  )
}

export default OrderStatus

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    position: 'absolute',
    width: '96%',
    bottom: 80,
    right: '2%',
    left: '2%',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  updateContainer: {
    backgroundColor: 'rgba(211, 242, 255, 1)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  updateTitle: {
    fontSize: 12,
    color: 'rgb(88, 166, 255)',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshImage: {
    width: 16,
    height: 16,
  },
  refreshButtonText: {
    color: colors.theme,
    fontSize: 14,
    marginLeft: 4,
  },
  updateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.theme,
    marginBottom: 4,
  },
  eta: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 14,
    marginBottom: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: 2,
  },
  activeDot: {
    backgroundColor: colors.theme,
  },
})
