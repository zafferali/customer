import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import colors from 'constants/colors';
import { useDispatch } from 'react-redux';
import { setManualLocation } from 'redux/slices/authenticationSlice';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const ManualLocationModal = ({ isVisible, onClose }) => {
  const dispatch = useDispatch();

  const cards = [
    { id: 1, text: 'Mumbai', selectable: true, image: require('assets/images/mumbai.jpg') },
    { id: 2, text: 'New Delhi', selectable: false, image: require('assets/images/delhi.jpg') },
    { id: 3, text: 'Bengaluru', selectable: false, image: require('assets/images/bengaluru.jpg') },
    { id: 4, text: 'Chennai', selectable: false, image: require('assets/images/chennai.jpg') },
    { id: 5, text: 'Hyderabad', selectable: false, image: require('assets/images/hyderabad.jpg') },
    { id: 6, text: 'Ahmedabad', selectable: false, image: require('assets/images/ahmedabad.jpg') },
    { id: 7, text: 'Kolkata', selectable: false, image: require('assets/images/kolkata.jpg') },
  ];

  const handleLocationSelect = location => {
    if (location === 'Mumbai') {
      dispatch(setManualLocation(location));
      onClose();
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <SafeAreaProvider>
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Select Location</Text>
            <TouchableOpacity onPress={onClose}>
              <Image style={styles.closeImage} source={require('assets/images/close.png')} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {cards.map(card => (
              <TouchableOpacity
                onPress={() => handleLocationSelect(card.text)}
                key={card.id}
                style={[styles.cardContainer, !card.selectable && styles.disabledCard]}
                disabled={!card.selectable}
              >
                <View style={styles.imageWrapper}>
                  <ImageBackground source={card.image} style={styles.cardImage}>
                    <View style={[styles.overlay, !card.selectable && styles.disabledOverlay]} />
                    <Text style={styles.cardText}>{card.text}</Text>
                  </ImageBackground>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    paddingHorizontal: 10,
  },
  scrollContainer: {
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingBottom: 5,
  },
  cardContainer: {
    marginBottom: 15,
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 15,
  },
  cardImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  cardText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerText: {
    color: colors.theme,
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeImage: {
    width: 26,
    height: 26,
  },
  disabledCard: {
    opacity: 0.4,
  },
  disabledOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default ManualLocationModal;
