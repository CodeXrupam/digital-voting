app.controller('HowItWorksController', function($scope) {
    $scope.steps = [
        {
            number: 1,
            title: 'Voter Registration',
            description: 'Register using your Aadhaar and Voter ID. Our system verifies your identity through multiple authentication layers.'
        },
        {
            number: 2,
            title: 'Authentication',
            description: 'Complete the multi-factor authentication process including OTP verification and biometric confirmation.'
        },
        {
            number: 3,
            title: 'Voting Process',
            description: 'Cast your vote securely. Your choice is encrypted and anonymized before being recorded.'
        },
        {
            number: 4,
            title: 'Verification',
            description: 'Receive a confirmation receipt with a unique transaction ID while maintaining vote secrecy.'
        }
    ];
}); 