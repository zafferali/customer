import { StyleSheet, Text, View, Alert, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import Layout from 'common/Layout'
import colors from 'constants/colors'
import { GlobalStyles } from 'constants/GlobalStyles'
import { logoutCustomer } from '../../firebase/auth'
import { useDispatch, useSelector } from 'react-redux'
import { makeCall } from 'utils/makeCall'


const ProfileScreen = ({navigation}) => {
  const dispatch = useDispatch()
  const customer = useSelector(state => state.authentication.customer)
  console.log('cus', customer)
  const handleSettingsPress = () => {
    navigation.navigate('SettingsScreen')
  };

  const handleCallCustomerCarePress = () => {
    Alert.alert(
      'Do you want to call support?',
      'Please keep the Order number ready',
      [
        { 
          text: 'Call', 
          onPress: () => makeCall('+919999978787')
        },
        { 
          text: 'Cancel', 
          style: 'cancel' 
        }
      ],
      { cancelable: true }
    )
  };

  const handleLogoutPress = () => {
    logoutCustomer(navigation, dispatch)
  };

  return (
    <Layout
      showMenu
      navigation={navigation}
      title='Profile'
    >
      <View style={styles.container}>
        {/* <Image source={require('images/profile-placeholder.png')} style={styles.userImage} /> */}
        <Image source={customer.photoUrl? { uri: customer.photoUrl }: require('images/profile-placeholder.png')} style={styles.userImage} />
        <Text style={styles.userName}>{customer.name}</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={[styles.button, styles.topButton]} onPress={handleSettingsPress}>
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleCallCustomerCarePress}>
            <Text style={styles.buttonText}>Call customer care</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[GlobalStyles.lightBorder, {width: '100%', marginTop: 15, paddingVertical: 12 }]} onPress={() => handleLogoutPress()}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </Layout>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  userImage: {
    width: 120,
    height: 120,
    borderRadius: 100,
    marginVertical: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: 'black',
    marginBottom: 20,
    textTransform: 'capitalize'
  },
  buttonGroup: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    marginVertical: 4,
  },
  button: {
    width: '100%',
    padding: 15,
  },
  topButton: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.theme,
  },
})