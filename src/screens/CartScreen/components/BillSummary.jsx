import { Text, View, StyleSheet } from 'react-native';
import colors from 'constants/colors';
import { GlobalStyles } from 'constants/GlobalStyles';

const BillSummary = ({ cart }) => (
  <View style={[styles.itemsContainer, GlobalStyles.lightBorder]}>
    <View style={styles.row}>
      <Text style={styles.description}>Item Total</Text>
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
    <View style={[styles.row, styles.noBorder]}>
      <Text style={[styles.description, styles.bold]}>Total Bill</Text>
      <Text style={[styles.amount, styles.bold]}>₹{cart.total}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
    paddingTop: 15,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  description: {
    fontSize: 14,
    fontWeight: 'light',
    color: '#737373',
    textAlign: 'right',
  },
  amount: {
    fontSize: 14,
    fontWeight: 'light',
    color: colors.theme,
    textAlign: 'left',
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default BillSummary;
