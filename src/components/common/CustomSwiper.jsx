import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';

const CustomSwiper = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  const onScroll = event => {
    const { contentOffset } = event.nativeEvent;
    const index = Math.round(contentOffset.x / screenWidth);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {React.Children.map(children, child => (
          <View style={[styles.slide, { width: screenWidth }]}>{child}</View>
        ))}
      </ScrollView>
      <View style={styles.dotsContainer}>
        {React.Children.map(children, (_, index) => (
          <View key={index} style={[styles.dot, activeIndex === index ? styles.activeDot : null]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  slide: {
    width: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#000',
  },
});

export default CustomSwiper;
