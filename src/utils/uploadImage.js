import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

const uploadImageToFirebase = async (fromCamera = false) => {
    const options = {
        mediaType: 'photo',
        quality: 0.5,
        includeBase64: false,
        cameraType: 'back'
    };

    return new Promise((resolve, reject) => {
        const callback = async (response) => {
            if (response.didCancel) {
                reject('User cancelled image picker');
            } else if (response.errorCode) {
                reject(response.errorMessage);
            } else {
                try {
                    const uri = response.assets[0].uri;
                    const fileName = response.assets[0].fileName || uri.split('/').pop();
                    const imageUrl = await uploadImage(uri, 'images/' + fileName);
                    resolve(imageUrl);
                } catch (error) {
                    reject(error);
                }
            }
        };

        if (fromCamera) {
            launchCamera(options, callback);
        } else {
            launchImageLibrary(options, callback);
        }
    });
};


const uploadImage = async (uri, path) => {
    const reference = storage().ref(path);
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        await reference.put(blob);
        const url = await reference.getDownloadURL();
        return url;
    } catch (error) {
        throw error;
    }
};

export default uploadImageToFirebase;

