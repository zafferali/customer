import { Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from 'constants/colors';

const DiscountItem = ({ code, description, isApplied, onApply, onRemove, minimumBillAmount, subTotal }) => {
  const isDisabled = minimumBillAmount && subTotal < minimumBillAmount;
  const amountNeeded = minimumBillAmount - subTotal;

  return (
    <View style={[styles.itemContainer, isApplied && styles.appliedColor]}>
      <View style={styles.leftSection}>
        <Text style={styles.description}>{description}</Text>
        {isDisabled && (
          <Text style={styles.minBillText}>Add ₹{amountNeeded.toFixed(2)} more to apply this code.</Text>
        )}
        <View style={styles.flexGap}>
          <TouchableOpacity style={styles.code}>
            <Text style={styles.codeText}>{code}</Text>
          </TouchableOpacity>

          {isApplied && (
            <View style={styles.tickIconWrapper}>
              <Image style={styles.tickIcon} source={require('assets/images/tick.png')} />
            </View>
          )}
        </View>
      </View>
      {isApplied ? (
        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Text style={styles.remove}>Remove</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => onApply(code)}
          style={[styles.applyButton, isDisabled && styles.halfOpacity]}
          disabled={isDisabled}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  appliedColor: {
    backgroundColor: colors.lightGray,
  },
  flexGap: {
    flexDirection: 'row',
    gap: 20,
  },
  halfOpacity: {
    opacity: 0.5,
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  description: {
    fontSize: 14,
    fontWeight: '600',
    color: 'black',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  code: {
    borderWidth: 1,
    borderColor: colors.theme,
    borderStyle: 'dashed',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  codeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.theme,
  },
  applyButton: {
    borderWidth: 2,
    borderColor: colors.theme,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  applyButtonText: {
    color: colors.theme,
    fontSize: 12,
    fontWeight: 'bold',
  },
  removeButton: {
    borderWidth: 2,
    borderColor: 'red',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  remove: {
    color: 'red',
    fontSize: 12,
    fontWeight: 'bold',
  },
  minBillText: {
    color: colors.danger,
    fontSize: 10,
    marginBottom: 4,
  },
  tickIconWrapper: {
    backgroundColor: colors.theme,
    width: 20,
    height: 20,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickIcon: {
    width: 14,
    height: 14,
  },
});

export default DiscountItem;
