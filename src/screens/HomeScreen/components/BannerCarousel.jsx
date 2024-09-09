import { useState, useCallback, useEffect } from 'react';
import { View, Image, Dimensions, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width: screenWidth } = Dimensions.get('window');

const BannerCarousel = ({ banners, onPress }) => {
  const [loadedImages, setLoadedImages] = useState({});
  const heightAnim = useState(new Animated.Value(0))[0];

  const onImageLoad = useCallback(index => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  }, []);

  useEffect(() => {
    // Once at least one image has loaded, start animating the height
    if (Object.keys(loadedImages).length > 0) {
      Animated.timing(heightAnim, {
        toValue: 150, // Target height for the carousel
        duration: 300, // Duration of the animation
        useNativeDriver: false, // Animating height, so native driver can't be used
      }).start();
    }
  }, [loadedImages, heightAnim]);

  const renderItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => onPress(item.id)} style={styles.bannerContainer}>
      <Image source={{ uri: item.imageUrl }} style={styles.banner} onLoad={() => onImageLoad(index)} />
    </TouchableOpacity>
  );

  const itemWidth = screenWidth * 0.95;
  const itemSpacing = 20;

  return (
    <Animated.View style={[styles.animatedContainer, { height: heightAnim }]}>
      <Carousel
        loop
        width={itemWidth}
        height={150} // Fixed height for carousel config, but visually controlled by heightAnim
        autoPlay={true}
        autoPlayInterval={2000}
        data={banners}
        renderItem={renderItem}
        scrollAnimationDuration={1000}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        style={{
          alignSelf: 'center',
        }}
        defaultIndex={0}
        panGestureHandlerProps={{
          activeOffsetX: [-10, 10],
        }}
        snapEnabled={true}
        customConfig={{
          itemSpacing,
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedContainer: {
    minHeight: 0, // Ensures layout is correct with no overlap
    overflow: 'hidden', // Ensures no content leaks outside the animated area
  },
  bannerContainer: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: 150, // Target height for the banner images
    resizeMode: 'cover',
  },
});

export default BannerCarousel;
