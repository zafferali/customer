import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Layout from 'components/common/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { updateCustomer } from 'redux/slices/authenticationSlice';
import firestore from '@react-native-firebase/firestore';
import uploadImageToFirebase from 'utils/uploadImage';
import UploadImageModal from 'utils/UploadImageModal';
import colors from 'constants/colors';

const SettingsScreen = ({ navigation }) => {
  const customer = useSelector(state => state.authentication.customer);
  const dispatch = useDispatch();
  const [name, setName] = useState(customer.name);
  const [imageUrl, setImageUrl] = useState(customer.photoUrl || null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = text => {
    setName(text);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await firestore().collection('customers').doc(customer.id).update({
        name,
        photoUrl: imageUrl,
      });
      dispatch(updateCustomer({ name, photoUrl: imageUrl }));
      navigation.navigate('ProfileScreen');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImage = async fromCamera => {
    setIsLoading(true);
    try {
      const url = await uploadImageToFirebase(fromCamera);
      console.log('url is', url);
      setImageUrl(url);
      setModalVisible(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Layout backTitle="Settings" navigation={navigation}>
        <View style={styles.container}>
          <TouchableOpacity
            style={[styles.imageUploadContainer, imageUrl && styles.zeroBorder]}
            onPress={() => setModalVisible(true)}
          >
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.profileImage} />
            ) : (
              <Image style={styles.uploadIcon} source={require('assets/images/upload.png')} />
            )}
          </TouchableOpacity>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={handleNameChange} />
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneNum}>
            <Text style={styles.phoneNumText}>{customer.mobile}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Change</Text>
          </TouchableOpacity>
        </View>
        {!isLoading && (
          <UploadImageModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onTakePicture={() => handleUploadImage(true)}
            onUploadFromGallery={() => handleUploadImage(false)}
          />
        )}
      </Layout>
      {isLoading ? (
        <View style={styles.overlayStyle}>
          <ActivityIndicator size="large" color={colors.theme} />
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  imageUploadContainer: {
    width: 134,
    height: 134,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.theme,
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  uploadIcon: {
    width: 42,
    height: 42,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: 5,
    color: 'black',
    fontWeight: '600',
    fontSize: 15,
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderRadius: 5,
    borderColor: colors.theme,
    padding: 8,
    paddingLeft: 14,
    marginBottom: 20,
    color: colors.theme,
    fontSize: 14,
    fontWeight: '600',
  },
  phoneNum: {
    width: '100%',
    padding: 16,
    paddingLeft: 14,
    backgroundColor: colors.lightGray,
    borderRadius: 5,
    marginBottom: 10,
  },
  phoneNumText: {
    color: colors.theme,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.theme,
    width: '100%',
    marginTop: 20,
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  overlayStyle: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  zeroBorder: {
    borderWidth: 0,
  },
});

export default SettingsScreen;
