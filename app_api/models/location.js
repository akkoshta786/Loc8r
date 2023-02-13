var mongoose = require("mongoose");

var openingTimeSchema = new mongoose.Schema({
  days: { type: String, required: true },
  opening: String,
  closing: String,
  closed: { type: Boolean, required: true },
});

var reviewSchema = new mongoose.Schema({
  _id: String,
  author: String,
  rating: { type: Number, required: true, min: 0, max: 5 },
  reviewText: String,
  createdOn: { type: Date, default: Date.now },
});

var locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  rating: { type: Number, default: 0, min: 0, max: 5 },
  facilities: [String],
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number],
  },
  openingTimes: [openingTimeSchema],
  reviews: [reviewSchema],
}).index({ location: "2dsphere" });

mongoose.model("Location", locationSchema);
