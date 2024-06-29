import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { GlobalStyles } from 'constants/GlobalStyles'
import colors from 'constants/colors'
import { TouchableOpacity } from 'react-native-gesture-handler'

const Restaurant = ({data, style, onPress, availabilityText}) => {

    return (
        <TouchableOpacity onPress={() => onPress(data)} style={[styles.container, GlobalStyles.lightBorder, style]}>
            {data.thumbnailUrl ?
            <Image style={styles.thumbnail} source={{uri: data.thumbnailUrl}}/> :
            <View style={styles.thumbnailFallback}>
                <Image style={styles.logoGreen} source={require('images/logoGreen.png')}/>
                <Text style={styles.capital}>{data.name[0].toUpperCase()}</Text>
            </View>}
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{data.name}{data.branch && `, ${data.branch}`}</Text>
                <View style={styles.cuisineContainer}>
                {data.cuisines?.map((item, index) => {
                    return (
                        <Text key={index} style={styles.cuisine}>{item}{index < data.cuisines.length - 1 ? ', ' : ''}</Text>
                    )
                })}
                </View>
                {availabilityText && <Text style={styles.availabilityText}>{availabilityText}</Text>}
            </View>
        </TouchableOpacity>
    )
}

export default Restaurant

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    thumbnail: {
        width: 70,
        height: 70,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    title: {
        fontSize: 16,
        color: 'black',
        fontWeight: '600',
    },
    cuisineContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    cuisine: {
        color: colors.theme,
        fontSize: 12,
        fontWeight: '500',
    },
    thumbnailFallback: {
        width: 125,
        height: 125,
        borderRadius: 8,
        backgroundColor: '#DCFFB1',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoGreen: {
        width: 18,
        height: 18,
        resizeMode: 'center',
        position: 'absolute',
        top: 10,
        right: 10,
    },
    capital: {
        fontSize: 68,
        fontWeight: 'bold',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 20,
    },
    availabilityText: {
        marginTop: 5,
        fontSize: 12,
        color: 'gray',
    }
})
