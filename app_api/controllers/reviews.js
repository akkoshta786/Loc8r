const mongoose = require('mongoose');
const Loc = mongoose.model('Location');

const doSetAverageRating = (location) => {
  let i, reviewCount, ratingAverage, ratingTotal;
  if (location.reviews && location.reviews.length > 0) {
    reviewCount = location.reviews.length;
    ratingTotal = 0;
    for (i = 0; i < reviewCount; i++) {
      ratingTotal = ratingTotal + location.reviews[i].rating;
    }
    ratingAverage = parseInt(ratingTotal / reviewCount, 10);
    location.rating = ratingAverage;
    location.save((err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Average rating updated to ", ratingAverage);
      }
    })
  }
}

const updateAverageRating = (locationid) => {
  Loc.findById(locationid)
    .select('rating reviews')
    .exec((err, location) => {
      if (!err) {
        doSetAverageRating(location)
      }
    })
}

const doAddReview = (req, res, location) => {
  if (!location) {
    sendJsonResponse(res, 404, {
      'message': 'locationid not found'
    });
  } else {
    location.reviews.push({
      author: req.body.author,
      rating: req.body.rating,
      reviewText: req.body.reviewText
    });
    location.save((err, location) => {
      let thisReview;
      if (err) {
        sendJsonResponse(res, 400, err);
      } else {
        updateAverageRating(location._id);
        thisReview = location.reviews[location.reviews.length - 1];
        sendJsonResponse(res, 201, thisReview);
      }
    })
  }
}


module.exports.reviewsCreate = (req, res) => {
  const locationid = req.params.locationid;
  if (locationid) {
    Loc.findById(locationid)
      .select('reviews')
      .exec((err, location) => {
        if (err) {
          sendJsonResponse(res, 400, err);
        } else {
          doAddReview(req, res, location);
        }
      });
  } else {
    sendJsonResponse(res, 404, {
      'message': 'Not found locationid required'
    });
  }
}

module.exports.reviewsReadOne = (req, res) => {
  if (req.params && req.params.locationid && req.params.reviewid) {
    Loc.findById(req.params.locationid)
      .select('name reviews')
      .exec((err, location) => {
        var response, review;
        if (!location) {
          sendJsonResponse(res, 404, {
            'message': 'locationid not found'
          });
          return;
        } else if (err) {
          sendJsonResponse(res, 400, err);
          return;
        }

        if (location.reviews && location.reviews.length > 0) {
          review = location.reviews.id(req.params.reviewid);
          if (!review) {
            sendJsonResponse(res, 404, {
              'message': "reviewid not found"
            });
          } else {
            response = {
              location: {
                name: location.name,
                id: req.params.locationid
              },
              review: review
            };
            sendJsonResponse(res, 200, response);
          }
        } else {
          sendJsonResponse(res, 404, {
            'message': "No reviews found"
          })
        }
      })
  } else {
    sendJsonResponse(res, 404, {
      'message': "Not found, locationid and reviewid are both required"
    })
  }
}

module.exports.reviewsUpdateOne = (req, res) => {

}

module.exports.reviewsDeleteOne = (req, res) => {

}

const sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};