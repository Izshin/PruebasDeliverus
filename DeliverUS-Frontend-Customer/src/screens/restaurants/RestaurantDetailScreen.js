import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable, TextInput } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { create } from '../../api/ProductEndpoints'
import { getDetail } from '../../api/RestaurantEndpoints'
import ImageCard from '../../components/ImageCard'
import TextRegular from '../../components/TextRegular'
import TextSemiBold from '../../components/TextSemibold'
import * as GlobalStyles from '../../styles/GlobalStyles'
import defaultProductImage from '../../../assets/product.jpeg'
import { Formik } from 'formik'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import TextError from '../../components/TextError'
import { AuthorizationContext } from '../../context/AuthorizationContext'

export default function RestaurantDetailScreen ({ navigation, route }) {
  const productOrderObj = {}
  let productOrderList = []
  const { loggedInUser } = useContext(AuthorizationContext)
  const [restaurant, setRestaurant] = useState({})
  const initialOrderValues = {
    createdAt: Date(),
    startedAt: null,
    sentAt: null,
    deliveredAt: null,
    price: 0.0,
    address: loggedInUser.address,
    shippingCosts: 0.0,
    products: null,
    restaurantId: restaurant.id,
    userId: loggedInUser.id,
    status: 'pending'

  }
  const [button, showButton] = useState(false)
  const [backendErrors, setBackendErrors] = useState()

  const productCompararator = function poductComparator (pareja) {
    if ((!isNaN(pareja.value))) {
      productOrderObj[pareja.key] = pareja.value
      console.log(productOrderObj)
      console.log(Object.entries(productOrderObj).filter(([key, value]) => value !== 0).map(([key, value]) => ({ productid: key, quantity: value })))
      return productOrderObj
    }
  }
  useEffect(() => {
    fetchRestaurantDetail()
  }, [route])

  useEffect(() => {
    fetchRestaurantDetail()
  }, [button])

  const createOrder = async (values) => {
    try {
      setBackendErrors([])
      console.log(productOrderObj)
      productOrderList = Object.entries(productOrderObj).filter(([key, value]) => value !== 0).map(([key, value]) => ({ productId: key, quantity: value }))
      console.log(productOrderList)
      values.products = productOrderList
      console.log(values)
      await create(values)

      showMessage({
        message: 'Order succesfully created',
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('OrdersScreen')
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }
  const renderHeader = () => {
    if (button === false) {
      return (
        <View>
          <ImageBackground source={(restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>
            <View style={styles.restaurantHeaderContainer}>
              <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
              <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
              <TextRegular textStyle={styles.description}>{restaurant.description}</TextRegular>
              <TextRegular textStyle={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>
            </View>
          </ImageBackground>
          <Pressable
          onPress={() => {
            showButton(true)
          }}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? GlobalStyles.brandGreenTap
                : GlobalStyles.brandGreen
            },
            styles.button
          ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='plus-circle' color={'white'} size={20} />
            <TextRegular textStyle={styles.text}>
              Create Order
            </TextRegular>
          </View>
        </Pressable>
        </View>
      )
    } else {
      return (
        <View>
          <ImageBackground source={(restaurant?.heroImage) ? { uri: process.env.API_BASE_URL + '/' + restaurant.heroImage, cache: 'force-cache' } : undefined} style={styles.imageBackground}>
            <View style={styles.restaurantHeaderContainer}>
              <TextSemiBold textStyle={styles.textTitle}>{restaurant.name}</TextSemiBold>
              <Image style={styles.image} source={restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + restaurant.logo, cache: 'force-cache' } : undefined} />
              <TextRegular textStyle={styles.description}>{restaurant.description}</TextRegular>
              <TextRegular textStyle={styles.description}>{restaurant.restaurantCategory ? restaurant.restaurantCategory.name : ''}</TextRegular>
            </View>
          </ImageBackground>
          {backendErrors &&
                  backendErrors.map((error, index) => <TextError key={index}>{error.msg}</TextError>)}
          <Formik
         /* initialValues={initialOrderValues} */
          onSubmit={createOrder}
          initialValues={initialOrderValues}
          >

          {({ handleSubmit, setFieldValue, values }) => (
          <Pressable
         /* onPressIn={setFieldValue('orderProducts', productOrderList)}
          onPressOut={handleSubmit} */
          onPress={handleSubmit}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? GlobalStyles.brandGreenTap
                : GlobalStyles.brandGreen
            },
            styles.button
          ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='plus-circle' color={'white'} size={20} />
            <TextRegular textStyle={styles.text}>
              Confirm Order
            </TextRegular>
          </View>
        </Pressable>
          )}
           </Formik>
        <Pressable
          onPress={() => {
            showButton(false)
          }}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? GlobalStyles.brandPrimaryTap
                : GlobalStyles.brandPrimary
            },
            styles.button
          ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='minus-circle' color={'white'} size={20} />
            <TextRegular textStyle={styles.text}>
              Discard Order
            </TextRegular>
          </View>
        </Pressable>
        </View>
      )
    }
  }

  const renderProduct = ({ item }) => {
    if (button === true && item.availability) {
      return (
        <ImageCard
          imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
          title={item.name}
        >
          <TextRegular numberOfLines={2}>{item.description}</TextRegular>
          <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
          {!item.availability &&
            <TextRegular textStyle={styles.availability }>Not available</TextRegular>
          }
            <View style = {styles.inputContainer} >
                <TextInput
                  onChangeText={v => productCompararator({ key: item.id, value: Number(v) })}
                  defaultValue="0"

                />
              </View>
        </ImageCard>
      )
    } else {
      return <ImageCard
          imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : defaultProductImage}
          title={item.name}
        >
          <TextRegular numberOfLines={2}>{item.description}</TextRegular>
          <TextSemiBold textStyle={styles.price}>{item.price.toFixed(2)}€</TextSemiBold>
          {!item.availability &&
            <TextRegular textStyle={styles.availability }>Not available</TextRegular>
          }
        </ImageCard>
    }
  }

  const renderEmptyProductsList = () => {
    return (
      <TextRegular textStyle={styles.emptyList}>
        This restaurant has no products yet.
      </TextRegular>
    )
  }

  const fetchRestaurantDetail = async () => {
    try {
      const fetchedRestaurant = await getDetail(route.params.id)
      setRestaurant(fetchedRestaurant)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving restaurant details (id ${route.params.id}). ${error}`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return (
      <FlatList
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyProductsList}
          style={styles.container}
          data={restaurant.products}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
        />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  inputContainer: {
    width: '20%',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: GlobalStyles.brandSecondary
  },
  restaurantHeaderContainer: {
    height: 250,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'column',
    alignItems: 'center'
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center'
  },
  image: {
    height: 100,
    width: 100,
    margin: 10
  },
  description: {
    color: 'white'
  },
  textTitle: {
    fontSize: 20,
    color: 'white'
  },
  emptyList: {
    textAlign: 'center',
    padding: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    width: '80%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    marginLeft: 5
  },
  availability: {
    textAlign: 'right',
    marginRight: 5,
    color: GlobalStyles.brandSecondary
  },
  actionButton: {
    borderRadius: 8,
    height: 40,
    marginTop: 12,
    margin: '1%',
    padding: 10,
    alignSelf: 'center',
    flexDirection: 'column',
    width: '50%'
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    bottom: 5,
    position: 'absolute',
    width: '90%'
  }
})
