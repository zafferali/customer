import { Image, TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import colors from 'constants/colors';

export const CustomCheckbox = ({ isSelected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.checkboxContainer, isSelected && { backgroundColor: colors.theme }]}
  >
    {isSelected && <Image source={require('assets/images/tick.png')} style={styles.checkboxTick} />}
  </TouchableOpacity>
);

export const CustomRadioButton = ({ isSelected, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.radioButton}>
    {isSelected && <View style={styles.radioButtonSelected} />}
  </TouchableOpacity>
);

export const MultiSelectButton = ({ label, selectedFilters, setSelectedFilters }) => {
  const isSelected = selectedFilters.includes(label);
  const handlePress = () => {
    if (isSelected) {
      setSelectedFilters(selectedFilters.filter(filter => filter !== label));
    } else {
      setSelectedFilters([...selectedFilters, label]);
    }
  };

  return (
    <View style={styles.multiSelectButtonContainer}>
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.multiSelectButton, isSelected && styles.selectedButton]}
      >
        <View
          style={[
            styles.dot,
            label === 'Veg' ? styles.bgVeg : label === 'Non-Veg' ? styles.bgNonVeg : styles.bgVegan,
          ]}
        />
        <Text style={[styles.multiSelectButtonText, isSelected && styles.selectedButtonText]}>  {label}</Text>
        {isSelected && (
          <TouchableOpacity onPress={handlePress}>
            <Image style={styles.clearButtonImage} source={require('assets/images/close.png')} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  clearButtonImage: {
    width: 16,
    height: 16,
  },
  checkboxContainer: {
    height: 16,
    width: 16,
    borderWidth: 1,
    borderColor: colors.theme,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkboxTick: {
    height: 12,
    width: 12,
    tintColor: 'white',
  },
  multiSelectButtonContainer: {
    marginRight: 10,
  },
  multiSelectButton: {
    flexDirection: 'row',
    backgroundColor: colors.themeLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  multiSelectButtonText: {
    color: colors.theme,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  selectedButton: {
    backgroundColor: colors.theme,
  },
  selectedButtonText: {
    color: 'white',
  },
  radioButtonSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: colors.theme,
  },
  radioButton: {
    height: 16,
    width: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.theme,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bgVeg: {
    backgroundColor: 'rgba(156, 255, 42, 1)',
  },
  bgNonVeg: {
    backgroundColor: 'rgba(255, 42, 42, 1)',
  },
  bgVegan: {
    backgroundColor: 'rgba(0, 151, 105, 1)',
  },
});
