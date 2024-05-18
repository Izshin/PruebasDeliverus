import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, View, FlatList, ImageBackground, Image, Pressable, TextInput } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { edit, removeOrder } from '../../api/OrderEndpoints'
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
import DeleteModal from '../../components/DeleteModal'

export default function OrderEditScreen ({ navigation, route }) {
  console.log(route)
  const productOrderObj = {}
  let productOrderList = []
  const { loggedInUser } = useContext(AuthorizationContext)
  const [restaurant, setRestaurant] = useState({})
  const [initialProducts, setinitialProducts] = useState({})
  const [orderToBeDeleted, setOrderToBeDeleted] = useState(null)
  const initialOrderValues = {
    createdAt: Date(),
    startedAt: null,
    sentAt: null,
    deliveredAt: null,
    price: 0.0,
    address: loggedInUser.address,
    shippingCosts: 0.0,
    products: null,
    userId: loggedInUser.id,
    status: 'pending'

  }
  const [backendErrors, setBackendErrors] = useState()

  const productCompararator = function poductComparator (pareja) {
    console.log(productOrderObj)
    if ((!isNaN(pareja.value))) {
      productOrderObj[pareja.key] = pareja.value
      console.log(productOrderObj)
      console.log(Object.entries(productOrderObj).filter(([key, value]) => value !== 0).map(([key, value]) => ({ productid: key, quantity: value })))
      return productOrderObj
    }
  }

  useEffect(() => {
    fetchRestaurantDetail()
  }, [route.params.order.restaurantId])

  useEffect(() => {
    fetchInitialProducts()
  }, [route.params.order.products])

  const editOrder = async (values) => {
    try {
      setBackendErrors([])
      const definitiveProductObject = { ...initialProducts, ...productOrderObj }
      console.log(definitiveProductObject)
      productOrderList = Object.entries(definitiveProductObject).filter(([key, value]) => value !== 0).map(([key, value]) => ({ productId: key, quantity: value }))
      values.products = productOrderList
      console.log(values)
      await edit(route.params.order.id, values)
      showMessage({
        message: 'Order succesfully edited',
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
  const startingProducts = function startingProducts (productsOrder) {
    const productosIniciales = {}
    for (const p of productsOrder) {
      productosIniciales[p.OrderProducts.ProductId] = p.OrderProducts.quantity
    }
    return productosIniciales
  }
  const renderHeader = () => {
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
          onSubmit={editOrder}
          initialValues={initialOrderValues}
          >

          {({ handleSubmit, setFieldValue, values }) => (
          <Pressable

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
              Confirm Edited Order
            </TextRegular>
          </View>
        </Pressable>
          )}
           </Formik>
        <Pressable
          onPress={() => { setOrderToBeDeleted(route.params.order) }}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? GlobalStyles.brandPrimaryTap
                : GlobalStyles.brandPrimary
            },
            styles.button
          ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='minecraft' color={'white'} size={20} />
            <TextRegular textStyle={styles.text}>
              Delete Order
            </TextRegular>
          </View>
        </Pressable>
        </View>
    )
  }
  const deleteOrder = async (order) => {
    try {
      await removeOrder(order.id)
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order ${order.name} succesfully removed`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    } catch (error) {
      console.log(error)
      setOrderToBeDeleted(null)
      showMessage({
        message: `Order ${order.name} could not be removed.`,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  const renderProduct = ({ item }) => {
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
                  defaultValue={initialProducts[item.id] ? String(initialProducts[item.id]) : '0'}
                />
              </View>
        </ImageCard>
    )
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
      const fetchedRestaurant = await getDetail(route.params.order.restaurantId)
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
  const fetchInitialProducts = async () => {
    try {
      const productos = startingProducts(route.params.order.products)
      setinitialProducts(productos)
    } catch (error) {
      showMessage({
        message: 'There was an error while retrieving order products',
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }

  return (
      <>
          <FlatList
              ListHeaderComponent={renderHeader}
              ListEmptyComponent={renderEmptyProductsList}
              style={styles.container}
              data={restaurant.products}
              renderItem={renderProduct}
              keyExtractor={item => item.id.toString()}
            />
          <DeleteModal
            isVisible={orderToBeDeleted !== null}
            onCancel={() => setOrderToBeDeleted(null)}
            onConfirm={() => deleteOrder(orderToBeDeleted) && navigation.navigate('OrdersScreen')}>
            <TextRegular>If the order is not pending cannot be deleted</TextRegular>
            </DeleteModal>
        </>
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
