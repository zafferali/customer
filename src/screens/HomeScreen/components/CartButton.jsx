import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Image } from 'react-native';
import colors from 'constants/colors';

const CartButton = ({ navigation, targetScreen, restaurantName, itemCount, restaurantLogo, onPress }) => {
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={[styles.container, { width: screenWidth - 30 }]}>
      <TouchableOpacity style={styles.restaurantInfo} onPress={onPress}>
        <Image source={{ uri: restaurantLogo }} style={styles.logo} />
        <Text style={styles.restaurantName}>{restaurantName}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate(targetScreen)}>
        <Text style={styles.buttonTitle}>View Cart</Text>
        <Text style={styles.itemCount}>{itemCount} items</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // position: 'absolute',
    // bottom: 15,
    // left: 15,
    // right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: colors.theme,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemCount: {
    color: 'white',
    fontSize: 14,
  },
});

export default CartButton;
