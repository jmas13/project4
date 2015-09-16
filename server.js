// BASE SETUP
// =============================================================================

// call the packages we need
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
// call Models
var Merchant    = require('./app/models/merchant');
var Product     = require('./app/models/product');

mongoose.connect('mongodb://localhost/mrkt');

//use bodyParser to get Post data
app.use(bodyParser.urlencoded({extended: true}));   //get params from url (I think)
app.use(bodyParser.json());                       //parse as json

var port = process.env.PORT || 5555;              //set port

// ROUTES FOR API
// =============================================================================

// get instance of express Router
var router = express.Router();

// middleware to use for all requests - probably putting authentication here
router.use(function(req, res, next) {
    // do logging for now
    console.log('Stuff is going down.');
    next(); // make sure we go to the next routes and don't stop here
});

// Test route make sure everything is working
// accessed in dev at GET http://localhost:5555/api/v1.0/
router.get('/', function(req, res) {
  res.json({ message: 'Hello! This is the API root!'});
});

// routes that end in /merchants -----------------------------------------------
router.route('/merchants')
  // Create a merchant
  // accessed in dev at POST http://localhost:5555/api/v1.0/merchants
  .post(function(req, res) {
    var merchant = new Merchant();
    merchant.name         = req.body.name;
    merchant.description  = req.body.description;
    // NOTE: expected to need to do some type coercion here but handled by body-parser or urlencoding or both?
    merchant.open         = req.body.open;
    // Save merchant and check for errors
    merchant.save(function(err){
      if (err){
        res.send(err);
      }
      res.json({message: 'merchant created!'})
    });
  })
  // Get all the merchants!
  // accessed in dev at GET http://localhost:5555/api/v1.0/merchants
  .get(function(req, res) {
    Merchant.find(function(err, merchants) {
      if (err) {
        res.send(err);
      }
      res.json(merchants);
    });
  });
// routes that end in /merchants/:merchant_id ----------------------------------
router.route('/merchants/:merchant_id')
  // Get a merchant by id
  // accessed in dev at GET http://localhost:5555/api/v1.0/merchants/merchant_id
  .get(function(req, res) {
    Merchant.findById(req.params.merchant_id, function(err, merchant) {
      if (err) {
        res.send(err);
      }
      res.json(merchant)
    });
  })
  // Update a merchant
  // accessed in dev at PUT http://localhost:5555/api/v1.0/merchants/merchant_id
  // TODO: consider .findByIdAndUpdate (will bypass validations so prolly not)
  .put(function(req, res) {
    Merchant.findById(req.params.merchant_id, function(err, merchant) {
      if (err) {
        res.send(err);
      }

    })
  })

// REGISTER ROUTES -------------------------------
// all routes will be prefixed with /api/v1.0
app.use('/api/v1.0', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('port ' + port + ' is where the magic happens')
