app.controller('TermsController', function($scope) {
    $scope.lastUpdated = 'March 2024';
    
    $scope.terms = [
        {
            number: 1,
            title: 'Acceptance of Terms',
            content: 'By accessing and using VoteSecure, you agree to be bound by these Terms of Service.'
        },
        {
            number: 2,
            title: 'Eligibility',
            content: 'You must be a registered voter with valid credentials to use our voting services.'
        }
    ];
}); 