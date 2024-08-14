import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import colors from 'constants/colors';
import { useDispatch } from 'react-redux';
import { setManualLocation } from 'redux/slices/authenticationSlice';

const { width, height } = Dimensions.get('window');

const ManualLocationModal = ({ isVisible, onClose }) => {
  const dispatch = useDispatch();

  const cards = [
    {
      id: 1,
      text: 'Mumbai',
      selectable: true,
    },
    {
      id: 2,
      text: 'New Delhi',
      selectable: false,
    },
    {
      id: 3,
      text: 'Bengaluru',
      selectable: false,
    },
    {
      id: 4,
      text: 'Chennai',
      selectable: false,
    },
    {
      id: 5,
      text: 'Hyderabad',
      selectable: false,
    },
    {
      id: 6,
      text: 'Ahmedabad',
      selectable: false,
    },
    {
      id: 7,
      text: 'Kolkata',
      selectable: false,
    },
  ];

  const handleLocationSelect = location => {
    if (location === 'Mumbai') {
      dispatch(setManualLocation(location));
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      <Modal visible={isVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.header, Platform.OS === 'ios' && styles.mt60]}>
              {/* <Text style={styles.headerText}>Select Location</Text> */}
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
                    <ImageBackground source={require('assets/images/mumbai.jpg')} style={styles.cardImage}>
                      <View style={[styles.overlay, !card.selectable && styles.disabledOverlay]} />
                      <Text style={styles.cardText}>{card.text}</Text>
                    </ImageBackground>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Select Location</Text>
          <Image style={styles.closeImage} source={require('assets/images/close.png')}/>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 1,
    height: height * 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  scrollContainer: {
    paddingVertical: 10,
  },
  cardContainer: {
    marginBottom: 15,
    height: 200,
    borderRadius: 15, // Added borderRadius to the card
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden', // Ensures the borderRadius applies to the image
  },
  cardImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cardText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  mt60: {
    marginTop: 60,
  },
  header: {
    paddingTop: 30,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 0,
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  closeImage: {
    width: 36,
    height: 36,
  },
  closeButtonText: {
    color: colors.theme,
    fontSize: 24,
    fontWeight: 'bold',
  },
  disabledCard: {
    opacity: 0.4,
  },
  disabledOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});

export default ManualLocationModal;
