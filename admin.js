document.addEventListener('DOMContentLoaded', () => {
    // Check if admin is logged in
    const admin = sessionStorage.getItem('adminId');
    if (!admin) {
        window.location.href = 'gov-login.html';
        return;
    }

    // Initialize session status if not exists
    if (localStorage.getItem('sessionActive') === null) {
        localStorage.setItem('sessionActive', 'false');
    }

    // Set admin name
    const adminName = document.getElementById('adminName');
    if (adminName) {
        adminName.textContent = `Welcome, ${admin}`;
    }

    // Load initial data
    loadVotingStats();
    loadPartyList();

    // Handle add party form
    const addPartyForm = document.getElementById('addPartyForm');
    if (addPartyForm) {
        addPartyForm.addEventListener('submit', handleAddParty);
    }

    // Handle logout
    window.handleLogout = function() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('adminId');
            window.location.href = 'index.html';
        }
    };

    // Start live updates when page loads
    startLiveUpdates();
    updateVoteCount();
});

// Start voting session
window.startSession = function() {
    const parties = JSON.parse(localStorage.getItem('parties')) || [];
    
    if (parties.length === 0) {
        // Show warning modal if no parties exist
        const warningModal = document.createElement('div');
        warningModal.className = 'modal';
        warningModal.innerHTML = `
            <div class="modal-content warning-modal">
                <div class="modal-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>No Parties Added</h2>
                </div>
                <div class="modal-body">
                    <p>Please add at least one party before starting the voting session.</p>
                    <button class="btn btn-primary" onclick="closeModal(this)">
                        <i class="fas fa-check"></i> Okay
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(warningModal);
        return;
    }

    if (confirm('Are you sure you want to start a new voting session? This will clear all previous votes.')) {
        localStorage.setItem('sessionActive', 'true');
        localStorage.removeItem('votes'); // Clear previous votes
        showSuccess('New voting session started successfully');
        loadVotingStats();
        loadPartyList();
    }
};

// End voting session
window.endSession = function() {
    if (confirm('Are you sure you want to end the current voting session? This will lock all votes.')) {
        localStorage.setItem('sessionActive', 'false');
        
        // Clear parties when session ends
        localStorage.removeItem('parties');
        
        // Show cleanup modal
        const cleanupModal = document.createElement('div');
        cleanupModal.className = 'modal';
        cleanupModal.innerHTML = `
            <div class="modal-content cleanup-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-check-circle"></i> Session Ended Successfully</h2>
                </div>
                <div class="modal-body">
                    <p>Session has ended and party data has been cleared.</p>
                    <div class="cleanup-options">
                        <button class="btn btn-outline" onclick="downloadResults()">
                            <i class="fas fa-download"></i> Download Results
                        </button>
                        <button class="btn btn-outline" onclick="closeAndRefresh(this)">
                            <i class="fas fa-sync"></i> Refresh Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(cleanupModal);
        
        // Refresh displays
        loadPartyList();
        loadVotingStats();
    }
};

// Handle adding new party
function handleAddParty(e) {
    e.preventDefault();
    const parties = JSON.parse(localStorage.getItem('parties')) || [];
    
    // Get file input
    const fileInput = document.getElementById('partyLogo');
    const file = fileInput.files[0];
    
    // Create new party object
    const newParty = {
        id: Date.now().toString(),
        name: document.getElementById('partyName').value,
        candidate: document.getElementById('candidateName').value,
        symbol: document.getElementById('partySymbol').value,
        logo: file ? URL.createObjectURL(file) : 'assets/default-party.png'
    };

    // Add to parties array
    parties.push(newParty);
    localStorage.setItem('parties', JSON.stringify(parties));
    
    // Refresh displays
    loadPartyList();
    loadVotingStats();
    
    // Reset form and show success message
    e.target.reset();
    showSuccess('Party added successfully');
}

// Load voting statistics
function loadVotingStats() {
    const votes = JSON.parse(localStorage.getItem('votes')) || {};
    const parties = JSON.parse(localStorage.getItem('parties')) || [];
    const totalVotes = Object.keys(votes).length;
    const stats = {};
    
    // Count votes for each party
    Object.values(votes).forEach(partyId => {
        stats[partyId] = (stats[partyId] || 0) + 1;
    });

    // Create stats HTML
    const statsHtml = parties.map(party => {
        const partyVotes = stats[party.id] || 0;
        const percentage = totalVotes ? ((partyVotes / totalVotes) * 100).toFixed(1) : 0;
        
        return `
            <div class="stat-item">
                <div class="stat-header">
                    <span>${party.name}</span>
                    <span>${partyVotes} votes (${percentage}%)</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${percentage}%">
                            <div class="progress-glow"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Update stats display
    const votingStats = document.getElementById('votingStats');
    if (votingStats) {
        if (parties.length > 0) {
            votingStats.innerHTML = `
                <div class="total-votes">Total Votes: ${totalVotes}</div>
                ${statsHtml}
            `;
        } else {
            votingStats.innerHTML = `
                <div class="no-stats-message">
                    <i class="fas fa-chart-bar"></i>
                    <p>No parties added yet. Add parties to see voting statistics.</p>
                </div>
            `;
        }
    }
}

// Load party list
function loadPartyList() {
    const isSessionActive = localStorage.getItem('sessionActive') === 'true';
    const partyList = document.getElementById('partyList');
    
    if (partyList) {
        if (isSessionActive) {
            const parties = JSON.parse(localStorage.getItem('parties')) || [];
            if (parties.length > 0) {
                partyList.innerHTML = parties.map(party => `
                    <div class="party-item">
                        <img src="${party.logo}" alt="${party.name}" onerror="this.src='assets/default-party.png'">
                        <div class="party-details">
                            <h4>${party.name}</h4>
                            <p><i class="fas fa-user"></i> Candidate: ${party.candidate}</p>
                            <p><i class="fas fa-flag"></i> Symbol: ${party.symbol}</p>
                        </div>
                    </div>
                `).join('');
            } else {
                partyList.innerHTML = `
                    <div class="no-parties-message">
                        <i class="fas fa-plus-circle"></i>
                        <p>No parties added yet. Use the form above to add parties.</p>
                    </div>
                `;
            }
        } else {
            partyList.innerHTML = `
                <div class="no-parties-message">
                    <i class="fas fa-info-circle"></i>
                    <p>No active session. Start a session to add and view parties.</p>
                </div>
            `;
        }
    }
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

// Add this function to handle party removal
function removeAllParties() {
    if (confirm('⚠️ Warning: This will permanently remove all party data. Continue?')) {
        localStorage.removeItem('parties');
        
        // Show success message
        const successModal = document.createElement('div');
        successModal.className = 'modal';
        successModal.innerHTML = `
            <div class="modal-content success-modal">
                <div class="modal-header">
                    <i class="fas fa-check-circle success-icon"></i>
                    <h2>Parties Removed Successfully</h2>
                </div>
                <div class="modal-body">
                    <p>All party data has been cleared from the system.</p>
                    <button class="btn btn-primary" onclick="closeAndRefresh(this)">
                        <i class="fas fa-sync"></i> Refresh Dashboard
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(successModal);
        
        // Refresh the displays
        loadPartyList();
        loadVotingStats();
    }
}

// Add helper function to close modal and refresh
function closeAndRefresh(button) {
    button.closest('.modal').remove();
    window.location.reload();
}

// Add function to close modal
function closeModal(button) {
    button.closest('.modal').remove();
}

// Add refreshDashboard function
function refreshDashboard() {
    // Clear all data from localStorage
    localStorage.removeItem('votes');
    localStorage.removeItem('parties');
    localStorage.removeItem('sessionActive');
    localStorage.removeItem('votingStats');
    
    // Refresh the page
    window.location.reload();
}

// Update clearAllData function to use closeAndRefresh instead
function clearAllData() {
    if (confirm('⚠️ Warning: This will permanently delete all voting data and party information. Continue?')) {
        // Clear all relevant data
        localStorage.removeItem('votes');
        localStorage.removeItem('parties');
        localStorage.removeItem('sessionActive');
        localStorage.removeItem('votingStats');
        
        // Show success message
        const successModal = document.createElement('div');
        successModal.className = 'modal';
        successModal.innerHTML = `
            <div class="modal-content success-modal">
                <div class="modal-header">
                    <i class="fas fa-check-circle success-icon"></i>
                    <h2>Data Cleared Successfully</h2>
                </div>
                <div class="modal-body">
                    <p>All session data has been cleared.</p>
                    <button class="btn btn-primary" onclick="closeAndRefresh(this)">
                        <i class="fas fa-sync"></i> Refresh Dashboard
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(successModal);
        
        // Reset the displays
        loadPartyList();
        loadVotingStats();
    }
}

// Add live vote counting with progress bars
function updateVoteCount() {
    const votes = JSON.parse(localStorage.getItem('votes')) || {};
    const parties = JSON.parse(localStorage.getItem('parties')) || [];
    const totalVotes = Object.keys(votes).length;
    const statsContainer = document.getElementById('votingStats');

    if (statsContainer) {
        let statsHTML = `<div class="total-votes">Total Votes: ${totalVotes}</div>`;
        
        parties.forEach(party => {
            const partyVotes = Object.values(votes).filter(v => v === party.id).length;
            const percentage = totalVotes ? ((partyVotes / totalVotes) * 100).toFixed(1) : 0;
            
            statsHTML += `
                <div class="stat-item">
                    <div class="stat-header">
                        <span>${party.name}</span>
                        <span>${partyVotes} votes (${percentage}%)</span>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress" style="width: ${percentage}%">
                                <div class="progress-glow"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        statsContainer.innerHTML = statsHTML;
    }
}

// Start live updates when session is active
function startLiveUpdates() {
    const isSessionActive = localStorage.getItem('sessionActive') === 'true';
    if (isSessionActive) {
        // Update every 2 seconds
        setInterval(updateVoteCount, 2000);
    }
} 