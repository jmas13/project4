var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
  _merchant:    {
                type: Schema.Types.ObjectId,
                ref: 'Merchant',
                required: true
                },
  name:         {type: String, required: true},
  description:  String,
  price:        {type: Number, required: true},
  unit:         {type: String, required: true},
  available:    {type: Boolean, required: true}
});

module.exports = mongoose.model('Product', productSchema)
