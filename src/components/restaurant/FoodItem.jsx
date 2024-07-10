import { StyleSheet, Text, View, Image } from 'react-native'
import React, { useState } from 'react'
import { GlobalStyles } from 'constants/GlobalStyles'
import colors from 'constants/colors'
import Add from 'common/Add'
import Counter from 'common/Counter'

const FoodItem = ({data, style}) => {
    const [count, setCount] = useState(0)
    const onAdd = () => {
        setCount(prevCount => prevCount + 1 )
    }

    return (
        <View style={[styles.container, GlobalStyles.lightBorder, style]}>
            <View style={styles.itemWrap}>
                <Image style={{ width: 200, height: 200 }} source={{ uri: data.food_thumbnail}} />
                <View>
                    <Text style={styles.title}>{data.name}</Text>
                    <Text style={styles.price}>{data.price}</Text>
                </View>
            </View>
            {count === 0? <Add onPress={onAdd}/> : <Counter /> }
        </View>
    )
}

export default FoodItem

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 20,
    },
    itemWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    thumbnail: {
        width: 125,
        height: 125,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    title: {
        fontSize: 32,
        color: 'black',
        fontWeight: '600',
    },
    price: {
       color: colors.theme,
       fontSize: 18,
       fontWeight: '500',
    }
})