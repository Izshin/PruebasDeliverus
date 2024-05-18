import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, FlatList, Pressable, View } from 'react-native'
import { getOrdersUser, removeOrder } from '../../api/OrderEndpoints'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import TextRegular from '../../components/TextRegular'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import ImageCard from '../../components/ImageCard'
import restaurantLogoImage from '../../../assets/restaurantLogo.jpeg'
import { AuthorizationContext } from '../../context/AuthorizationContext'
import DeleteModal from '../../components/DeleteModal'

export default function OrdersScreen ({ navigation, route }) {
  const [orders, setOrders] = useState([])
  const [orderToBeDeleted, setOrderToBeDeleted] = useState(null)
  const { loggedInUser } = useContext(AuthorizationContext)

  useEffect(() => {
    if (loggedInUser) {
      fetchOrders()
    } else {
      setOrders(null)
    }
  }, [loggedInUser, route])

  const fetchOrders = async () => {
    try {
      const fetchedOrders = await getOrdersUser()
      setOrders(fetchedOrders)
    } catch (error) {
      showMessage({
        message: `There was an error while retrieving orders. ${error} `,
        type: 'error',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
    }
  }
  const renderOrder = ({ item }) => {
    if (item.status === 'pending') {
      return (
      <ImageCard
      imageUri={item.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + item.restaurant.logo } : restaurantLogoImage}
        title={item.createdAt.toString().split('T')[0]}
        onPress={() => {
          navigation.navigate('OrderDetailScreen', { id: item.id })
        }}
      >
        <TextRegular>Status: <TextRegular>{item.status}</TextRegular></TextRegular>
        <TextRegular>Price: <TextRegular>{item.price}</TextRegular></TextRegular>
        <TextRegular>Address: <TextRegular>{item.address}</TextRegular></TextRegular>
        <Pressable
            onPress={() => {
              navigation.navigate('OrderEditScreen', { order: item })
            }}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? GlobalStyles.brandBlueTap
                  : GlobalStyles.brandBlue
              },
              styles.actionButton
            ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='pencil' color={'white'} size={20}/>
            <TextRegular textStyle={styles.text}>
              Edit
            </TextRegular>
          </View>
        </Pressable>

        <Pressable
          onPress={() => { setOrderToBeDeleted(item) }}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? GlobalStyles.brandPrimaryTap
                : GlobalStyles.brandPrimary
            },
            styles.actionButton
          ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='minecraft' color={'white'} size={20}/>
            <TextRegular textStyle={styles.text}>
              Delete
            </TextRegular>
          </View>
        </Pressable>
      </ImageCard>
      )
    } else {
      return (
        <ImageCard
          imageUri={item.restaurant.logo ? { uri: process.env.API_BASE_URL + '/' + item.restaurant.logo } : restaurantLogoImage}
            title={item.createdAt.toString().split('T')[0]}
            onPress={() => {
              navigation.navigate('OrderDetailScreen', { id: item.id })
            }}
        >
            <TextRegular>Status: <TextRegular>{item.status}</TextRegular></TextRegular>
            <TextRegular>Price: <TextRegular>{item.price}</TextRegular></TextRegular>
            <TextRegular>Address: <TextRegular>{item.address}</TextRegular></TextRegular>
          </ImageCard>
      )
    }
  }

  const deleteOrder = async (order) => {
    try {
      await removeOrder(order.id)
      await fetchOrders()
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

  return (
    <>
      <FlatList
      data={orders}
      renderItem={renderOrder}
      />
      <DeleteModal
        isVisible={orderToBeDeleted !== null}
        onCancel={() => setOrderToBeDeleted(null)}
        onConfirm={() => deleteOrder(orderToBeDeleted)}>
        <TextRegular>If the order is not pending cannot be deleted</TextRegular>
      </DeleteModal>
    </>
  )
}

const styles = StyleSheet.create({
  FRHeader: { // TODO: remove this style and the related <View>. Only for clarification purposes
    justifyContent: 'center',
    alignItems: 'left',
    margin: 50
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  },
  button: {
    borderRadius: 8,
    height: 40,
    margin: 12,
    padding: 10,
    width: '100%'
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center'
  }
})
