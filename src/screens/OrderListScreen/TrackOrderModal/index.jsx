import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, Image, ActivityIndicator, SafeAreaView } from 'react-native'
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps'
import firestore from '@react-native-firebase/firestore'
import colors from 'constants/colors'

const { width, height } = Dimensions.get('window')

const TrackOrderModal = ({ orderId, isVisible, onClose, userLocation, runnerLocation, lockerLocation }) => {
  const [orderDetails, setOrderDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  const fetchOrderDetails = useCallback(async () => {
    setIsLoading(true)
    try {
      const orderDoc = await firestore().collection('orders').doc(orderId).get()
      if (orderDoc.exists) {
        setOrderDetails(orderDoc.data())
      }
    } catch (error) {
      console.error("Error fetching order details: ", error)
    } finally {
      setIsLoading(false)
      setIsDataLoaded(true)
    }
  }, [orderId])

  useEffect(() => {
    if (orderId && isVisible) {
      fetchOrderDetails()
    }
  }, [orderId, isVisible, fetchOrderDetails])

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

  return (
    <SafeAreaView>
      <Modal visible={isVisible} animationType="slide" transparent>
        <View style={styles.modal}>
          <View style={styles.container}>
          <View style={[styles.header, Platform.OS === 'ios' && { marginTop: 60 }]}>
              <Text style={styles.headerText}>Track Order</Text>
              <TouchableOpacity onPress={onClose}>
                <Image source={require('assets/images/close.png')} style={styles.closeButton} />
              </TouchableOpacity>
            </View>
            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.theme} />
              </View>
            ) : !isDataLoaded ? (
              <View style={styles.infoContainer}>
                <Text style={styles.updateText}>Loading...</Text>
              </View>
            ) : !orderDetails ? (
              <View style={styles.infoContainer}>
                <Text style={styles.updateText}>Order details not found.</Text>
              </View>
            ) : (
              <>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker style={styles.center} coordinate={userLocation} tracksViewChanges={false}>
                    <Image source={require('images/user.png')} />
                    <View style={[styles.markerContainer, styles.userBg]}>
                      <Text style={styles.userText}>You</Text>
                    </View>
                  </Marker>
                  <Marker style={styles.center} coordinate={runnerLocation} tracksViewChanges={false}>
                    <Image source={require('images/runner.png')} />
                    <View style={[styles.markerContainer, styles.runnerBg]}>
                      <Text style={styles.runnerText}>Runner</Text>
                    </View>
                  </Marker>
                  <Marker style={styles.center} coordinate={lockerLocation} tracksViewChanges={false}>
                    <Image source={require('images/locker.png')} />
                    <View style={[styles.markerContainer, styles.lockerBg]}>
                      <Text style={styles.lockerText}>Locker</Text>
                    </View>
                  </Marker>
                  <Polyline
                    coordinates={[
                      runnerLocation,
                      { latitude: runnerLocation.latitude, longitude: lockerLocation.longitude },
                      lockerLocation,
                    ]}
                    strokeColor={colors.theme}
                    strokeWidth={2}
                    lineDashPattern={[3, 2]}
                  />
                </MapView>
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
                  <Text style={styles.updateText}>{getOrderStatusInfo(orderDetails.orderStatus).updateText}</Text>
                  <Text style={styles.eta}>{getOrderStatusInfo(orderDetails.orderStatus).eta}</Text>
                  <View style={styles.dotsContainer}>
                    {[...Array(6)].map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          index === getOrderStatusInfo(orderDetails.orderStatus).dotIndex && styles.activeDot,
                        ]}
                      />
                    ))}
                  </View>
                </View>
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity style={styles.button}>
                    <Image style={styles.phone} source={require('images/phone.png')}/>
                    <Text style={styles.buttonText}>Call Runner</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button}>
                  <Image style={styles.phone} source={require('images/phone.png')}/>
                    <Text style={styles.buttonText}>Call Customer Care</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
  },
  container: {
    height: height,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.theme,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 24,
    height: 24,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  center: {
    alignItems: 'center',
  },
  userBg: {
    backgroundColor: 'rgb(194, 233, 255)',
    marginTop: -10,
  },
  runnerBg: {
    backgroundColor: 'rgb(199, 194, 255)',
    marginTop: -10,
  },
  lockerBg: {
    backgroundColor: 'rgb(228, 255, 211)',
    marginTop: -22,
  },
  userText: {
    textAlign: 'center',
    color: colors.theme,
  },
  runnerText: {
    textAlign: 'center',
    color: 'rgb(107, 21, 147)',
  },
  lockerText: {
    textAlign: 'center',
    color: 'rgb(46, 130, 75)',
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
    marginLeft: 8,
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.theme,
  },
  button: {
    backgroundColor: 'rgb(63, 128, 176)',
    padding: 10,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
    borderColor: 'rgb(156, 220, 255)',
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  buttonText: {
    color: 'rgb(156, 220, 255)',
    fontWeight: 'bold',
  },
  phone: {
    width: 18,
    height: 18,
    tintColor: 'rgb(156, 220, 255)'
  }
})

export default TrackOrderModal
