import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { CommonActions } from '@react-navigation/native';
import { logout } from 'slices/authenticationSlice';
import { resetCart } from '../redux/slices/cartSlice';


const db = firestore();

// check if customer exists in Firestore
export const checkCustomerExists = async (mobile) => {
  try {
    const querySnapshot = await db.collection('customers').where('mobile', '==', mobile).get();
    return querySnapshot;
  } catch (error) {
    console.error('Error checking customer existence:', error);
    return false;
  }
};

// Store customer details in Firestore
export const storeCustomerDetails = async (customerDetails) => {
  try {
    const docRef = await db.collection('customers').add(customerDetails)
    const customerId = docRef.id
    console.log('Customer details stored successfully')
    return customerId
  } catch (error) {
    console.error('Error storing customer details:', error)
    throw error // Rethrow the error to handle it in the calling function
  }
}

//logout

export const logoutCustomer = (navigation, dispatch) => {
  // First reset navigation
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: 'HomeStackScreen',
          state: {
            routes: [
              { name: 'TimeSlotScreen' }
            ],
            index: 0
          }
        }
      ]
    })
  ); 
  // Delay the sign out by 3 seconds
  setTimeout(async () => {
    try {
      await auth().signOut()
      dispatch(logout())
      dispatch(resetCart())
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  });
}

