document.addEventListener('DOMContentLoaded', () => {
    // Simulated databases
    const voterDatabase = {
        "123456789012": {
            voterId: "ABC1234567",
            password: "voter123",
            hasVoted: false,
            name: "John Doe"
        }
    };

    const govDatabase = {
        "admin123": {
            password: "gov123",
            role: "admin",
            name: "Admin User"
        }
    };

    // Handle voter login
    const voterLoginForm = document.getElementById('voterLoginForm');
    if (voterLoginForm) {
        voterLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const aadhar = document.getElementById('aadharNo').value;
            const voterId = document.getElementById('voterId').value;
            const password = document.getElementById('password').value;

            if (validateVoter(aadhar, voterId, password)) {
                sessionStorage.setItem('currentVoter', aadhar);
                window.location.href = 'voting.html';
            } else {
                showError('Invalid credentials or you have already voted');
            }
        });
    }

    // Handle government login
    const govLoginForm = document.getElementById('govLoginForm');
    if (govLoginForm) {
        govLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const govId = document.getElementById('govId').value;
            const password = document.getElementById('govPassword').value;

            if (validateGovUser(govId, password)) {
                sessionStorage.setItem('adminId', govId);
                window.location.href = 'admin-dashboard.html';
            } else {
                showError('Invalid government credentials');
            }
        });
    }

    // Validate voter
    function validateVoter(aadhar, voterId, password) {
        const voter = voterDatabase[aadhar];
        return voter && 
               voter.voterId === voterId && 
               voter.password === password && 
               !voter.hasVoted;
    }

    // Validate government user
    function validateGovUser(govId, password) {
        const govUser = govDatabase[govId];
        return govUser && govUser.password === password;
    }

    // Show error message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }
});