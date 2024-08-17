import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

const ResetCartModal = ({ visible, onClose, onReset }) => (
  <Modal visible={visible} animationType="fade" transparent>
    <View style={styles.container}>
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Reset Cart</Text>
        <Text style={styles.message}>Are you sure you want to reset your cart?</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity onPress={onReset} style={styles.button}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResetCartModal;
