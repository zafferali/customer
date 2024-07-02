// import 'react-native-get-random-values'
// import { v4 as uuidv4 } from 'uuid'
// import { createSlice } from '@reduxjs/toolkit'

// const roundPrice = (price) => Math.round(price)

// const calculateItemTotalPrice = (item) => {
//   let totalPrice = roundPrice(Number(item.price))
//   item.customisations.forEach(customisation => {
//     customisation.choices.forEach(choice => {
//       totalPrice += roundPrice(Number(choice.price))
//     })
//   })
//   return totalPrice
// }

// const cartSlice = createSlice({
//   name: 'cart',
//   initialState: {
//     items: [],
//     total: 0,
//     tax: 0,
//     subTotal: 0,
//     discount: 0,
//     discountCode: null,
//     discountDescription: null,
//     instructions: '',
//     restaurantId: '',
//   },
//   reducers: {
//     addToCart: (state, action) => {
//       const { itemId, customisations, quantity, cartItemId } = action.payload
//       console.log('Adding to cart:', JSON.stringify({state}))
    
//       const existingItemIndex = state.items.findIndex(item => 
//         item.itemId === itemId && 
//         JSON.stringify(item.customisations) === JSON.stringify(customisations)
//       )
    
//       if (existingItemIndex !== -1) {
//         state.items[existingItemIndex].quantity += quantity
//       } else {
//         const updatedPrice = calculateItemTotalPrice(action.payload)
//         const newItem = {
//           ...action.payload,
//           cartItemId: cartItemId || uuidv4(),
//           quantity: quantity,
//           price: updatedPrice  // Update the item's price
//         }
//         state.items.push(newItem)
//       }
      
//       state.subTotal = state.items.reduce((sum, item) => {
//         return sum + item.price * item.quantity
//       }, 0)
    
//       state.tax = roundPrice(state.subTotal * 0.05)
//       state.total = state.subTotal + state.tax - state.discount
//     },
//     removeFromCart: (state, action) => {
//       const { cartItemId, quantity = 1 } = action.payload
//       const index = state.items.findIndex(item => item.cartItemId === cartItemId)

//       if (index !== -1) {
//         if (state.items[index].quantity > quantity) {
//           state.items[index].quantity -= quantity
//         } else {
//           state.items.splice(index, 1)
//         }

//         state.subTotal = state.items.reduce((sum, item) => {
//           return sum + item.price * item.quantity
//         }, 0)

//         state.tax = roundPrice(state.subTotal * 0.05)
//         state.total = state.subTotal + state.tax - state.discount
//       }
//     },
//     applyDiscount: (state, action) => {
//       const { discountAmount, discountCode, discountDescription } = action.payload
//       state.discount = discountAmount
//       state.discountCode = discountCode
//       state.discountDescription = discountDescription
//       state.total = state.subTotal + state.tax - state.discount
//     },
//     removeDiscount: (state) => {
//       state.discount = 0
//       state.discountCode = null
//       state.discountDescription = null
//       state.total = state.subTotal + state.tax
//     },
//     specialInstructions: (state, action) => {
//       state.instructions = action.payload
//     },
//     resetCart: (state) => {
//       state.items = []
//       state.total = 0
//       state.tax = 0
//       state.subTotal = 0
//       state.discount = 0
//       state.discountCode = null
//       state.discountDescription = null
//       state.instructions = ''
//     }
//   }
// })

// export const { addToCart, removeFromCart, applyDiscount, removeDiscount, resetCart, specialInstructions } = cartSlice.actions
// export default cartSlice.reducer
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'
import { createSlice } from '@reduxjs/toolkit'

const roundPrice = (price) => Math.round(price)

const calculateItemTotalPrice = (item) => {
  let totalPrice = roundPrice(Number(item.price))
  item.customisations.forEach(customisation => {
    customisation.choices.forEach(choice => {
      totalPrice += roundPrice(Number(choice.price))
    })
  })
  return totalPrice
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
    tax: 0,
    subTotal: 0,
    discount: 0,
    discountCode: null,
    discountDescription: null,
    instructions: '',
    restaurantId: '',  // Add restaurantId to initial state
  },
  reducers: {
    addToCart: (state, action) => {
      const { itemId, customisations, quantity, cartItemId, restaurantId } = action.payload
      console.log('Adding to cart:', JSON.stringify({ state }))

      // Reset the cart if the restaurantId is different
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        state.items = []
        state.total = 0
        state.tax = 0
        state.subTotal = 0
        state.discount = 0
        state.discountCode = null
        state.discountDescription = null
        state.instructions = ''
        state.restaurantId = restaurantId
      } else {
        state.restaurantId = restaurantId
      }

      const existingItemIndex = state.items.findIndex(item => 
        item.itemId === itemId && 
        JSON.stringify(item.customisations) === JSON.stringify(customisations)
      )

      if (existingItemIndex !== -1) {
        state.items[existingItemIndex].quantity += quantity
      } else {
        const updatedPrice = calculateItemTotalPrice(action.payload)
        const newItem = {
          ...action.payload,
          cartItemId: cartItemId || uuidv4(),
          quantity: quantity,
          price: updatedPrice  // Update the item's price
        }
        state.items.push(newItem)
      }
      
      state.subTotal = state.items.reduce((sum, item) => {
        return sum + item.price * item.quantity
      }, 0)
    
      state.tax = roundPrice(state.subTotal * 0.05)
      state.total = state.subTotal + state.tax - state.discount
    },
    removeFromCart: (state, action) => {
      const { cartItemId, quantity = 1 } = action.payload
      const index = state.items.findIndex(item => item.cartItemId === cartItemId)

      if (index !== -1) {
        if (state.items[index].quantity > quantity) {
          state.items[index].quantity -= quantity
        } else {
          state.items.splice(index, 1)
        }

        state.subTotal = state.items.reduce((sum, item) => {
          return sum + item.price * item.quantity
        }, 0)

        state.tax = roundPrice(state.subTotal * 0.05)
        state.total = state.subTotal + state.tax - state.discount
      }
    },
    applyDiscount: (state, action) => {
      const { discountAmount, discountCode, discountDescription } = action.payload
      state.discount = discountAmount
      state.discountCode = discountCode
      state.discountDescription = discountDescription
      state.total = state.subTotal + state.tax - state.discount
    },
    removeDiscount: (state) => {
      state.discount = 0
      state.discountCode = null
      state.discountDescription = null
      state.total = state.subTotal + state.tax
    },
    specialInstructions: (state, action) => {
      state.instructions = action.payload
    },
    resetCart: (state) => {
      state.items = []
      state.total = 0
      state.tax = 0
      state.subTotal = 0
      state.discount = 0
      state.discountCode = null
      state.discountDescription = null
      state.instructions = ''
      state.restaurantId = ''  // Reset restaurantId
    },
    setRestaurantId: (state, action) => {
      state.restaurantId = action.payload
    }
  }
})

export const { addToCart, removeFromCart, applyDiscount, removeDiscount, resetCart, specialInstructions, setRestaurantId } = cartSlice.actions
export default cartSlice.reducer
