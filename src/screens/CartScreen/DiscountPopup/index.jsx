import { useState, useEffect } from 'react';
import { Modal, Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useSelector, useDispatch } from 'react-redux';
import colors from 'constants/colors';
import { applyDiscount, removeDiscount } from 'redux/slices/cartSlice';

const DiscountItem = ({ code, description, isApplied, onApply, onRemove, minimumBillAmount, subTotal }) => {
  const isDisabled = minimumBillAmount && subTotal < minimumBillAmount;
  const amountNeeded = minimumBillAmount - subTotal;

  return (
    <View style={[styles.itemContainer, isApplied && { backgroundColor: colors.lightGray }]}>
      <View style={styles.leftSection}>
        <Text style={styles.description}>{description}</Text>
        {isDisabled && (
          <Text style={styles.minBillText}>Add ₹{amountNeeded.toFixed(2)} more to apply this code.</Text>
        )}
        <View style={styles.codeTextContainer}>
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

const DiscountPopup = ({ isVisible, onClose }) => {
  const [discountCodes, setDiscountCodes] = useState([]);
  const restaurantId = useSelector(state => state.restaurants.currentRestaurant.id);
  const userOrderCount = useSelector(state => state.authentication.customer.orderCount);
  const subTotal = useSelector(state => state.cart.subTotal);
  const appliedDiscountCode = useSelector(state => state.cart.discountCode);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchDiscountCodes = async () => {
      try {
        const discountCodesSnapshot = await firestore().collection('discountCodes').get();

        const fetchRestaurantRefs = async restaurants => {
          if (!restaurants || restaurants.length === 0) return true;
          const restaurantIds = await Promise.all(
            restaurants.map(async ref => {
              const restaurantDoc = await ref.get();
              return restaurantDoc.id;
            }),
          );
          return restaurantIds.includes(restaurantId);
        };

        const codes = await Promise.all(
          discountCodesSnapshot.docs.map(async doc => {
            const discount = doc.data();
            const { restaurants, userRestrictions, expiryDate } = discount;

            // Check if the discount code is expired
            const now = new Date();
            const isExpired = expiryDate && expiryDate.toDate().setHours(23, 59, 59, 999) < now;

            if (isExpired) return null;

            const applicableForRestaurant = await fetchRestaurantRefs(restaurants);
            const applicableForUser =
              !userRestrictions ||
              !userRestrictions.firstTimeOnly ||
              userRestrictions.maxUsagePerUser === 0 ||
              userRestrictions.maxUsagePerUser == null ||
              userOrderCount < userRestrictions.maxUsagePerUser;
            return applicableForRestaurant && applicableForUser ? discount : null;
          }),
        ).then(results => results.filter(discount => discount !== null));

        setDiscountCodes(codes);
      } catch (error) {
        console.error('Error fetching discount codes: ', error);
      }
    };

    if (isVisible) {
      fetchDiscountCodes();
    }
  }, [isVisible, restaurantId, userOrderCount, subTotal]);

  const handleApply = code => {
    const discount = discountCodes.find(d => d.code === code);
    let discountAmount = 0;

    if (discount.amount) {
      discountAmount = discount.amount;
    } else if (discount.percentage) {
      discountAmount = (subTotal * discount.percentage) / 100;
    }

    dispatch(
      applyDiscount({
        discountAmount,
        discountCode: code,
        discountDescription: discount.description,
      }),
    );
  };

  const handleRemove = () => {
    dispatch(removeDiscount());
  };

  return (
    <Modal animationType="slide" transparent={false} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.fullScreenContainer}>
        <View style={styles.header}>
          <Text style={styles.heading}>Discounts</Text>
          <TouchableOpacity onPress={onClose}>
            <Image source={require('assets/images/close.png')} style={styles.closeButton} />
          </TouchableOpacity>
        </View>
        {discountCodes.length === 0 ? (
          <View style={styles.noDiscounts}>
            <Text style={styles.noDiscountsText}>No discount codes available</Text>
          </View>
        ) : (
          discountCodes.map(discount => (
            <DiscountItem
              key={discount}
              code={discount.code}
              description={discount.description}
              isApplied={appliedDiscountCode === discount.code}
              onApply={handleApply}
              onRemove={handleRemove}
              minimumBillAmount={discount.minimumBillAmount}
              subTotal={subTotal}
            />
          ))
        )}
      </View>
    </Modal>
  );
};

export default DiscountPopup;

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    marginTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  closeButton: {
    width: 24,
    height: 24,
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
  codeTextContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  halfOpacity: {
    opacity: 0.5,
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
  noDiscounts: {
    flex: 1,
    justifyContent: 'center',
  },
  noDiscountsText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
