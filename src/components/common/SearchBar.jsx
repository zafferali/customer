import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import colors from 'constants/colors';

const SearchBar = ({ placeholder, onSearch, style }) => {
  const inputRef = useRef(null);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={() => inputRef.current.focus()} style={styles.iconContainer}>
        <Image source={require('assets/images/search.png')} style={styles.icon} />
      </TouchableOpacity>
      <TextInput
        ref={inputRef}
        placeholderTextColor="gray"
        onChangeText={onSearch}
        placeholder={placeholder}
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingLeft: 8,
    borderColor: colors.border,
    borderWidth: 1,
    marginTop: 10,
  },
  iconContainer: {
    marginRight: 10,
  },
  icon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
  },
});

export default SearchBar;
