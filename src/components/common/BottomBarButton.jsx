import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

const BottomBarButton = ({onPress, btnText, icon, next}) => {
  return (
    <TouchableOpacity style={styles.btnContainer} onPress={onPress}>
        {icon && <Image source={icon}style={styles.icon}/>}
        <Text style={styles.btnText}>{btnText}</Text>
        {next && <Image style={styles.next} source={require('images/next.png')}/>}
    </TouchableOpacity>
  )
}

export default BottomBarButton

const styles = StyleSheet.create({
    btnContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3F80B0',
        borderRadius: 10,
        borderWidth: 4,
        borderColor: '#9CDCFF',
        paddingHorizontal: 34,
        paddingVertical: 14,
        gap: 20,
    },
    icon: {
        width: 28,
        height: 28,
    },
    next: {
        width: 22,
        height: 22,  
    },
    btnText: {
        color: '#9CDCFF',
        fontSize: 26,
        fontWeight: 'bold',
    }
})