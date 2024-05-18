import OrderController from '../controllers/OrderController.js'
import { hasRole, isLoggedIn } from '../middlewares/AuthMiddleware.js'
import { checkEntityExists } from '../middlewares/EntityMiddleware.js'
import * as OrderMiddleware from '../middlewares/OrderMiddleware.js'
import { Order } from '../models/models.js'
import * as OrderValidation from '../controllers/validation/OrderValidation.js'
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware.js'

const loadFileRoutes = function (app) {
  // DONE: Include routes for:
  // 1. Retrieving orders from current logged-in customer
  app.route('/orders')
    .get(
      isLoggedIn,
      hasRole('customer'),
      OrderController.indexCustomer
    )
  // 2. Creating a new order (only customers can create new orders)
  // Quizá haya que hacer el order controller antes del validation pues ahi es cuando se hayan los productos reales
    .post(
      isLoggedIn,
      hasRole('customer'),
      OrderMiddleware.checkRestaurantExists,
      OrderValidation.create,
      handleValidation,
      OrderController.create

    )

  app.route('/orders/:orderId/confirm') // Hecho en clase
    .patch(
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderOwnership,
      OrderMiddleware.checkOrderIsPending,
      OrderController.confirm)
  app.route('/orders/:orderId/send') // Hecho en clase
    .patch(
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderOwnership,
      OrderMiddleware.checkOrderCanBeSent,
      OrderController.send)

  app.route('/orders/:orderId/deliver') // Hecho en clase
    .patch(
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderOwnership,
      OrderMiddleware.checkOrderCanBeDelivered,
      OrderController.deliver)

  // DONE: Include routes for:
  // 3. Editing order (only customers can edit their own orders)
  // 4. Remove order (only customers can remove their own orders)
  app.route('/orders/:orderId')
    .delete(
      isLoggedIn,
      hasRole('customer'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderCustomer,
      OrderMiddleware.checkOrderIsPending,
      OrderController.destroy)
    .put(
      isLoggedIn,
      hasRole('customer'),
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderCustomer,
      OrderMiddleware.checkOrderIsPending,
      OrderValidation.update,
      handleValidation,
      OrderController.update)
    .get( // Hecho en clase
      isLoggedIn,
      checkEntityExists(Order, 'orderId'),
      OrderMiddleware.checkOrderVisible,
      OrderController.show)
}

export default loadFileRoutes
