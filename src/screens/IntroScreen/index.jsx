import { StyleSheet, View } from 'react-native'
import React, {useState} from 'react'
import Layout from 'common/Layout'
import { GlobalStyles } from 'constants/GlobalStyles'
import CustomInput from 'common/CustomInput'
import CustomButton from 'common/CustomButton'
import { useSelector, useDispatch } from 'react-redux'
import { storeCustomerDetails } from '../../firebase/auth'
import { login } from 'slices/authenticationSlice'

const IntroScreen = () => {
    const dispatch = useDispatch()
    const customer = useSelector(state => state.authentication.customer)
    
    const [ name, setName] = useState('')
    const [ email, setEmail] = useState('')

    const handleRegister = async () => {
        try {
          const customerDetails = { ...customer, name: name, email: email }
          const customerId = await storeCustomerDetails(customerDetails)
          dispatch(login({ ...customerDetails, id: customerId }))
        } catch (error) {
          console.error('Error during registration:', error)
        }
      }

    return (
    <Layout 
        title='Introduce yourself'
    >
        <View style={GlobalStyles.lightBorder}>
            <CustomInput 
                label='Name'
                placeholder='Full Name'
                onChangeText={(text) => {
                    setName(text)
                }}
                style={styles.input}
                value={name}         
            />
            <CustomInput 
                label='*Phone Number'
                notEditable
                style={styles.input}
                value={customer.mobile}         
            />
            <CustomInput 
                label='Email Address'
                placeholder='youremail@host.com'
                onChangeText={(text) => {
                    setEmail(text)
                }}
                style={styles.input}
                value={email}         
            />
        </View>
        <View style={styles.btnContainer}>
            <CustomButton title='Next' onPress={handleRegister}/>
        </View>
    </Layout>
    )
}

export default IntroScreen

const styles = StyleSheet.create({
    input: {
        marginVertical: 12,
        marginHorizontal: 4,
    },
    btnContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        marginBottom: 12,
        marginHorizontal: 'auto',
        bottom: 4,
        alignItems: 'center',
        paddingHorizontal: 20,
    }
})