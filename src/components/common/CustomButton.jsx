import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import colors from 'constants/colors';

const CustomButton = ({ onPress, title, style, textStyle, icon }) => (
  <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
    {icon && <Image source={require('assets/images/edit.png')} style={styles.icon} />}
    <Text style={[styles.text, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.theme,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  icon: {
    width: 16,
    height: 16,
  },
});

export default CustomButton;
