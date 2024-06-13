import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native'
import firestore from '@react-native-firebase/firestore'

const CustomerList = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersList = []
        const snapshot = await firestore().collection('customers').get()
        snapshot.forEach(doc => {
          customersList.push({ id: doc.id, ...doc.data() })
        })
        setCustomers(customersList)
      } catch (error) {
        console.error('Error fetching customers: ', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  const renderItem = ({ item }) => (
    <View style={styles.customerItem}>
      <Text style={styles.customerName}>{item.name}</Text>
    </View>
  )

  return (
    <FlatList
      data={customers}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
    />
  )
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContainer: {
    padding: 20
  },
  customerItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  customerName: {
    fontSize: 16
  }
})

export default CustomerList
