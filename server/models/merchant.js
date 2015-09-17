var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var merchantSchema = new Schema({
  name:         {type: String, required: true},
  description:  String,
  open:         {type: Boolean, required: true},
});

module.exports = mongoose.model('Merchant', merchantSchema)
