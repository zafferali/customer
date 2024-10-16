import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from 'constants/colors';

const InputWithButton = ({ placeholder, onChangeText, value, buttonText, handleValidate }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholderTextColor="rgba(0, 0, 0, 0.3)"
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
      />
      <TouchableOpacity
        style={[styles.button, value.length === 0 && styles.halfOpacity]}
        onPress={handleValidate}
        disabled={value.length === 0}
      >
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
    color: 'black',
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
  halfOpacity: {
    opacity: 0.6,
  },
});

export default InputWithButton;
