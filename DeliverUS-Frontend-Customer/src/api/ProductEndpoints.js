import { get } from './helpers/ApiRequestsHelper'

function getProductCategories () {
  return get('productCategories')
}

function getPopularProducts () {
  return get('/products/popular')
}

export { getProductCategories, getPopularProducts }
