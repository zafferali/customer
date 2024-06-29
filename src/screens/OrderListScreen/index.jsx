import React, { useEffect, useState, useCallback } from 'react'
import { View, FlatList, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native'
import Layout from 'common/Layout'
import SearchBar from 'common/SearchBar'
import { GlobalStyles } from 'constants/GlobalStyles'
import colors from 'constants/colors'
import { useSelector } from 'react-redux'
import firestore from '@react-native-firebase/firestore'

const OrderListScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const customerId = useSelector(state => state.authentication.customer.id)

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const customerRef = firestore().doc(`customers/${customerId}`)
      const ordersQuerySnapshot = await firestore().collection('orders')
        .where('customer', '==', customerRef)
        .get()

      const orderDocs = ordersQuerySnapshot.docs
      const restaurantPromises = orderDocs.map(orderDoc => orderDoc.data().restaurant.get())
      const restaurantDocs = await Promise.all(restaurantPromises)

      const loadedOrders = orderDocs.map((orderDoc, index) => {
        const data = orderDoc.data()
        const restaurantData = restaurantDocs[index]?.data()
        if (!data || !restaurantData) return null

        const status = data.orderStatus
        const statusText = status === 'completed' ? 'Completed' : 'Ongoing'
        const displayDate = data.timeStamps.orderCompleted
          ? new Date(data.timeStamps.orderCompleted.toDate()).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
          : ''
        const deliveryTime = status !== 'completed' && data.deliveryTime ? data.deliveryTime : ''

        return {
          id: orderDoc.id,
          name: restaurantData.name,
          image: restaurantData.thumbnailUrl,
          date: displayDate,
          status: statusText,
          deliveryTime
        }
      }).filter(order => order !== null)

      const sortedOrders = loadedOrders.sort((a, b) => {
        if (a.status === 'Ongoing' && b.status === 'Completed') return -1
        if (a.status === 'Completed' && b.status === 'Ongoing') return 1
        return 0
      })

      setOrders(sortedOrders)
    } catch (error) {
      Alert.alert('Error fetching order')
    } finally {
      setIsLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = orders.filter(order =>
    order.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const RenderItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[GlobalStyles.lightBorder, styles.orderItem]}
      onPress={() => navigation.navigate('OrderStatusScreen', { orderId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.thumbnail} />
      <View style={styles.infoContainer}>
        <>
          <Text style={styles.title}>{item.name}</Text>
          {item.date && <Text style={styles.date}>{item.date}</Text>}
          {item.status === 'Ongoing' && item.deliveryTime && <Text style={styles.date}>Pickup Time: {item.deliveryTime}</Text>}
        </>
        <Text style={item.status === 'Completed' ? styles.subtitle : styles.ongoing}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  ), [navigation])

  return (
    <Layout navigation title='Orders'>
      <SearchBar 
        style={{ marginBottom: 15 }} 
        placeholder='Search Restaurants..' 
        onSearch={setSearchQuery}
      />
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : filteredOrders.length === 0 ? (
        <View style={styles.noOrderContainer}>
          <Text style={styles.noOrderText}>No orders found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => <RenderItem item={item} />}
          keyExtractor={item => item.id}
        />
      )}
    </Layout>
  )
}

export default OrderListScreen

const styles = StyleSheet.create({
  orderItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  thumbnail: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 20,
    paddingVertical: 4,
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 14,
    color: 'black',
    fontWeight: '600',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.theme,
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
    color: 'black',
    marginTop: -20,
  },
  ongoing: {
    fontSize: 12,
    fontWeight: '600',
    color: '#407305'
  },
  deliveryTime: {
    fontSize: 12,
    color: 'black',
    marginTop: 5,
  },
  noOrderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noOrderText: {
    fontSize: 16,
    color: 'gray'
  }
})
