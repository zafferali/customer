import firestore from '@react-native-firebase/firestore';

/**
 * Generates a pickup code using the full vendor code from the restaurant and the last part of the order ID,
 * which consists of either the last 3 or 4 digits, depending on the order ID length.
 *
 * @param {string} restaurantId The ID of the restaurant to fetch the vendor code.
 * @param {string} orderId The generated order ID which includes the date prefix.
 * @returns {Promise<string>} A promise that resolves to the pickup code.
 */
async function generatePickupCode(restaurantId, orderId) {
  try {
    // Fetch the vendor code from the restaurant document
    const restaurantRef = firestore().collection('restaurants').doc(restaurantId);
    const restaurantDoc = await restaurantRef.get();
    if (!restaurantDoc.exists) {
      throw new Error('Restaurant not found');
    }

    const { vendorCode } = restaurantDoc.data();
    if (!vendorCode) {
      throw new Error('Vendor code is missing');
    }

    // Extract the last 3 or 4 digits from the order ID (excluding the YYMMDD part)
    const orderCode = orderId.slice(6); // This skips the first 6 characters (YYMMDD)

    // Combine the full vendor code and the order code
    const pickupCode = `${vendorCode}${orderCode}`;
    return pickupCode;
  } catch (error) {
    console.error('Failed to generate pickup code:', error);
    throw error;
  }
}

export { generatePickupCode };
