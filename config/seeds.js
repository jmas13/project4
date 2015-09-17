// NOTE: writing these seeds was one of the most time consuming and revealing parts of this project
// still a work in progress. Understanding asynchronicity doesn't happen all at once
var mongoose    = require('mongoose');
var url          = require('./db').url;

var Merchant    = require('../app/models/merchant');
var Product     = require('../app/models/product');

// TODO: Drop database or empty collections before seeding
mongoose.connect(url);
var db = mongoose.connection;
// TODO: this is from mongoose quickstart -- look into exactly what it does (the console.error bit)
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  seedMerchants();
})

function seedMerchants(){
  for (var i = 0; i < 10; i++) {
    Merchant.create({
      name        : ('Seed Merchant no.' + i),
      description : ('Description of merchant no.' + i + '...'),
      open        : (Math.random() > 0.3)
    }, function(err, merchant) {
      if (err) {
        return console.log(err);
      }
      //NOTE: error in seeding products will not hault merchant seeding
      seedProducts(merchant);
      console.log(merchant.name + ' saved!');
    });
  }
};

function seedProducts(merchant){
  for (var j = 0; j < 4; j++) {
    Product.create({
      _merchant    : merchant._id,
      name         : 'Seed Product no.' + j,
      description  : 'Description of product '+ j +' sold by ' + merchant.name,
      price        : (Math.floor(Math.random() * 20)),
      unit         : 'lbs',
      available    : (Math.random() > 0.3)
    }, function(err, product){
      if (err){
        return console.log(err);
      }
    });
  }
}
