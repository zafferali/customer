import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import colors from 'constants/colors';

const Add = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Image style={styles.icon} source={require('assets/images/plus.png')} />
      <Text style={styles.text}>Add</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.themeLight,
    paddingHorizontal: 4,
    paddingRight: 6,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
  },
  icon: {
    width: 15,
    height: 15,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.theme,
  },
});

export default Add;
