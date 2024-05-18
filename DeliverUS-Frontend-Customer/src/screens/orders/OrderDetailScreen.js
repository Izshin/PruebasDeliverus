/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { FlatList, ScrollView, StyleSheet, View } from 'react-native'
import TextRegular from '../../components/TextRegular'
import { getOrderProducts } from '../../api/OrderEndpoints'
import { showMessage } from 'react-native-flash-message'
import * as GlobalStyles from '../../styles/GlobalStyles'
import ImageCard from '../../components/ImageCard'
import productLogo from '../../../assets/product.jpeg'

export default function OrderDetailScreen ({ navigation, route }) {
  const [orders, setOrderDetail] = useState([])

  useEffect(() => {
    async function fetchOrder () {
      try {
        const fetchedOrder = await getOrderProducts(route.params.id)
        console.log(fetchedOrder)
        setOrderDetail(fetchedOrder.products)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving order. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchOrder()
  }, [route])

  const renderOrder = ({ item }) => {
    return (
      <View style={styles.card}>
      <ImageCard
      imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : productLogo}
      title={item.name}
      >
        <TextRegular> Precio: {item.price}€
        </TextRegular>
        <TextRegular> Quantity: {item.OrderProducts.quantity}
        </TextRegular>
      </ImageCard>
      </View>
    )
  }

  return (
    <ScrollView>
    <View style={styles.container}>
        <TextRegular>Order</TextRegular>
        <FlatList
          data= {orders}
          renderItem={renderOrder}
        />
    </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 50
  },
  card: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20
  }
})
