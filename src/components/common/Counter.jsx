import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import colors from 'constants/colors';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from 'slices/menuSlice';

const Counter = ({onIncrement, onDecrement}) => {
  const [count, setCount] = useState(0)

  const handleIncrement = () => {
    setCount(prevCount => {
      const newCount = prevCount + 1
      onIncrement(newCount)
      return newCount
    })
  }

  const handleDecrement = () => {
    setCount(prevCount => {
      const newCount = Math.max(prevCount - 1, 0) // Prevents negative counts
      onDecrement(newCount)
      return newCount
    })
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleDecrement} style={styles.button}>
        <Image
          source={require('images/minus.png')}
          style={styles.icon}
        />
      </TouchableOpacity>

      <Text style={styles.value}>{count}</Text>

      <TouchableOpacity onPress={handleIncrement} style={styles.button}>
        <Image
          source={require('images/plus.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.themeLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    gap: 4,

  },
  button: {
    
  },
  icon: {
    width: 22, 
    height: 22,
  },
  value: {
    fontSize: 18,
    backgroundColor: 'white',
    color: 'black',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    borderRadius: 4,
  },
  // ... add other styles if needed
});

export default Counter;
