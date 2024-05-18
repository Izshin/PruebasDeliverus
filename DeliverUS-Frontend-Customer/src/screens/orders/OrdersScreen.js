import React, { useEffect, useState } from 'react'
import { StyleSheet, FlatList, ScrollView, Pressable, View } from 'react-native'
import { getOrdersUser } from '../../api/OrderEndpoints'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import TextRegular from '../../components/TextRegular'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import ImageCard from '../../components/ImageCard'
import restaurantLogoImage from '../../../assets/restaurantLogo.jpeg'

export default function OrdersScreen ({ navigation }) {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    async function fetchOrders () {
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
    fetchOrders()
  })

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
            onPress={() => console.log(`Edit pressed for orderId = ${item.id}`)}
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

          onPress={() => console.log(`Delete pressed for orderId = ${item.id}`)}
          style={({ pressed }) => [
            {
              backgroundColor: pressed
                ? GlobalStyles.brandPrimaryTap
                : GlobalStyles.brandPrimary
            },
            styles.actionButton
          ]}>
          <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
            <MaterialCommunityIcons name='delete' color={'white'} size={20}/>
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

  return (
    <ScrollView>
      <FlatList
      data={orders}
      renderItem={renderOrder}
      />
    </ScrollView>
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
