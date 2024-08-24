import { useState, useCallback } from 'react';
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
import { GlobalStyles } from 'constants/GlobalStyles';
import colors from 'constants/colors';
import { useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import TrackOrderModal from './components/TrackOrderModal';

const OrderListScreen = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('ongoing');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const customerId = useSelector(state => state.authentication.customer.id);

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
            items: data.items,
            totalPrice: data.totalPrice,
            restaurantName: data.restaurantName,
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
      order.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedTab === 'ongoing' ? order.status === 'Ongoing' : order.status === 'Past'),
  );

  const RenderItem = useCallback(
    ({ item }) => (
      <View style={styles.orderItem}>
        <View style={styles.orderDetails}>
          {/* <Image source={{ uri: item.image }} style={styles.thumbnail} /> */}
          <View style={styles.infoContainer}>
            <Text style={styles.title}>
              {item.restaurantName}
              {item.branch && `, ${item.branch}`}
            </Text>
            <View>
              <Text style={styles.orderNum}>Order #{item.orderNum}</Text>
              {item.status === 'Past' && <Text style={styles.date}>{item.date}</Text>}
            </View>
          </View>
        </View>
        <Text style={styles.itemCount}>{item.items.length} item(s)</Text>
        <View style={styles.itemsContainer}>
          <View style={styles.items}>
            <Text style={styles.foodItemsText}>
              {item.items.map(
                (foodItem, index) =>
                  `${foodItem.name} x ${foodItem.quantity}${index < item.items.length - 1 ? ', ' : ''}`,
              )}
            </Text>
          </View>
          <Text style={styles.totalPrice}>₹ {item.totalPrice}</Text>
        </View>
        <View style={styles.dualBtnContainer}>
          <TouchableOpacity
            style={styles.borderBtn}
            onPress={() => {
              setSelectedOrderId(item.id);
              setModalVisible(true);
            }}
          >
            <Text style={styles.trackButtonText}>
              {item.status !== 'Past' ? 'Track Order' : 'Order details'}
            </Text>
            {item.status !== 'Past' && (
              <Image style={styles.navigateIcon} source={require('assets/images/arrow-fill.png')} />
            )}
          </TouchableOpacity>
          {item.status === 'Ongoing' && item.deliveryTime && (
            <Text style={styles.pickupTime}>
              Pickup Time: <Text style={styles.time}>{item.deliveryTime}</Text>
            </Text>
          )}
        </View>
      </View>
    ),
    [],
  );

  return (
    <Layout navigation>
      {/* <SearchBar style={styles.mb15} placeholder="Search Restaurants.." onSearch={setSearchQuery} /> */}
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
        orderId={selectedOrderId}
      />
    </Layout>
  );
};

export default OrderListScreen;

const styles = StyleSheet.create({
  orderItem: {
    marginBottom: 30,
  },
  orderDetails: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  // thumbnail: {
  //   width: 80,
  //   height: 80,
  //   resizeMode: 'cover',
  //   borderRadius: 8,
  // },
  infoContainer: {
    flex: 1,
    // marginLeft: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 16,
    color: 'black',
    fontWeight: '700',
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
    color: 'black',
  },
  orderNum: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
    marginBottom: 2,
  },
  itemsContainer: {
    marginVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingBottom: 16,
  },

  itemCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  items: {
    width: '75%',
  },
  foodItemsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  totalPrice: {
    color: colors.theme,
    fontSize: 14,
    fontWeight: '600',
  },
  pickupTime: {
    fontSize: 14,
    fontWeight: '600',
    color: 'gray',
  },
  time: {
    color: '#000',
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackButtonText: {
    color: colors.theme,
    fontSize: 14,
    fontWeight: 'bold',
  },
  navigateIcon: {
    width: 10,
    height: 10,
    tintColor: colors.theme,
  },
  borderBtn: {
    borderColor: colors.theme,
    borderWidth: 2,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
