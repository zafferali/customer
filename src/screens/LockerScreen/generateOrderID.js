import firestore from '@react-native-firebase/firestore';
import moment from 'moment'; // Ensure you have 'moment' installed

/**
 * Generates a unique order ID based on the current date and the sequence number of the day.
 * Format: YYMMDDNNN where NNN is a sequence number, extending beyond 999 if necessary.
 * 
 * @returns {Promise<string>} A promise that resolves to the order ID.
 */
async function generateOrderID() {
  const today = moment().format('YYMMDD');
  const orderRef = firestore().collection('orders');

  try {
    const snapshot = await orderRef
      .where('orderNum', '>=', `${today}000`)
      .where('orderNum', '<=', `${today}9999`) // Allows for four-digit numbers
      .orderBy('orderNum', 'desc')
      .limit(1)
      .get();

    let lastNumber = 0;
    if (!snapshot.empty) {
      const lastOrderNum = snapshot.docs[0].data().orderNum;
      lastNumber = parseInt(lastOrderNum.slice(6)); // Parses the number right after the date part
    }

    const newOrderNumber = lastNumber + 1;
    const newOrderNum = `${today}${newOrderNumber.toString().padStart(3, '0')}`;
    return newOrderNum;
  } catch (error) {
    throw new Error(`Error generating order ID: ${error}`);
  }
}

export { generateOrderID };
