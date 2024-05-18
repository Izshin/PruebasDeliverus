const checkEntityExists = (model, idPathParamName) => async (req, res, next) => { // Hecho en clase
  try {
    const entity = await model.findByPk(req.params[idPathParamName])
    if (!entity) { return res.status(404).send('Not found') }
    return next()
  } catch (err) {
    return res.status(500).send(err)
  }
}
export { checkEntityExists }
