const mongoose = require("mongoose");
const Loc = mongoose.model("Location");

const earthRadius = 6371;

module.exports.locationsListByDistance = async (req, res) => {
  const lng = parseFloat(req.query.lng);
  const lat = parseFloat(req.query.lat);
  const maxDist = parseFloat(req.query.maxdist) || 1; // in km
  const limit = parseInt(req.query.limit) || 2;

  if (!lat || !lng) {
    sendJsonResponse(res, 404, {
      message: "lng and lat query parameters are required",
    });
    return;
  }

  try {
    let locations = [];
    const geoOptions = {
      let: { pt: [lng, lat] },
    };

    const fetchedLocations = await Loc.aggregate(
      [
        {
          $geoNear: {
            near: "$$pt",
            distanceField: "distance",
            distanceMultiplier: earthRadius,
            maxDistance: maxDist / earthRadius,
            includeLocs: "dist.location",
            spherical: true,
          },
        },
      ],
      geoOptions
    ).limit(limit);

    if (fetchedLocations.length == 0) {
      sendJsonResponse(res, 200, { message: "No result found" });
      return;
    }

    fetchedLocations.forEach((loc) => {
      locations.push({
        distance: loc.distance,
        name: loc.name,
        address: loc.address,
        rating: loc.rating,
        facilities: loc.facilities,
        _id: loc._id,
      });
    });

    sendJsonResponse(res, 200, locations);
  } catch (e) {
    sendJsonResponse(res, 500, {
      message: "An error has occured while fetching locations",
    });
  }
};

module.exports.locationsCreate = (req, res) => {
  Loc.create({
    name: req.body.name,
    address: req.body.address,
    facilities: req.body.facilities.split(','),
    location: {coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)]},
    openingTimes: [{
      days: req.body.days1,
      opening: req.body.opening1,
      closing: req.body.closing1,
      closed: req.body.closed1,
    }, {
      days: req.body.days2,
      opening: req.body.opening2,
      closing: req.body.closing2,
      closed: req.body.closed2,
    }],
  }, (err, location) => {
    if (err){
      sendJsonResponse(res, 400, err);
    } else {
      sendJsonResponse(res, 201, location);
    }
  })
};

module.exports.locationsReadOne = (req, res) => {
  if (req.params && req.params.locationid) {
    Loc.findById(req.params.locationid).exec((err, location) => {
      if (!location) {
        sendJsonResponse(res, 404, {
          message: "locationid not found",
        });
        return;
      } else if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }
      sendJsonResponse(res, 200, location);
    });
  } else {
    sendJsonResponse(res, 404, {
      message: "No locationid in request",
    });
  }
};

module.exports.locationsUpdateOne = (req, res) => {};

module.exports.locationsDeleteOne = (req, res) => {};

const sendJsonResponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};
