import { get, destroy } from './helpers/ApiRequestsHelper'

function getOrdersUser () {
  return get('/orders')
}
function getOrderProducts (id) {
  return get('/orders/' + id)
}
function removeOrder (id) {
  return destroy(`orders/${id}`)
}
export { getOrdersUser, getOrderProducts,removeOrder }
