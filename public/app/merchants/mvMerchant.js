angular.module('app').factory('mvMerchant', ['$resource', function($resource) {
  return $resource('/api/v0.0/merchants/:id');
}]);
