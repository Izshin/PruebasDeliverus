
import React, { useEffect, useState } from 'react'
import { StyleSheet, FlatList, View, ScrollView } from 'react-native'
import TextSemiBold from '../../components/TextSemibold'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import { getRestaurantCustumer } from '../../api/RestaurantEndpoints'
import restaurantLogo from '../../../assets/restaurantLogo.jpeg'
import productLogo from '../../../assets/product.jpeg'
import ImageCard from '../../components/ImageCard'
import { getPopularProducts } from '../../api/ProductEndpoints'

export default function RestaurantsScreen ({ navigation, route }) {
  const [restaurants, setRestaurants] = useState([])
  const [products, set3Product] = useState([])

  useEffect(() => {
    async function fetchRestaurants () {
      try {
        const fetchedRestaurants = await getRestaurantCustumer()
        setRestaurants(fetchedRestaurants)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving restaurants. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }

    fetchRestaurants()
  }, [])

  useEffect(() => {
    async function fetchProducts () {
      try {
        const fetchedProducts = await getPopularProducts()
        set3Product(fetchedProducts)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving products. ${error} `,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchProducts()
  }, [])

  const renderRestaurant = ({ item }) => {
    return (
      <ImageCard
        imageUri={item.logo ? { uri: process.env.API_BASE_URL + '/' + item.logo } : restaurantLogo}
        title={item.name}
        onPress={() => {
          navigation.navigate('RestaurantDetailScreen', { id: item.id })
        }}
        style={({ pressed }) => [
          {
            backgroundColor: pressed
              ? GlobalStyles.brandPrimaryTap
              : GlobalStyles.brandPrimary
          },
          styles.button
        ]}
      >
        <TextRegular textStyle={styles.text}>Go to Restaurant Detail Screen</TextRegular>
        <TextRegular numberOfLines={2}>{item.description}</TextRegular>
        {item.averageServiceMinutes !== null &&
          <TextSemiBold>Avg. service time: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.averageServiceMinutes} min.</TextSemiBold></TextSemiBold>
        }
        <TextSemiBold>Shipping: <TextSemiBold textStyle={{ color: GlobalStyles.brandPrimary }}>{item.shippingCosts.toFixed(2)}€</TextSemiBold></TextSemiBold>
      </ImageCard>
    )
  }

  const renderProducts = ({ item }) => {
    return (
      <ImageCard
      imageUri={item.image ? { uri: process.env.API_BASE_URL + '/' + item.image } : productLogo}
      title={item.name}
      onPress={() => {
        navigation.navigate('RestaurantDetailScreen', { id: item.restaurantId })
      }}
      style={({ pressed }) => [
        {
          backgroundColor: pressed
            ? GlobalStyles.brandPrimaryTap
            : GlobalStyles.brandPrimary
        },
        styles.button
      ]}>

      </ImageCard>
    )
  }
  return (
    <ScrollView>
    <View>
    <FlatList
      data={ products}
      renderItem={renderProducts}
    />
    <FlatList
      data={restaurants}
      renderItem={renderRestaurant}
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
