document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the voting page
    if (!document.querySelector('.voting-page')) {
        return; // Exit if not on voting page
    }

    // Load voter name if logged in
    const voter = sessionStorage.getItem('currentVoter');
    const voterName = document.getElementById('voterName');
    if (voterName && voter) {
        voterName.textContent = `Welcome, Voter ${voter.slice(-4)}`;
    }

    // Load parties and check session status only if on voting page
    loadParties();
    checkSessionStatus();

    // Add event listener for back to home button
    const backHomeBtn = document.querySelector('.btn-outline[onclick="goToHome()"]');
    if (backHomeBtn) {
        backHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Check if we're already on the home page
            if (!window.location.pathname.includes('index.html')) {
                goToHome();
            }
        });
    }
});

function checkSessionStatus() {
    const isSessionActive = localStorage.getItem('sessionActive') === 'true';
    const votingContainer = document.querySelector('.voting-container');
    const partyGrid = document.getElementById('partyGrid');

    if (!isSessionActive) {
        if (partyGrid) {
            partyGrid.style.opacity = '0.5';
            partyGrid.style.pointerEvents = 'none';
        }
        
        const statusBanner = document.createElement('div');
        statusBanner.className = 'status-banner';
        statusBanner.innerHTML = `
            <div class="waiting-messages">
                <div class="waiting-message">
                    <i class="fas fa-info-circle"></i>
                    <p>Please wait for the admin to start the session</p>
                </div>
            </div>
        `;
        
        if (votingContainer && !votingContainer.querySelector('.status-banner')) {
            votingContainer.insertBefore(statusBanner, votingContainer.firstChild);
        }
    } else {
        const existingBanner = votingContainer?.querySelector('.status-banner');
        if (existingBanner) {
            existingBanner.remove();
        }
        if (partyGrid) {
            partyGrid.style.opacity = '1';
            partyGrid.style.pointerEvents = 'auto';
        }
    }
}

// Add this to periodically check session status
setInterval(checkSessionStatus, 2000); // Check every 2 seconds

function goToHome() {
    // Simplify navigation to always go to index.html in the same directory
    window.location.href = 'index.html';
}

function loadParties() {
    console.log('Loading parties...');
    const partyGrid = document.getElementById('partyGrid');
    
    if (!partyGrid) {
        console.error('Party grid element not found');
        return;
    }
    
    // Check session status
    const isSessionActive = localStorage.getItem('sessionActive') === 'true';
    if (!isSessionActive) {
        console.log('Session is not active');
        partyGrid.innerHTML = `
            <div class="no-parties-message">
                <i class="fas fa-clock"></i>
                <p>Voting session is not active. Please wait for the admin to start the session.</p>
            </div>
        `;
        return;
    }
    
    // Get parties from localStorage
    let parties = [];
    try {
        const partiesData = localStorage.getItem('parties');
        console.log('Raw parties data:', partiesData);
        parties = partiesData ? JSON.parse(partiesData) : [];
    } catch (error) {
        console.error('Error parsing parties data:', error);
        parties = [];
    }
    
    // Check if there are any parties
    if (!parties || parties.length === 0) {
        console.log('No parties found');
        partyGrid.innerHTML = `
            <div class="no-parties-message">
                <i class="fas fa-info-circle"></i>
                <p>No parties have been added yet. Please wait for the admin to add parties.</p>
            </div>
        `;
        return;
    }
    
    // Display parties
    console.log('Displaying parties:', parties);
    partyGrid.innerHTML = parties.map(party => `
        <div class="party-card" data-party="${party.id}">
            <img src="${party.logo}" alt="${party.name}" onerror="this.src='assets/default-party.png'">
            <h3>${party.name}</h3>
            <div class="party-info">
                <p><i class="fas fa-flag"></i> Party Symbol: ${party.symbol}</p>
                <p><i class="fas fa-user"></i> Candidate: ${party.candidate}</p>
            </div>
            <button class="btn btn-primary vote-btn" onclick="confirmVote('${party.id}', '${party.name}')">
                Vote for ${party.name}
            </button>
        </div>
    `).join('');
}

function confirmVote(partyId, partyName) {
    const voter = sessionStorage.getItem('currentVoter');
    
    // If not logged in, redirect to login page
    if (!voter) {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/html/') || currentPath.includes('/voting/')) {
            window.location.href = './voter-login.html';
        } else {
            window.location.href = 'html/voter-login.html';
        }
        return;
    }

    if (confirm(`Are you sure you want to vote for ${partyName}? This action cannot be undone.`)) {
        castVote(partyId, partyName);
    }
}

function castVote(partyId, partyName) {
    const voter = sessionStorage.getItem('currentVoter');
    const votes = JSON.parse(localStorage.getItem('votes')) || {};
    
    // Check if voter has already voted
    if (votes[voter]) {
        showAlreadyVotedMessage();
        return;
    }
    
    // Record the vote
    votes[voter] = partyId;
    localStorage.setItem('votes', JSON.stringify(votes));
    
    showSuccessMessage(partyName);
}

function showAlreadyVotedMessage() {
    const modal = document.createElement('div');
    modal.className = 'modal warning-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="warning-header">
                <i class="fas fa-exclamation-circle"></i>
                <h2>Already Voted</h2>
            </div>
            <div class="modal-body">
                <p>You have already cast your vote in this election.</p>
                <p class="warning-note">Each voter can only vote once.</p>
                <button class="btn btn-outline" onclick="closeModal(this)">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showSuccessMessage(partyName) {
    const voter = JSON.parse(sessionStorage.getItem('voterDetails')) || {};
    const modal = document.createElement('div');
    modal.className = 'modal thank-you-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-btn" onclick="closeModal(this)">
                <i class="fas fa-times"></i>
            </button>
            <div class="success-header">
                <i class="fas fa-check-circle"></i>
                <h2>Thank You for Voting!</h2>
                <p>Your vote has been recorded successfully and securely.</p>
            </div>
            <div class="receipt-preview">
                <h3>Voting Receipt</h3>
                <div class="receipt-details">
                    <p><strong>Receipt Number:</strong> VR-${Date.now()}</p>
                    <p><strong>Voter ID:</strong> ${voter.voterId || 'N/A'}</p>
                    <p><strong>Name:</strong> ${voter.name || 'N/A'}</p>
                    <p><strong>Aadhaar Number:</strong> ${voter.aadhaar ? '********' + voter.aadhaar.slice(-4) : 'N/A'}</p>
                    <p><strong>Age:</strong> ${voter.age || 'N/A'}</p>
                    <p><strong>Gender:</strong> ${voter.gender || 'N/A'}</p>
                    <p><strong>Mobile:</strong> ${voter.mobile || 'N/A'}</p>
                    <p><strong>Email:</strong> ${voter.email || 'N/A'}</p>
                    <p><strong>Constituency:</strong> ${voter.constituency || 'N/A'}</p>
                    <p><strong>Ward Number:</strong> ${voter.wardNo || 'N/A'}</p>
                    <p><strong>Voting Time:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Status:</strong> Vote Recorded Successfully</p>
                </div>
                <button class="btn download-btn" onclick="downloadReceipt()">
                    <i class="fas fa-download"></i> Download Receipt
                </button>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="handleLogout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function downloadReceipt() {
    const voter = JSON.parse(sessionStorage.getItem('voterDetails')) || {};
    const receiptNo = 'VR-' + Date.now();
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(script);

    script.onload = function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add header with logo
        doc.setFontSize(24);
        doc.setTextColor(33, 150, 243);
        doc.text('VoteSecure', 105, 20, { align: 'center' });
        
        doc.setFontSize(16);
        doc.text('Official Voting Receipt', 105, 35, { align: 'center' });

        // Add receipt details
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        const startY = 50;
        const lineHeight = 10;

        const details = [
            ['Receipt Number:', receiptNo],
            ['Voter ID:', voter.voterId || 'N/A'],
            ['Name:', voter.name || 'N/A'],
            ['Aadhaar Number:', voter.aadhaar ? '********' + voter.aadhaar.slice(-4) : 'N/A'],
            ['Age:', voter.age || 'N/A'],
            ['Gender:', voter.gender || 'N/A'],
            ['Mobile:', voter.mobile || 'N/A'],
            ['Email:', voter.email || 'N/A'],
            ['Constituency:', voter.constituency || 'N/A'],
            ['Ward Number:', voter.wardNo || 'N/A'],
            ['Voting Time:', new Date().toLocaleString()],
            ['Status:', 'Vote Recorded Successfully']
        ];

        details.forEach((detail, index) => {
            doc.setFont('helvetica', 'bold');
            doc.text(detail[0], 20, startY + (lineHeight * index));
            doc.setFont('helvetica', 'normal');
            doc.text(detail[1], 80, startY + (lineHeight * index));
        });

        // Add footer
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text('This is an electronically generated receipt.', 105, 250, { align: 'center' });
        doc.text('Keep this receipt for your records.', 105, 260, { align: 'center' });

        // Save the PDF
        doc.save(`VoteReceipt-${receiptNo}.pdf`);
    };
}

// Update the voting statistics display to include progress bars
function updateVotingStats(container) {
    const votes = JSON.parse(localStorage.getItem('votes')) || {};
    const parties = JSON.parse(localStorage.getItem('parties')) || [];
    const totalVotes = Object.keys(votes).length;

    return `
        <div class="voting-stats">
            <h4>Current Voting Statistics</h4>
            <p class="total-votes"><strong>Total Votes Cast:</strong> ${totalVotes}</p>
            ${parties.map(party => {
                const partyVotes = Object.values(votes).filter(v => v === party.id).length;
                const percentage = totalVotes ? ((partyVotes / totalVotes) * 100).toFixed(1) : 0;
                return `
                    <div class="party-stat">
                        <div class="stat-header">
                            <strong>${party.name}:</strong>
                            <span>${partyVotes} votes (${percentage}%)</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Add profile functionality
function showProfile() {
    const voter = JSON.parse(sessionStorage.getItem('voterDetails')) || {};
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content profile-modal">
            <div class="profile-header">
                <i class="fas fa-user-circle"></i>
                <h2>Voter Profile</h2>
            </div>
            <div class="profile-info">
                <div class="info-item">
                    <i class="fas fa-id-card"></i>
                    <div>
                        <label>Voter ID</label>
                        <p>${voter.voterId || 'N/A'}</p>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-fingerprint"></i>
                    <div>
                        <label>Aadhaar Number</label>
                        <p>${voter.aadhaar ? '********' + voter.aadhaar.slice(-4) : 'N/A'}</p>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <label>Constituency</label>
                        <p>${voter.constituency || 'N/A'}</p>
                    </div>
                </div>
            </div>
            <button class="btn btn-primary" onclick="closeModal(this)">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeModal(button) {
    button.closest('.modal').remove();
}

// Update handleLoginClick function
window.handleLoginClick = function() {
    // Check current path to determine correct navigation
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/html/') || currentPath.includes('/voting/')) {
        window.location.href = './voter-login.html';
    } else {
        window.location.href = 'html/voter-login.html';
    }
};

// Handle logout
window.handleLogout = function() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear all session data
        sessionStorage.removeItem('currentVoter');
        sessionStorage.removeItem('voterDetails');
        
        // Go to home using the same navigation logic
        goToHome();
    }
};