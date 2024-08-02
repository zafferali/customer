import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import Layout from 'components/common/Layout';
import CustomButton from 'components/common/CustomButton';
import { GlobalStyles } from 'constants/GlobalStyles';
import colors from 'constants/colors';
import firestore from '@react-native-firebase/firestore';
import { useSelector, useDispatch } from 'react-redux';
import { setTimeSlot } from 'redux/slices/restaurantsSlice';
import { useFocusEffect } from '@react-navigation/native';
import OrderStatus from '../OrderListScreen/components/OrderStatus';
import TrackOrderModal from '../OrderListScreen/TrackOrderModal';

const TimeSlotScreen = ({ navigation }) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [showModal, setShowModal] = useState(false);
  const customer = useSelector(state => state.authentication.customer);
  const [showTrackOrderModal, setShowTrackOrderModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  console.log('cus', customer?.id);
  const dispatch = useDispatch();

  const populateTimeSlots = startFromTime => {
    const slots = [];
    const endOfDay = new Date();
    endOfDay.setHours(23, 45, 0, 0); // Set the cutoff time to 23:45

    for (let time = new Date(startFromTime); time <= endOfDay; time.setMinutes(time.getMinutes() + 15)) {
      slots.push(formatTime(time));
    }
    setTimeSlots(slots);
  };

  const formatTime = date => {
    return date.toTimeString().substring(0, 5);
  };

  const handleSelectTime = time => {
    setSelectedTime(time);
    setShowModal(false);
  };

  const onGetStarted = () => {
    dispatch(setTimeSlot(selectedTime));
    navigation.navigate('HomeScreen');
    firestore()
      .collection('customers')
      .doc(customer.id)
      .update({
        prevTimeSlot: selectedTime,
      })
      .catch(error => {
        console.log('Error updating Firestore: ', error.message);
      });
  };

  useFocusEffect(
    useCallback(() => {
      const currentTime = new Date();
      const minutesToNextQuarter = 15 - (currentTime.getMinutes() % 15);
      const nextQuarter = new Date(currentTime.getTime() + minutesToNextQuarter * 60000);

      // Calculate the start time which is 90 minutes from the next quarter
      const startFromTime = new Date(nextQuarter.getTime() + 15 * 60000);

      populateTimeSlots(startFromTime);
      setSelectedTime(formatTime(startFromTime)); // Set the initial selected time
    }, []),
  );

  return (
    <Layout title="Choose a Time slot" navigation={navigation}>
      <View style={[GlobalStyles.lightBorder, styles.p20, styles.mt10]}>
        <Text style={styles.title}>Set your Pickup time</Text>
        <Text style={styles.text}>
          Let us know when would like to pick up your food from this station and we’ll curate the listing of
          available restaurants at your selected time accordingly.
        </Text>

        {/* Time slot input */}
        <Text style={styles.label}>Pickup Time</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            setShowModal(true);
          }}
        >
          <Text style={styles.time}>{selectedTime}</Text>
          <Image style={styles.icon} source={require('assets/images/dropdown.png')} />
        </TouchableOpacity>

        <Modal
          transparent={true}
          visible={showModal}
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Pickup Time</Text>
              <ScrollView style={styles.modalContent}>
                {timeSlots.length === 0 ? (
                  <Text style={styles.noSlotsText}>No slots available at this time</Text>
                ) : (
                  timeSlots.map(time => (
                    <TouchableOpacity
                      key={time}
                      style={styles.timeSlot}
                      onPress={() => handleSelectTime(time)}
                    >
                      <Text style={styles.time}>{time}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>

              <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
      <View style={styles.orderStatusContainer}>
        <OrderStatus onPress={() => setShowTrackOrderModal(true)} orderId="10UD8QNpAnwE2uqkF6kR" />
      </View>
      <View style={styles.btnContainer}>
        <CustomButton title="Browse Restaurants" onPress={onGetStarted} />
      </View>
      <TrackOrderModal
        isVisible={showTrackOrderModal}
        onClose={() => setShowTrackOrderModal(false)}
        orderId={selectedOrderId}
      />
    </Layout>
  );
};

export default TimeSlotScreen;

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'black',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#575757',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
    marginBottom: 10,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 6,
    borderColor: 'rgba(171, 171, 171, 0.29)',
    padding: 8,
  },
  time: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.theme,
  },
  icon: {
    width: 22,
    height: 22,
  },
  btnContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'black',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalContent: {
    maxHeight: '80%',
  },
  noSlotsText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  timeSlot: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  closeButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.theme,
  },
  p20: {
    padding: 20,
  },
  mt10: {
    marginTop: 10,
  },
  orderStatusContainer: {
    position: 'absolute',
    bottom: 10,
    right: '4%',
    left: '4%',
  },
});
