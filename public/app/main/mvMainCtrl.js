angular.module('app').controller('mvMainCtrl', ['mvMerchant', '$scope', function(mvMerchant, $scope) {
  $scope.merchants = mvMerchant.query();
}])
