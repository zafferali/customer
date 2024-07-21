import { View, TouchableOpacity, StyleSheet, Image, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from 'redux/slices/cartSlice';
import colors from 'constants/colors';

const LineItem = ({ data }) => {
  const dispatch = useDispatch();
  const count = useSelector(
    state => state.cart.items.find(item => item.cartItemId === data.cartItemId)?.quantity || 0,
  );

  const customisationNames = data.customisations
    .filter(cust => !cust.multiOption)
    .flatMap(cust => cust.choices.map(choice => choice.name))
    .join(' ~ ');

  const handleIncrement = () => {
    dispatch(addToCart({ ...data, quantity: 1 }));
  };

  const handleDecrement = () => {
    dispatch(removeFromCart({ cartItemId: data.cartItemId, quantity: 1 }));
  };

  return (
    <View style={styles.lineItem}>
      <View style={styles.itemWrap}>
        <Text style={styles.itemName}>
          {data.name} <Text style={styles.price}>₹{data.price}</Text>
        </Text>
        {customisationNames && <Text style={styles.customisationNames}>{customisationNames}</Text>}
      </View>
      <View style={styles.counterContainer}>
        <TouchableOpacity onPress={handleDecrement} hitSlop={{ top: 25, bottom: 25, left: 15, right: 15 }}>
          <Image source={require('assets/images/minus.png')} style={styles.counterIcon} />
        </TouchableOpacity>
        <Text style={styles.counterValue}>{count}</Text>
        <TouchableOpacity onPress={handleIncrement} hitSlop={{ top: 25, bottom: 25, left: 15, right: 15 }}>
          <Image source={require('assets/images/plus.png')} style={styles.counterIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  counterValue: {
    fontSize: 12,
    backgroundColor: 'white',
    color: 'black',
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginHorizontal: 6,
    borderRadius: 4,
  },
  counterIcon: {
    width: 14,
    height: 14,
  },
  customisationNames: {
    fontSize: 14,
    color: 'gray',
    fontWeight: '600',
  },
  itemName: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 24,
    marginHorizontal: 20,
  },
  price: {
    color: colors.theme,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LineItem;
