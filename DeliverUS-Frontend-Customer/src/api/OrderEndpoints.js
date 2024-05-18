import { get, destroy, post, put } from './helpers/ApiRequestsHelper'

function getOrdersUser () {
  return get('/orders')
}
function getOrderProducts (id) {
  return get('/orders/' + id)
}
function removeOrder (id) {
  return destroy(`orders/${id}`)
}
function edit (id, data) {
  return put(`orders/${id}`, data)
}
function create (data) {
  return post('orders', data)
}
export { getOrdersUser, getOrderProducts, removeOrder, create, edit }
