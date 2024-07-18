import { View, Image, Text, StyleSheet } from 'react-native';
import colors from 'constants/colors';

const TabItem = ({ focused, tabName, iconSrc }) => (
  <View style={styles.menuItem}>
    <Image
      source={iconSrc}
      resizeMode="contain"
      style={[styles.menuIcon, { tintColor: focused ? colors.theme : colors.textLight }]}
    />
    <Text style={[styles.menuText, { color: focused ? colors.theme : colors.textLight }]}>{tabName}</Text>
  </View>
);

const styles = StyleSheet.create({
  menuItem: {
    alignItems: 'center',
  },
  menuIcon: {
    width: 18,
    height: 20,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
});

export default TabItem;
