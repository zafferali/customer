import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import colors from 'constants/colors';
import BottomBarButton from './BottomBarButton';

const BottomBar = ({ price, btnText, icon, next }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.total}>Total</Text>
        <Text style={styles.price}>{`₹${price}`}</Text>
      </View>
      <View style={styles.rightSection}>
        <BottomBarButton btnText={btnText} icon={icon} next={next} />
      </View>
    </View>
  );
};

export default BottomBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.theme,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 15,
  },
  total: {
    fontSize: 22,
    fontWeight: '600',
    color: '#D8D8D8',
  },
  price: {
    fontSize: 44,
    fontWeight: 'bold',
    color: 'white',
  },
});
