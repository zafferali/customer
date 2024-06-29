import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from 'constants/colors';

const StatusToggle = ({ option1, option2, option3}) => {
  const [activeStatus, setActiveStatus] = useState('Food Preparing');

  return (
    <View style={styles.toggleContainer}>
      <TouchableOpacity
        style={[styles.toggleButton, activeStatus === option1 ? styles.active : null]}
        onPress={() => setActiveStatus(option1)}
      >
        <Text style={[styles.toggleText, activeStatus === option1 ? styles.active : null ]}>{option1}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.toggleButton, activeStatus === option2 ? styles.active : null]}
        onPress={() => setActiveStatus(option2)}
      >
        <Text style={[styles.toggleText, activeStatus === option2 ? styles.active : null ]}>{option2}</Text>
      </TouchableOpacity>
      {option3 &&
      <TouchableOpacity
        style={[styles.toggleButton, activeStatus === option3 ? styles.active : null]}
        onPress={() => setActiveStatus(option3)}
      >
        <Text style={[styles.toggleText, activeStatus === option3 ? styles.active : null ]}>{option3}</Text>
      </TouchableOpacity>}
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    padding: 4,
  },
  toggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 18, // Slightly less than container to fit inside padding
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Default non-active color
  },
  active: {
    backgroundColor: colors.theme, // Active background color
    color: 'white',
    // elevation: 2,
    // shadowOpacity: 0.3,
    // shadowRadius: 3,
    // shadowOffset: { width: 0, height: 3 },
  },
  toggleText: {
    color: colors.theme, // Text color
    fontSize: 12,
    fontWeight: '600'
  },
});

export default StatusToggle;
