import { Text, View, StyleSheet } from 'react-native';
import colors from 'constants/colors';
import { GlobalStyles } from 'constants/GlobalStyles';

const BillSummary = ({ cart }) => (
  <View style={[styles.itemsContainer, GlobalStyles.lightBorder]}>
    <View style={styles.row}>
      <Text style={styles.description}>Item(s) total</Text>
      <Text style={styles.amount}>₹{cart.subTotal}</Text>
    </View>
    <View style={styles.row}>
      <Text style={styles.description}>GST</Text>
      <Text style={styles.amount}>₹{cart.tax}</Text>
    </View>
    {cart.discount > 0 && (
      <View style={styles.row}>
        <Text style={styles.description}>Discount</Text>
        <Text style={styles.amount}>-₹{cart.discount}</Text>
      </View>
    )}
    <View style={styles.totalRow}>
      <Text style={styles.description}>Total</Text>
      <Text style={[styles.amount]}>₹{cart.total}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
    paddingVertical: 8,
    borderTopColor: colors.border,
  },
  description: {
    fontSize: 14,
    fontWeight: '600',
    color: '#737373',
    width: '90%',
    textAlign: 'right',
  },
  amount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.theme,
    width: '12%',
    textAlign: 'left',
  },
});

export default BillSummary;
