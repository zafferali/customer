import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { GlobalStyles } from 'constants/GlobalStyles'

const CustomCard = ({ isLightText, text }) => {
  return (
    <View style={GlobalStyles.lightGrayCard}>
      <Text style={[isLightText ? { color: 'rgba(0,0,0,0.5)' } : { color: 'black' }, styles.text]}>{text}</Text>
    </View>
  )
}

export default CustomCard

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    fontWeight: '600',
  }
})