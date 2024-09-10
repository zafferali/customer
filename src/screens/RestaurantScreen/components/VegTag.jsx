import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const VegTag = () => {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.text}> Veg</Text>
    </View>
  );
};

export default VegTag;

const styles = StyleSheet.create({
  container: {
    borderColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(156, 255, 42, 1)',
  },
  text: {
    color: '#000',
    fontSize: 12,
  },
});
