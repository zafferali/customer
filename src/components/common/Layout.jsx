import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import { useSelector } from 'react-redux';
import colors from 'constants/colors';

const Layout = (
  {
    children,
    navigation,
    title,
    title2,
    backTitle,
    onBtnPress,
    isPaymentScreen,
    rightButton,
    bottomBar,
    price,
    icon,
    next,
    btnText,
    iconLeft,
    leftBtnText,
    onLeftBtnPress,
    timeDuration
  }) => { 

    const items = useSelector(state => state.cart.items)

    return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
    >
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.container}>
        <View style={styles.headerContainer}>
          {backTitle ?
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image style={styles.backBtn} source={require('images/back.png')} />
              </TouchableOpacity>
              <Text style={styles.backTitle}>{backTitle}</Text>
            </View> :
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
              {title2 && <Text style={styles.title2}>{title2}</Text>}
            </View>
          }
        </View>
        {children}
      </View>
      {(bottomBar && items.length != 0) &&
        <View style={styles.bottomBarContainer}>
          {price &&
            <View style={styles.leftSection}>
              <Text style={styles.total}>Total</Text>
              <Text style={styles.price}>₹{price}</Text>
            </View>}
          {leftBtnText &&
            <TouchableOpacity style={styles.btnContainer} onPress={onLeftBtnPress}>
              <Image source={iconLeft} style={styles.iconLeft} />
              <Text style={styles.btnText}>{leftBtnText}</Text>
          </TouchableOpacity>
          }
          {rightButton &&
            <View style={styles.rightSection}>
              <TouchableOpacity style={styles.btnContainer} onPress={onBtnPress}>
                {icon && <Image source={icon} style={styles.icon} />}
                <Text style={styles.btnText}>{btnText}</Text>
                {next && <Image style={styles.next} source={require('images/next.png')} />}
              </TouchableOpacity>
            </View>}
        </View>}
        </SafeAreaView>
    </KeyboardAvoidingView>
    
  )}

export default Layout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    width: 32,
    height: 36,
  },
  backTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
  },
  titleContainer: {
    flexDirection: 'column'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  title2: {
    color: colors.theme,
    fontSize: 16,
    fontWeight: '600'
  },
  // bottom bar
  bottomBarContainer: {
    backgroundColor: colors.theme,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D8D8D8',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  // bottom bar button
  rightSection: {
    flex: 1,
  },

  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#3F80B0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#9CDCFF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 8,
  },
  icon: {
    width: 16,
    height: 16,
  },
  next: {
    width: 14,
    height: 14,
  },
  btnText: {
    color: '#9CDCFF',
    fontSize: 14,
    fontWeight: '600',
  },
  iconLeft: {
    tintColor: '#9CDCFF',
    width: 12,
    height: 12,
  }
})

