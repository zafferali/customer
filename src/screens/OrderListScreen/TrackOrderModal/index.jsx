import React from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal, Image, SafeAreaView, Platform } from 'react-native'
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps'
import colors from 'constants/colors'
import OrderStatus from '../components/OrderStatus'

const { width, height } = Dimensions.get('window')

const TrackOrderModal = ({ orderId, isVisible, onClose, userLocation, runnerLocation, lockerLocation }) => {
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
            <OrderStatus orderId={orderId} />
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
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

export default TrackOrderModal

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
  