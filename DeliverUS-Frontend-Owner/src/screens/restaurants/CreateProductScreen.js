import React, { useEffect, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native'
import * as ExpoImagePicker from 'expo-image-picker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import defaultProductImage from '../../../assets/product.jpeg'
import { getProductCategories, create } from '../../api/ProductEndpoints'
import { showMessage } from 'react-native-flash-message'
import DropDownPicker from 'react-native-dropdown-picker'
import { ErrorMessage, Formik } from 'formik'
import * as yup from 'yup'
import TextError from '../../components/TextError'

export default function CreateProductScreen ({ route }) {
  const [open, setOpen] = useState(false)
  const [productCategories, setProductCategories] = useState([])
  const initialProductValues = { name: null, description: null, price: null, order: null, productCategoryId: null, availability: true }
  const [backendErrors, setBackendErrors] = useState()

  const validationSchema = yup.object().shape({
    name: yup.string().max(255, 'Name too long').required('Name is required'),
    description: yup.string().max(255, 'Description too long').required('Description is required'),
    price: yup.number().positive('Price must be positive').required('Price is required'),
    order: yup.number().positive('Order must be positive').required('Order is required'),
    productCategoryId: yup.number().positive().integer().required('Product category is required'),
    availability: yup.boolean().required('Availability is required')
  })

  useEffect(() => {
    async function fetchProductCategories () {
      try {
        const fetchedProductCategories = await getProductCategories()
        const fetchedProductCategoriesReshaped = fetchedProductCategories.map((e) => {
          return {
            label: e.name,
            value: e.id
          }
        })
        setProductCategories(fetchedProductCategoriesReshaped)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving product categories. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchProductCategories()
  }, [])

  const createProduct = async (values) => {
    setBackendErrors([])
    values.restaurantId = route.params.id
    console.log(values)
    try {
      const createdProduct = await create(values)
      showMessage({
        message: `Product ${createdProduct.name} created successfully`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }

  const pickImage = async (onSuccess) => {
    const result = await ExpoImagePicker.launchImageLibraryAsync({
      mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    })
    if (!result.canceled) {
      if (onSuccess) {
        onSuccess(result)
      }
    }
  }
  return (
    <Formik
     initialValues={initialProductValues}
      validationSchema={validationSchema}
      onSubmit={createProduct}>
      {({ handleSubmit, setFieldValue, values }) => (
        <ScrollView>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '60%' }}>
              <InputItem
                name='name'
                label='Name:'
              />
              <InputItem
                name='description'
                label='Description:'
              />
              <InputItem
                name='price'
                label='Price:'
              />
              <InputItem
                name='order'
                label='Order/position to be rendered:'
              />

              <DropDownPicker
                open={open}
                value={values.productCategoryId}
                items={productCategories}
                setOpen={setOpen}
                onSelectItem={item => {
                  setFieldValue('productCategoryId', item.value)
                }}
                setItems={setProductCategories}
                placeholder="Select the product category"
                containerStyle={{ height: 40, marginTop: 20, marginBottom: 20 }}
                style={{ backgroundColor: GlobalStyles.brandBackground }}
                dropDownStyle={{ backgroundColor: '#fafafa' }}
              />

              <ErrorMessage name={'productCategoryId'} render={msg => <TextError>{msg}</TextError> }/>

              <TextRegular style={styles.switch}>Is it available?</TextRegular>
              <Switch
                trackColor={{ false: GlobalStyles.brandSecondary, true: GlobalStyles.brandPrimary }}
                thumbColor={values.availability ? GlobalStyles.brandSecondary : '#f4f3f4'}
                value={values.availability}
                style={styles.switch}
                onValueChange={value =>
                  setFieldValue('availability', value)
                }
              />
              <ErrorMessage name={'avaliability'} render={msg => <TextError>{msg}</TextError> }/>

              <Pressable onPress={() =>
                pickImage(
                  async result => {
                    await setFieldValue('image', result)
                  }
                )
              }
                style={styles.imagePicker}
              >
                <TextRegular>Product image: </TextRegular>
                <Image style={styles.image} source={values.image ? { uri: values.image.assets[0].uri } : defaultProductImage} />
              </Pressable>

              {backendErrors &&
                backendErrors.map((error, index) => <TextError key={index}>{error.msg}</TextError>)
              }

              <Pressable
                onPress={ handleSubmit }
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandSuccessTap
                      : GlobalStyles.brandSuccess
                  },
                  styles.button
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name='content-save' color={'white'} size={20}/>
                  <TextRegular textStyle={styles.text}>
                    Save
                  </TextRegular>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </Formik>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginLeft: 5

  },
  imagePicker: {
    height: 40,
    paddingLeft: 10,
    marginTop: 20,
    marginBottom: 80
  },
  image: {
    width: 100,
    height: 100,
    borderWidth: 1,
    alignSelf: 'center',
    marginTop: 5
  },
  switch: {
    marginTop: 5
  }
})
