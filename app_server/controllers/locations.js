module.exports.homelist = (req, res) => {
  res.render('locations-list', { title: "Home" })
}

module.exports.locationInfo = (req, res) => {
  res.render('location-info', { title: 'Location Info' })
}

module.exports.addReview = (req, res) => {
  res.render('location-review-form', { title: 'Add Review' })
}