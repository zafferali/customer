import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity, Image, View, Text, StyleSheet } from 'react-native';
import { addItem, removeItem } from 'screens/RestaurantScreen/utils/helpers';
import colors from 'constants/colors';
import { useSelector } from 'react-redux';

const ItemCounter = React.memo(({ count, dispatch, data, openModal }) => {
  const cartItems = useSelector(state => state.cart.items);
  
  const filteredCartItems = useMemo(() => 
    cartItems.filter(item => item.itemId === data.id),
    [cartItems, data.id]
  );
  
  const customisations = useMemo(() => 
    cartItems.find(item => item.itemId === data.id)?.customisations || [],
    [cartItems, data.id]
  );

  const handleIncrement = useCallback(() => {
    addItem(data, customisations, dispatch, openModal);
  }, [data, customisations, dispatch, openModal]);

  const handleDecrement = useCallback(() => {
    if (filteredCartItems.length > 0) {
      const lastAddedItem = filteredCartItems[filteredCartItems.length - 1];
      removeItem(lastAddedItem.cartItemId, dispatch);
    }
  }, [filteredCartItems, dispatch]);

  return (
    <View style={styles.counterContainer}>
      <TouchableOpacity onPress={handleDecrement} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
        <Image source={require('assets/images/minus.png')} style={styles.icon} />
      </TouchableOpacity>
      <Text style={styles.value}>{count}</Text>
      <TouchableOpacity onPress={handleIncrement} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
        <Image source={require('assets/images/plus.png')} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
});

export default ItemCounter;

const styles = StyleSheet.create({
  counterContainer: {
    backgroundColor: colors.themeLight,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    gap: 4,
  },
  icon: {
    width: 14,
    height: 14,
  },
  value: {
    fontSize: 12,
    backgroundColor: 'white',
    color: 'black',
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginHorizontal: 6,
    borderRadius: 4,
  },
});

