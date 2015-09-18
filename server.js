// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express'),
  stylus = require('stylus'),
  logger = require('morgan')
  bodyParser = require('body-parser'),
  mongoose = require('mongoose');
// Set environment (not totally sure where the best place to put this is)
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();

function compile(str, path) {
  return stylus(str).set('filename', path);
}
// call Models
var Merchant    = require('./server/models/merchant');
var Product     = require('./server/models/product');


// CONFIGURATION
// =============================================================================
app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');
app.use(stylus.middleware(
  {
    src: __dirname + '/public',
    compile: compile
  }
));
app.use(express.static(__dirname + '/public'));   //set static asset directory

if (process.env.NODE_ENV === 'development') {
  mongoose.connect('mongodb://localhost/mrkt');
}
else {
  mongoose.connect('mongodb://'+ process.env.MONGOLAB_USER +':'+ process.env.MONGOLAB_PASS +'@ds027483.mongolab.com:27483/mrkt')
}

var db = mongoose.connection;
// TODO: Look into syntax of both of the below -- get what they do but why write like this?
db.on('error', console.error.bind(console, 'connection error...'));
db.once('open', function callback() {
  console.log('mrkt db opened');
})

//use bodyParser to get Post data
app.use(bodyParser.urlencoded({extended: true}));   //get params from url (I think)
app.use(bodyParser.json());                       //parse as json


// ROUTES FOR API
// =============================================================================

// get instance of express Router
var router = express.Router();

// middleware to use for all requests - TODO: probably putting authentication here
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

// routes for merchants --------------------------------------------------------
router.route('/merchants')
  // Create a merchant
  // accessed in dev at POST http://localhost:5555/api/v1.0/merchants
  .post(function(req, res) {
    var merchant = new Merchant();
    // TODO: for... in... loop here?
    merchant.name         = req.body.name;
    merchant.description  = req.body.description;
    // NOTE: expected to need to do some type coercion here but handled by body-parser or urlencoding or both?
    merchant.open         = req.body.open;
    // Save merchant and check for errors
    merchant.save(function(err){
      if (err){
        res.send(err);
      }
      res.json({message: 'merchant created'})
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
// routes for a merchant -------------------------------------------------------
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
      for (attr in req.body){
        merchant[attr] = req.body[attr];
      }
      // Save merchant
      // NOTE: no error for illegal attributes but doesn't add to document
      merchant.save(function(err){
        if (err) {
          res.send(err);
        }
        res.json({message: 'merchant updated'});
      });
    });
  })
  // Delete a merchant
  // accessed in dev at DELETE http://localhost:555/api/v1.0/merchants/merchant_id
  .delete(function(req, res) {
    // TODO: look into async.js
    // Remove all products of merchant to be deleted
    Product.remove({_merchant: req.params.merchant_id}, function (err, products) {
      if (err) {
        res.send(err);
      }
      Merchant.remove({ _id: req.params.merchant_id}, function(err, merchant) {
        if (err) {
          res.send(err);
        }
        res.json({message: 'merchant deleted'});
      });
    })
    // NOTE: merchant (second arg of call back) is more like result object
  });

// routes for products ---------------------------------------------------------
router.route('/merchants/:merchant_id/products')
  // Create a new product for a merchant
  // accessed in dev at POST http://localhost:555/api/v1.0/merchants/merchant_id/products
  .post(function(req, res) {
    var product = new Product();
    product._merchant    = req.params.merchant_id;
    product.name         = req.body.name;
    product.description  = req.body.description;
    product.price        = req.body.price;
    product.unit         = req.body.unit;
    product.available    = req.body.available;

    // save the product and check for errors
    product.save(function(err) {
      if (err) {
        res.send(err);
      }
      res.json({message: 'producted created'});
    });
  })
  // Show products for a merchant
  // accessed in dev at GET http://localhost:5555/api/v1.0/merchants/merchant_id/products
  .get(function(req, res) {
    // TODO: figure out custom index for products on _merchant
    Product.find({_merchant: req.params.merchant_id}, function(err, products) {
      if (err) {
        res.send(err);
      }
      res.json(products);
    })
  });

// routes for a product --------------------------------------------------------
router.route('/products/:product_id')
  // Get a product by id
  // accessed in dev at GET http://localhost:5555/api/v1.0/products/product_id
  .get(function(req, res){
    Product.findById(req.params.product_id, function(err, product) {
      if (err) {
        res.send(err);
      }
      res.json(product);
    });
  })
  // Update a product
  // accessed in dev at PUT http://localhost:5555/api/v1.0/products/product_id
  .put(function(req, res) {
    Product.findById(req.params.product_id, function(err, product) {
      if (err) {
        res.send(err);
      }
      for (attr in req.body) {
        product[attr] = req.body[attr];
      }
      // save product
      product.save(function(err) {
        if (err) {
          res.send(err);
        }
        res.json({message: 'product updated'});
      });
    });
  })
  // Delete a product
  // accessed in dev at DELETE http:/localhost:5555/api/v1.0/products/product_id
  .delete(function(req, res) {
    Product.remove({_id: req.params.product_id}, function(err, product) {
      if (err) {
        res.send(err);
      }
      res.send({message: 'product deleted'})
    });
  });

// REGISTER ROUTES -------------------------------
// all routes will be prefixed with /api/v1.0

app.use('/api/v1.0', router);

// When a partial is requested - render from the jade template in views/partials
app.get('/partials/:partialPath', function(req, res) {
  res.render('partials/' + req.params.partialPath);
})
// NOTE: app.get('*') is the root of all evil. Seriously it makes debugging a nightmare
app.get('/', function(req, res) {
  res.render('index');
})

// START THE SERVER
// =============================================================================
var port = process.env.PORT || 5555;              //set port
app.listen(port);
console.log('port ' + port + ' is where the magic happens')
