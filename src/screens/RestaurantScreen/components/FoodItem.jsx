import { View, Text, StyleSheet, Image } from 'react-native';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetCart, setRestaurantId } from 'redux/slices/cartSlice';
import colors from 'constants/colors';
import { GlobalStyles } from 'constants/GlobalStyles';
import Add from 'components/common/Add';
import { addItem, selectItemQuantity } from 'screens/RestaurantScreen/utils/helpers';
import FastImage from 'react-native-fast-image';
import ItemCounter from './ItemCounter';
import ResetCartModal from './ResetCartModal';
import VegTag from './VegTag';

const FoodItem = ({ data, dispatch, openModal }) => {
  const count = useSelector(state => selectItemQuantity(state, data));
  const restaurantId = useSelector(state => state.restaurants.currentRestaurant.id);
  const cart = useSelector(state => state.cart);
  const [visible, setVisible] = useState(false);
  console.log('data', data.type);

  const onClose = () => {
    setVisible(false);
  };

  const dataWithID = data;
  dataWithID.restaurantId = restaurantId;

  const handleOnPress = () => {
    if (!cart.items.length || restaurantId === cart.items[0].restaurantId) {
      if (!cart.items.length) {
        dispatch(setRestaurantId(restaurantId));
      }
      addItem(dataWithID, [], dispatch, openModal);
    } else {
      setVisible(true);
    }
  };

  const handleReset = async () => {
    await AsyncStorage.removeItem('cart');
    dispatch(resetCart(cart));
    addItem(dataWithID, [], dispatch, openModal);
    setVisible(false);
  };

  return (
    <>
      <ResetCartModal visible={visible} onClose={onClose} onReset={handleReset} />
      <View style={[styles.foodItemContainer, GlobalStyles.lightBorder]}>
        <View style={styles.itemWrap}>
          {data.thumbnailUrl && (
            <FastImage
              style={styles.thumbnail}
              source={{ uri: data.thumbnailUrl, priority: FastImage.priority.high }}
              resizeMode={FastImage.resizeMode.cover}
            />
          )}
          <View style={styles.column}>
            <View>
              <Text style={styles.title}>{data.name}</Text>
              <Text style={styles.price}>₹{data.price}</Text>
            </View>
            {data.type.includes('Veg') && <VegTag />}
          </View>
        </View>
        <View>
          {count === 0 ? (
            <Add onPress={handleOnPress} />
          ) : (
            <ItemCounter count={count} dispatch={dispatch} data={dataWithID} openModal={openModal} />
          )}
        </View>
      </View>
    </>
  );
};

export default FoodItem;

const styles = StyleSheet.create({
  foodItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '50%',
  },
  column: {
    gap: 10,
  },
  thumbnail: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    color: 'black',
    fontWeight: '600',
  },
  price: {
    color: colors.theme,
    fontSize: 14,
    fontWeight: '500',
  },
});
