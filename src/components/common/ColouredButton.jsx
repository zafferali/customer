import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import colors from 'constants/colors';

const ColouredButton = ({ onPress, title, style, textStyle, icon, textColor, bgColor }) => (
  <TouchableOpacity onPress={onPress} style={[styles.button, style, { backgroundColor: bgColor }]}>
    {icon && <Image source={require('images/phone.png')} style={styles.icon} />}
    <Text style={[styles.text, { color: textColor }]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    minWidth: '100%',
    paddingVertical: 8,
    paddingHorizontal: 25,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: 'center',
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    width: 18,
    height: 18,
  }
});

export default ColouredButton;