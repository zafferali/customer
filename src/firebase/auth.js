// import firestore from '@react-native-firebase/firestore';
// import auth from '@react-native-firebase/auth';
// import { CommonActions } from '@react-navigation/native';
// import { logout } from 'slices/authenticationSlice';
// import { resetCart } from '../redux/slices/cartSlice';


// const db = firestore();

// // check if customer exists in Firestore
// export const checkCustomerExists = async (mobile) => {
//   try {
//     const querySnapshot = await db.collection('customers').where('mobile', '==', mobile).get();
//     return querySnapshot;
//   } catch (error) {
//     console.error('Error checking customer existence:', error);
//     return false;
//   }
// };

// // Store customer details in Firestore
// export const storeCustomerDetails = async (customerDetails) => {
//   try {
//     const docRef = await db.collection('customers').add(customerDetails)
//     const customerId = docRef.id
//     console.log('Customer details stored successfully')
//     return customerId
//   } catch (error) {
//     console.error('Error storing customer details:', error)
//     throw error // Rethrow the error to handle it in the calling function
//   }
// }

// //logout

// export const logoutCustomer = (navigation, dispatch) => {
//   // First reset navigation
//   navigation.dispatch(
//     CommonActions.reset({
//       index: 0,
//       routes: [
//         {
//           name: 'HomeStackScreen',
//           state: {
//             routes: [
//               { name: 'TimeSlotScreen' }
//             ],
//             index: 0
//           }
//         }
//       ]
//     })
//   ); 
//   // Delay the sign out by 3 seconds
//   setTimeout(async () => {
//     try {
//       await auth().signOut()
//       dispatch(logout())
//       dispatch(resetCart())
//     } catch (error) {
//       console.error('Failed to sign out:', error)
//     }
//   });
// }

// auth.js

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { CommonActions } from '@react-navigation/native';
import { logout, login } from 'slices/authenticationSlice';
import { resetCart } from '../redux/slices/cartSlice';
import { useDispatch } from 'react-redux';
import colors from '../constants/colors';

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

export const AuthenticationWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Remove '+91' prefix from the phone number
          const phoneNumberWithoutPrefix = user.phoneNumber.replace('+91', '');
          
          console.log('Querying Firestore for phone number:', phoneNumberWithoutPrefix);
          
          const querySnapshot = await db.collection('customers')
            .where('mobile', '==', phoneNumberWithoutPrefix)
            .limit(1)
            .get();

          console.log('Query result:', querySnapshot.empty ? 'No matching customer' : 'Customer found');

          if (!querySnapshot.empty) {
            const documentSnapshot = querySnapshot.docs[0];
            const customerData = documentSnapshot.data();
            const ordersPaths = customerData.orders ? customerData.orders.map(orderRef => orderRef.path) : [];
            console.log('Dispatching login action');
            dispatch(login({ ...customerData, id: documentSnapshot.id, orders: ordersPaths }));
          } else {
            console.error('User authenticated but not found in Firestore');
            // creating a new customer record
            // or by logging out the user
            // dispatch(logout());
          }
        } catch (error) {
          console.error('Error fetching customer data:', error);
          // Handle the error as needed
        }
      } else {
        console.log('Dispatching logout action');
        dispatch(logout());
      }
      if (initializing) {
        console.log('Initialization complete');
        setInitializing(false);
      }
    });

    return () => subscriber();
  }, [dispatch]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.theme} />
      </View>
    );
  }

  return children;
};
