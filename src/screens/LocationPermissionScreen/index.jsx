import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, AppState, Image, TouchableOpacity } from 'react-native';
import CustomButton from 'components/common/CustomButton';
import Layout from 'components/common/Layout';
import colors from 'constants/colors';
import { RESULTS } from 'react-native-permissions';
import OpenSettingsModal from 'components/common/OpenSettingsModal';
import { checkLocationPermission, requestLocationPermission, openLocationSettings } from 'utils/permissions';
import ManualLocationModal from './components/ManualLocationModal';

const LocationPermissionScreen = ({ onPermissionGranted }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');

  useEffect(() => {
    checkPermission();

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = nextAppState => {
    if (nextAppState === 'active') {
      checkPermission();
    }
  };

  const checkPermission = async () => {
    const status = await checkLocationPermission();
    if (status === RESULTS.GRANTED) {
      onPermissionGranted();
    }
  };

  const handleRequestPermission = async () => {
    const status = await requestLocationPermission();

    if (status === RESULTS.GRANTED) {
      onPermissionGranted();
    } else if (status === RESULTS.DENIED) {
      setSettingsMessage(
        'Location permission is required for this feature. Please enable it in your device settings.',
      );
      setShowSettingsModal(true);
    } else if (status === RESULTS.BLOCKED) {
      setSettingsMessage('Location permission is blocked. Please enable it in your device settings.');
      setShowSettingsModal(true);
    }
  };

  return (
    <Layout>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Location Permission Required</Text>
          <Text style={styles.description}>
            We need access to your location to provide accurate services.
          </Text>
        </View>
        <Image
          source={require('assets/images/location-bg.png')} // replace with your image source
          style={styles.image}
        />
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Enable Location Permission"
            onPress={handleRequestPermission}
            style={styles.btn}
            textStyle={styles.btnText}
          />
          <TouchableOpacity style={styles.borderBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.manualLocationText}>Select location manually</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ManualLocationModal isVisible={isModalVisible} onClose={() => setModalVisible(false)} />
      <OpenSettingsModal
        isVisible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onOpenSettings={() => {
          setShowSettingsModal(false);
          openLocationSettings();
        }}
        message={settingsMessage}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: colors.theme,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: 'gray',
  },
  image: {
    width: '100%',
    height: '40%', // Adjust the height to a percentage to make it responsive
    resizeMode: 'contain',
    marginVertical: 10,
  },
  buttonContainer: {
    paddingBottom: 10,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  btnText: {
    fontSize: 18,
  },
  manualLocationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.theme,
    textAlign: 'center',
  },
  borderBtn: {
    borderColor: colors.theme,
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 10,
  },
});

export default LocationPermissionScreen;
