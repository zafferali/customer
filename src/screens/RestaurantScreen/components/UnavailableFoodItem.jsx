import { View, StyleSheet, Text, Image } from 'react-native';
import colors from 'constants/colors';
import { GlobalStyles } from 'constants/GlobalStyles';

const UnavailableFoodItem = ({ data }) => (
  <View style={[styles.foodItemContainer, styles.unavailable, GlobalStyles.lightBorder]}>
    <View style={styles.itemWrap}>
      {data.thumbnailUrl && <Image style={styles.thumbnail} source={{ uri: data.thumbnailUrl }} />}
      <View>
        <Text style={styles.title}>{data.name}</Text>
        <Text style={styles.price}>₹{data.price}</Text>
        <Text style={styles.availabilityText}>Available from {data.availability.from}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  availabilityText: {
    fontSize: 12,
    color: 'gray',
    fontStyle: 'italic',
  },
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
  unavailable: {
    backgroundColor: 'rgba(1,1,1, 0.1)',
    opacity: 0.5,
  },
});

export default UnavailableFoodItem;
