import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';

const UploadImageModal = ({ visible, onClose, onTakePicture, onUploadFromGallery }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.optionButton} onPress={onTakePicture}>
                        <Text style={styles.optionText}>Take a picture</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionButton} onPress={onUploadFromGallery}>
                        <Text style={styles.optionText}>Upload from Gallery</Text>
                    </TouchableOpacity>
                </View>
            </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 40,
    },
    optionButton: {
        paddingVertical: 15,
    },
    optionText: {
        fontSize: 18,
        fontWeight: '600',
        color: 'gray',
        textAlign: 'center',
    }
});

export default UploadImageModal;
