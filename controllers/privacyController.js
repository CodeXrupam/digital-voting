app.controller('PrivacyController', function($scope) {
    $scope.lastUpdated = 'March 2024';
    
    $scope.policies = [
        {
            title: 'Information We Collect',
            description: 'We collect information necessary for voter verification including:',
            items: [
                'Aadhaar number',
                'Voter ID',
                'Basic demographic information'
            ]
        },
        {
            title: 'How We Use Your Information',
            description: 'Your information is used solely for:',
            items: [
                'Voter authentication',
                'Preventing duplicate votes',
                'Statistical analysis (anonymized)'
            ]
        }
    ];
}); 