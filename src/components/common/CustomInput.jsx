import { TextInput, StyleSheet, View, Text } from 'react-native';

const CustomInput = ({ placeholder, value, onChangeText, style, label, notEditable }) => (
  <View style={style}>
    {label && (
      <View>
        <Text style={styles.label}>{label}</Text>
      </View>
    )}
    <TextInput
      placeholder={placeholder}
      autoCapitalize={false}
      placeholderTextColor="rgba(151, 151, 151, 0.49)"
      value={value}
      onChangeText={onChangeText}
      style={[styles.input, notEditable && styles.disabledColor]}
      readOnly={notEditable}
    />
  </View>
);

const styles = StyleSheet.create({
  input: {
    borderColor: '#DDDDDD',
    borderWidth: 2,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: 'black',
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
    marginBottom: 4,
  },
  disabledColor: {
    backgroundColor: 'rgba(171, 171, 171, 0.29)',
  },
});

export default CustomInput;
