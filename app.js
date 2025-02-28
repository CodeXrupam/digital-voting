const app = angular.module('voteSecureApp', []);

// Common services
app.service('navigationService', function() {
    this.goBack = function() {
        window.history.back();
    };

    this.goToHome = function() {
        window.location.href = 'index.html';
    };
});

// Common directives
app.directive('vsBackButton', function(navigationService) {
    return {
        restrict: 'E',
        template: `
            <a href="javascript:void(0)" class="back-button" ng-click="goBack()">
                <i class="fas fa-arrow-left"></i>
                Back to Home
            </a>
        `,
        controller: function($scope) {
            $scope.goBack = navigationService.goBack;
        }
    };
}); 