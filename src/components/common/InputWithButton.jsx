import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import colors from 'constants/colors';

const InputWithButton = ({placeholder, onChangeText, value, buttonText, handleValidate, buttonDisabled }) => {

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholderTextColor={'rgba(0, 0, 0, 0.3)'}
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
      />
      <TouchableOpacity style={[styles.button, value.length == 0 && {opacity: 0.6}]} onPress={handleValidate} disabled={value.length == 0 ? true: false}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: 10,
      paddingVertical: 4,
      position: 'relative',
    },
    input: {
      width: '100%',
      height: '100%',
      flex: 1,
      paddingVertical: 10,
      paddingLeft: 10,
      borderColor: colors.border,
      borderRadius: 6,
      borderWidth: 1,
      marginRight: 10,
      fontSize: 14,
      fontWeight: '500',
      color: 'black'
    },
    button: {
      position: 'absolute',
      right: 15,
      top: '25%',
      paddingVertical: 4,
      paddingHorizontal: 12,
      backgroundColor: colors.theme,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 4,
    },
    buttonText: {
      color: 'white',
      fontSize: 14,
    },
  });
  

export default InputWithButton;
