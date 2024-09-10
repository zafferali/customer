import { StyleSheet, Text, View, Image } from 'react-native';
import { GlobalStyles } from 'constants/GlobalStyles';
import colors from 'constants/colors';
import { TouchableOpacity } from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';

const Restaurant = ({ data, style, onPress, availabilityText }) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(data)}
      style={[styles.container, GlobalStyles.lightBorder, style]}
    >
      {data.thumbnailUrl ? (
        <FastImage
          style={styles.thumbnail}
          source={{
            uri: data.thumbnailUrl,
            priority: FastImage.priority.high,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      ) : (
        <View style={styles.thumbnailFallback}>
          <Image style={styles.logoGreen} source={require('assets/images/logoGreen.png')} />
          <Text style={styles.capital}>{data.name[0].toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>
          {data.name}
          {data.branch && `, ${data.branch}`}
        </Text>
        <View style={styles.middleSection}>
          <View style={styles.ratingsContainer}>
            <Image source={require('assets/images/star.png')} style={styles.starIcon} />
            <Text style={styles.rating}>{data.rating || '4.5'}</Text>
          </View>
          <View style={styles.separator} />
          <Text style={styles.time}>{data.deliveryTime || '15 min(s)'}</Text>
        </View>
        <View style={styles.cuisineContainer}>
          {data.cuisines?.map((item, index) => {
            return (
              <Text key={item} style={styles.cuisine}>
                {item}
                {index < data.cuisines.length - 1 ? ', ' : ''}
              </Text>
            );
          })}
        </View>
        {availabilityText && <Text style={styles.availabilityText}>{availabilityText}</Text>}
      </View>
    </TouchableOpacity>
  );
};

export default Restaurant;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  thumbnail: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
  },
  cuisineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  cuisine: {
    color: colors.theme,
    fontSize: 12,
    fontWeight: '500',
  },
  thumbnailFallback: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#DCFFB1',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoGreen: {
    width: 18,
    height: 18,
    resizeMode: 'center',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  capital: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 20,
  },
  availabilityText: {
    marginTop: 5,
    fontSize: 12,
    color: 'gray',
  },
  middleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: 'rgb(142, 142, 142)',
  },
  starIcon: {
    width: 12,
    height: 12,
  },
  ratingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 213, 182, 0.25)',
    borderRadius: 12,
    padding: 6,
  },
  rating: {
    color: 'rgba(255, 161, 52, 1)',
    fontSize: 12,
    fontWeight: '600',
  },
  time: {
    color: 'rgb(125, 125, 125)',
    fontSize: 11,
    fontWeight: '600',
  },
});
