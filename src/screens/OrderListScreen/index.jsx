/* eslint-disable import/no-unresolved */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Layout from 'components/common/Layout';
import SearchBar from 'components/common/SearchBar';
import { GlobalStyles } from 'constants/GlobalStyles';
import colors from 'constants/colors';
import { useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import TrackOrderModal from './TrackOrderModal';

const OrderListScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('ongoing');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const customerId = useSelector(state => state.authentication.customer.id);

  const runnerLocation = { latitude: 19.06523, longitude: 72.86556 };
  const lockerLocation = { latitude: 19.06823, longitude: 72.86356 };

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const customerRef = firestore().doc(`customers/${customerId}`);
      const ordersQuerySnapshot = await firestore()
        .collection('orders')
        .where('customer', '==', customerRef)
        .get();

      const loadedOrders = ordersQuerySnapshot.docs
        .map(orderDoc => {
          const data = orderDoc.data();
          if (!data) return null;

          const status = data.orderStatus;
          const statusText = status === 'completed' || status === 'cancelled' ? 'Past' : 'Ongoing';
          const displayDate = data.timeStamps.orderPlaced
            ? new Date(data.timeStamps.orderPlaced.toDate()).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : '';
          const deliveryTime = status !== 'completed' && data.deliveryTime ? data.deliveryTime : '';

          return {
            id: orderDoc.id,
            name: data.restaurantName,
            branch: data.branchName,
            image: data.restaurantImage,
            orderNum: data.orderNum,
            date: displayDate,
            status: statusText,
            deliveryTime,
          };
        })
        .filter(order => order !== null);

      const sortedOrders = loadedOrders.sort((a, b) => {
        if (a.status === 'Ongoing' && b.status === 'Past') return -1;
        if (a.status === 'Past' && b.status === 'Ongoing') return 1;
        return 0;
      });

      setOrders(sortedOrders);
    } catch (error) {
      Alert.alert('Error fetching orders');
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders]),
  );

  const filteredOrders = orders.filter(
    order =>
      order.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedTab === 'ongoing' ? order.status === 'Ongoing' : order.status === 'Past'),
  );

  const RenderItem = useCallback(
    ({ item }) => (
      <View style={[GlobalStyles.lightBorder, styles.orderItem]}>
        {/* <TouchableOpacity
          style={[GlobalStyles.lightBorder, styles.orderItem]}
          onPress={() =>
            navigation.navigate('OrderStatusScreen', { orderId: item.id })
          }
        > */}
        <View style={styles.orderDetails}>
          <Image source={{ uri: item.image }} style={styles.thumbnail} />
          <View style={styles.infoContainer}>
            <Text style={styles.title}>
              {item.name}
              {item.branch && `, ${item.branch}`}
            </Text>
            {item.status === 'Past' && <Text style={styles.date}>{item.date}</Text>}
            <Text style={styles.orderNum}>Order# {item.orderNum}</Text>
            {item.status === 'Ongoing' && item.deliveryTime && (
              <Text style={styles.date}>Pickup Time: {item.deliveryTime}</Text>
            )}
          </View>
        </View>
        <View style={styles.dualBtnContainer}>
          <TouchableOpacity style={styles.trackButton} onPress={() => {}}>
            <Text style={styles.trackButtonText}>Order Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => {
              setSelectedOrderId(item.id);
              setModalVisible(true);
            }}
          >
            <Image style={styles.navigateIcon} source={require('images/navigate.png')} />
            <Text style={styles.trackButtonText}>Track Order</Text>
          </TouchableOpacity>
        </View>
        {/* </TouchableOpacity> */}
      </View>
    ),
    [],
  );

  return (
    <Layout navigation title="Orders">
      <SearchBar style={styles.mb15} placeholder="Search Restaurants.." onSearch={setSearchQuery} />
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'ongoing' && styles.selectedTab]}
          onPress={() => setSelectedTab('ongoing')}
        >
          <Text style={styles.tabText}>Ongoing Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'past' && styles.selectedTab]}
          onPress={() => setSelectedTab('past')}
        >
          <Text style={styles.tabText}>Past Orders</Text>
        </TouchableOpacity>
      </View>
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
      <TrackOrderModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        runnerLocation={runnerLocation}
        lockerLocation={lockerLocation}
        orderId={selectedOrderId}
      />
    </Layout>
  );
};

export default OrderListScreen;

const styles = StyleSheet.create({
  orderItem: {
    // flexDirection: 'row',
    marginBottom: 10,
  },
  orderDetails: {
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
    paddingVertical: 10,
  },
  title: {
    fontSize: 14,
    color: 'black',
    fontWeight: '600',
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
    color: 'black',
  },
  orderNum: {
    fontSize: 12,
    fontWeight: '600',
    color: 'black',
    marginTop: 5,
  },
  mb15: {
    marginBottom: 15,
  },
  noOrderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrderText: {
    fontSize: 16,
    color: 'gray',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  selectedTab: {
    borderBottomColor: colors.theme,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  dualBtnContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  trackButton: {
    backgroundColor: colors.theme,
    flexDirection: 'row',
    width: '50%',
    justifyContent: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 5,
  },
  trackButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  navigateIcon: {
    width: 16,
    height: 16,
    tintColor: 'white',
  },
});
