import { View, Text, StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';
import colors from 'constants/colors';
import { GlobalStyles } from 'constants/GlobalStyles';
import Add from 'components/common/Add';
import { addItem, selectItemQuantity } from 'screens/RestaurantScreen/utils/helpers';
import ItemCounter from './ItemCounter';

const FoodItem = ({ data, dispatch, openModal }) => {
  const count = useSelector(state => selectItemQuantity(state, data));
  const restaurantId = useSelector(state => state.restaurants.currentRestaurant.id);

  const dataWithID = data;
  dataWithID.restaurantId = restaurantId;

  return (
    <View style={[styles.foodItemContainer, GlobalStyles.lightBorder]}>
      <View style={styles.itemWrap}>
        {data.thumbnailUrl && <Image style={styles.thumbnail} source={{ uri: data.thumbnailUrl }} />}
        <View>
          <Text style={styles.title}>{data.name}</Text>
          <Text style={styles.price}>₹{data.price}</Text>
        </View>
      </View>
      <View>
        {count === 0 ? (
          <Add onPress={() => addItem(dataWithID, [], dispatch, openModal)} />
        ) : (
          <ItemCounter count={count} dispatch={dispatch} data={dataWithID} openModal={openModal} />
        )}
      </View>
    </View>
  );
};

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
  thumbnail: {
    width: 70,
    height: 70,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  title: {
    fontSize: 14,
    color: 'black',
    fontWeight: '600',
  },
  price: {
    color: colors.theme,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default FoodItem;
