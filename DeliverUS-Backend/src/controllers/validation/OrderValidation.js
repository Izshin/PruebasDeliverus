import { check } from 'express-validator'
import { Restaurant, Order, Product } from '../../models/models.js'

const checkRestaurantExists = async (value, { req }) => { // Hecho en clase
  try {
    let restaurant = null
    if (value) {
      restaurant = await Restaurant.findByPk(req.body.restaurantId)
    }
    if (restaurant === null) {
      return Promise.reject(new Error('The restaurantId does not exist.'))
    } else { return Promise.resolve() }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

const checkProductsAvailable = async (value, { req }) => {
  try {
    let res = true
    for (const pr of req.body.products) {
      const product = await Product.findByPk(pr.productId)
      res = res && product.availability
      if (!res) {
        break
      }
    }
    if (res) {
      return Promise.resolve()
    } else {
      return Promise.reject(new Error('The product is not available.'))
    }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

const checkOrderIsPending = async (value, { req }) => {
  try {
    const order = await Order.findByPk(req.params.orderId)
    if (order.status === 'pending') {
      return Promise.resolve()
    } else {
      return Promise.reject(new Error('The order is not pending'))
    }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

const checkBelongSameRestaurant = async (value, { req }) => {
  try {
    let b = true
    let idRes = null
    for (const obj of req.body.products) {
      const product = await Product.findByPk(obj.productId)
      if (idRes === null) {
        idRes = product.restaurantId
      }
      b = b && (product.restaurantId === idRes)
    }
    if (b) {
      return Promise.resolve()
    } else {
      return Promise.reject(new Error('Products do not belong to the same restaurant'))
    }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

const checkArrayComposedandQuantity = (value, { req }) => {
  try {
    let b = true
    for (const obj of req.body.products) {
      b = b && (obj.productId !== null) && (obj.quantity > 0)
      if (!b) {
        break
      }
    }
    if (b) {
      return Promise.resolve()
    } else {
      return Promise.reject(new Error('The restaurantId does not exist.'))
    }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

// DONE: Include validation rules for create that should:
// 1. Check that restaurantId is present in the body and corresponds to an existing restaurant
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant
const create = [
  check('address').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('restaurantId').exists().isInt({ min: 1 }).toInt(),
  check('restaurantId').custom(checkRestaurantExists),

  check('products.*.quantity').custom(checkArrayComposedandQuantity) // ¡!
    .withMessage('The array of products is incorrect'),

  check('products').custom(checkProductsAvailable).withMessage('Products are not available'),

  check('products').custom(checkBelongSameRestaurant)
    .withMessage('The products doesn\'t belong to the same restaurant')

]
// DONE: Include validation rules for update that should:
// 1. Check that restaurantId is NOT present in the body.
// 2. Check that products is a non-empty array composed of objects with productId and quantity greater than 0
// 3. Check that products are available
// 4. Check that all the products belong to the same restaurant of the originally saved order that is being edited.
// 5. Check that the order is in the 'pending' state.
const update = [
  check('address').exists().isString().isLength({ min: 1, max: 255 }),
  check('restaurantId').not().exists(),
  check('products.*.quantity').custom(checkArrayComposedandQuantity).withMessage('The array of products is incorrect'),
  check('products').custom(checkProductsAvailable).withMessage('Products are not available'),
  check('products').custom(checkBelongSameRestaurant).withMessage('The products doesn\'t belong to the same restaurant'),
  check('status').custom(checkOrderIsPending).withMessage('The order is not pending, not modifiable')

]

export { create, update }
