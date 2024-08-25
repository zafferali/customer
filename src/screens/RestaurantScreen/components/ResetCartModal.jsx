import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

const ResetCartModal = ({ visible, onClose, onReset }) => {
  const bodyText =
    'Your cart contains dishes from another restaurant. Do you want to discard the selection and add dishes from this restaurant?';
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.container}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Replace cart item?</Text>
          <Text style={styles.message}>{bodyText}</Text>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={onClose} style={[styles.button, styles.closeButton]}>
              <Text style={[styles.buttonText, styles.closeBtnText]}>No</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onReset} style={[styles.button]}>
              <Text style={styles.buttonText}>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
    width: '90%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
  },
  message: {
    fontSize: 16,
    fontWeight: 'light',
    marginBottom: 30,
    textAlign: 'left',
    color: '#222',
    letterSpacing: 0.5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  button: {
    padding: 10,
    width: '50%',
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: '#2E5E82',
  },
  closeButton: {
    backgroundColor: 'rgba(104, 141, 168, 0.3)',
  },
  closeBtnText: {
    color: 'rgba(46, 94, 130, 1)',
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResetCartModal;
