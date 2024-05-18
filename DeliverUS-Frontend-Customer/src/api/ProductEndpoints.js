import { get, post } from './helpers/ApiRequestsHelper'

function getProductCategories () {
  return get('productCategories')
}

function getPopularProducts () {
  return get('/products/popular')
}

function create (data) {
  return post('orders', data)
}

export { getProductCategories, getPopularProducts, create }
