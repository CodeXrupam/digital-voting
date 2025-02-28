window.addEventListener('error', function(e) {
    // Prevent error messages for missing images/videos
    if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
        e.preventDefault();
        console.warn(`Failed to load resource: ${e.target.src}`);
    }
}, true);

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navButtons = document.querySelector('.nav-buttons');
    const modals = document.querySelectorAll('.modal');
    const loginModal = document.getElementById('loginModal');
    const otpModal = document.getElementById('otpModal');
    const biometricModal = document.getElementById('biometricModal');
    const votingInterface = document.getElementById('votingInterface');
    const adminDashboard = document.getElementById('adminDashboard');
    const menuIcon = mobileMenuBtn.querySelector('i');
    const navbar = document.querySelector('.navbar');

    // Simulated databases
    const voterDatabase = {
        "123456789012": {
            voterId: "ABC1234567",
            password: "voter123",
            hasVoted: false,
            mobile: "9876543210"
        }
    };

    const govDatabase = {
        "admin123": {
            password: "gov123",
            role: "admin"
        }
    };

    // Add these variables at the top of your script
    let isSessionActive = false;
    let currentSession = null;

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('show');
        navButtons.classList.toggle('show');
        
        // Toggle icon between bars and times
        menuIcon.classList.toggle('fa-bars');
        menuIcon.classList.toggle('fa-times');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-container')) {
            navLinks.classList.remove('show');
            navButtons.classList.remove('show');
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars');
        }
    });

    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('show');
            navButtons.classList.remove('show');
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars');
        });
    });

    // Close menu when scrolling
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > lastScroll) {
            navLinks.classList.remove('show');
            navButtons.classList.remove('show');
            menuIcon.classList.remove('fa-times');
            menuIcon.classList.add('fa-bars');
        }
        lastScroll = currentScroll;
    });

    // Show login modal
    window.showLoginModal = function(userType) {
        // Instead of showing a modal, we'll replace the entire content
        document.body.innerHTML = userType === 'voter' ? getVoterLoginPage() : getGovLoginPage();
    };

    function getVoterLoginPage() {
        return `
            <div class="login-page">
                <nav class="navbar">
                    <div class="nav-container">
                        <div class="logo" onclick="window.location.href='index.html'">
                            <img src="assets/logo.png" alt="VoteSecure Logo">
                            <h1>VoteSecure</h1>
                        </div>
                    </div>
                </nav>

                <div class="login-container">
                    <div class="login-box">
                        <div class="login-header">
                            <h2>Voter Login</h2>
                            <p>Please enter your credentials to proceed with voting</p>
                        </div>
                        <form id="voterLoginForm" class="login-form">
                            <div class="input-group">
                                <input type="text" id="aadharNo" required pattern="[0-9]{12}">
                                <label>Aadhaar Number</label>
                            </div>
                            <div class="input-group">
                                <input type="text" id="voterId" required>
                                <label>Voter ID</label>
                            </div>
                            <div class="input-group">
                                <input type="password" id="password" required>
                                <label>Password</label>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">Login to Vote</button>
                            <button type="button" class="btn btn-outline btn-block" onclick="window.location.href='index.html'">Back to Home</button>
                        </form>
                        <div class="login-footer">
                            <p>Having trouble logging in? <a href="#contact">Contact Support</a></p>
                            <p class="test-credentials">Test credentials: Aadhaar: 123456789012, Voter ID: ABC1234567, Password: voter123</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function getGovLoginPage() {
        return `
            <div class="login-page">
                <nav class="navbar">
                    <div class="nav-container">
                        <div class="logo" onclick="window.location.href='index.html'">
                            <img src="assets/logo.png" alt="VoteSecure Logo">
                            <h1>VoteSecure</h1>
                        </div>
                    </div>
                </nav>

                <div class="login-container">
                    <div class="login-box">
                        <div class="login-header">
                            <h2>Government Portal</h2>
                            <p>Authorized personnel only</p>
                        </div>
                        <form id="govLoginForm" class="login-form">
                            <div class="input-group">
                                <input type="text" id="govId" required>
                                <label>Government ID</label>
                            </div>
                            <div class="input-group">
                                <input type="password" id="govPassword" required>
                                <label>Password</label>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">Login</button>
                            <button type="button" class="btn btn-outline btn-block" onclick="window.location.href='index.html'">Back to Home</button>
                        </form>
                        <div class="login-footer">
                            <p>Forgot credentials? <a href="#contact">Contact Admin</a></p>
                            <p class="test-credentials">Test credentials: ID: admin123, Password: gov123</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Close modal
    window.closeModal = function() {
        modals.forEach(modal => modal.classList.add('hidden'));
    };

    // Handle voter login
    function handleVoterLogin(e) {
        e.preventDefault();
        const aadhar = document.getElementById('aadharNo').value;
        const voterId = document.getElementById('voterId').value;
        const password = document.getElementById('password').value;

        if (validateVoter(aadhar, voterId, password)) {
            sendOTP(aadhar);
        } else {
            showError('Invalid credentials or you have already voted');
        }
    }

    // Handle government login
    function handleGovLogin(e) {
        e.preventDefault();
        const govId = document.getElementById('govId').value;
        const password = document.getElementById('govPassword').value;

        if (validateGovUser(govId, password)) {
            showAdminDashboard();
        } else {
            showError('Invalid government credentials');
        }
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

    // Send OTP
    function sendOTP(aadhar) {
        const otp = Math.floor(100000 + Math.random() * 900000);
        // In a real application, this would send an actual SMS
        console.log(`OTP sent to ${voterDatabase[aadhar].mobile}: ${otp}`);
        
        showOTPModal(otp, aadhar);
    }

    // Show OTP modal
    function showOTPModal(otp, aadhar) {
        loginModal.classList.add('hidden');
        
        otpModal.querySelector('.modal-content').innerHTML = `
            <h2>OTP Verification</h2>
            <p>Enter the OTP sent to your registered mobile number</p>
            <form id="otpForm">
                <div class="input-group">
                    <input type="text" id="otpInput" required pattern="[0-9]{6}">
                    <label>Enter OTP</label>
                </div>
                <div class="button-group">
                    <button type="submit" class="btn btn-primary">Verify OTP</button>
                    <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                </div>
            </form>
        `;

        const form = document.getElementById('otpForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const enteredOTP = document.getElementById('otpInput').value;
            if (enteredOTP === String(otp)) {
                showVotingInterface();
            } else {
                showError('Invalid OTP');
            }
        });

        otpModal.classList.remove('hidden');
    }

    // Show voting interface
    function showVotingInterface() {
        closeModal();
        document.body.innerHTML = `
            <div class="voting-page">
                <nav class="navbar">
                    <div class="nav-container">
                        <div class="logo">
                            <img src="assets/logo.png" alt="VoteSecure Logo">
                            <h1>VoteSecure</h1>
                        </div>
                        <div class="user-info">
                            <span>Welcome, Voter</span>
                            <button class="btn btn-outline" onclick="handleLogout()">Logout</button>
                        </div>
                    </div>
                </nav>

                <main class="voting-main">
                    <div class="voting-container">
                        <h2>Cast Your Vote</h2>
                        <p class="voting-instruction">Select one party to cast your vote. This action cannot be undone.</p>
                        
                        <div class="party-grid">
                            <div class="party-card" data-party="bjp">
                                <img src="assets/party1.png" alt="BJP">
                                <h3>BJP</h3>
                                <p>Bharatiya Janata Party</p>
                                <div class="party-info">
                                    <p>Party Symbol: Lotus</p>
                                    <p>Candidate: Narendra Modi</p>
                                </div>
                                <button class="btn btn-primary vote-btn" onclick="confirmVote('bjp')">Vote for BJP</button>
                            </div>
                            <div class="party-card" data-party="congress">
                                <img src="assets/party2.png" alt="Congress">
                                <h3>Congress</h3>
                                <p>Indian National Congress</p>
                                <div class="party-info">
                                    <p>Party Symbol: Hand</p>
                                    <p>Candidate: Rahul Gandhi</p>
                                </div>
                                <button class="btn btn-primary vote-btn" onclick="confirmVote('congress')">Vote for Congress</button>
                            </div>
                            <div class="party-card" data-party="aap">
                                <img src="assets/party3.png" alt="AAP">
                                <h3>AAP</h3>
                                <p>Aam Aadmi Party</p>
                                <div class="party-info">
                                    <p>Party Symbol: Broom</p>
                                    <p>Candidate: Arvind Kejriwal</p>
                                </div>
                                <button class="btn btn-primary vote-btn" onclick="confirmVote('aap')">Vote for AAP</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    // Add confirmation before voting
    function confirmVote(party) {
        if (confirm(`Are you sure you want to vote for ${party.toUpperCase()}? This action cannot be undone.`)) {
            castVote(party);
        }
    }

    // Cast vote
    window.castVote = function(party) {
        const aadhar = document.getElementById('aadharNo').value;
        if (voterDatabase[aadhar]) {
            voterDatabase[aadhar].hasVoted = true;
            showSuccessMessage(party);
        }
    };

    // Show success message
    function showSuccessMessage(party) {
        document.body.innerHTML = `
            <div class="success-message">
                <h2>Thank You for Voting!</h2>
                <p>Your vote has been recorded successfully for ${party.toUpperCase()}.</p>
                <button class="btn btn-primary" onclick="window.location.reload()">Exit</button>
            </div>
        `;
    }

    // Show error message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // FAQ Toggle
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            faqItem.classList.toggle('active');
        });
    });

    // Contact Form
    document.getElementById('contactForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // Here you would typically send this to a server
        console.log('Contact form submission:', { name, email, message });
        
        showSuccess('Message sent successfully!');
        e.target.reset();
    });

    // Success Message
    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
    }

    // Smooth Scroll for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add active class to navigation links on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Add this to your existing DOMContentLoaded event listener
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Update the admin dashboard HTML generation
    function showAdminDashboard() {
        document.body.innerHTML = `
            <div class="admin-page">
                <nav class="navbar">
                    <div class="nav-container">
                        <div class="logo">
                            <img src="assets/logo.png" alt="VoteSecure Logo">
                            <h1>VoteSecure Admin</h1>
                        </div>
                        <button class="btn btn-outline" onclick="handleLogout()">Logout</button>
                    </div>
                </nav>

                <main class="admin-main">
                    <div class="admin-container">
                        <div class="admin-grid">
                            <div class="admin-card">
                                <h3><i class="fas fa-clock"></i> Session Control</h3>
                                <div class="session-status">
                                    <p>Current Status: <span class="status-badge ${isSessionActive ? 'active' : 'inactive'}">
                                        ${isSessionActive ? 'Session Active' : 'No Active Session'}
                                    </span></p>
                                    ${isSessionActive ? `
                                        <p>Session Started: ${currentSession?.startTime}</p>
                                    ` : ''}
                                </div>
                                <div class="session-controls">
                                    <button class="btn ${isSessionActive ? 'btn-disabled' : 'btn-primary'}" 
                                        onclick="handleSessionStart()" 
                                        ${isSessionActive ? 'disabled' : ''}>
                                        <i class="fas fa-play"></i> Start Session
                                    </button>
                                    <button class="btn ${!isSessionActive ? 'btn-disabled' : 'btn-danger'}" 
                                        onclick="handleSessionEnd()"
                                        ${!isSessionActive ? 'disabled' : ''}>
                                        <i class="fas fa-stop"></i> End Session
                                    </button>
                                </div>
                            </div>

                            <div class="admin-card">
                                <h3><i class="fas fa-chart-bar"></i> Voting Statistics</h3>
                                <div class="voting-stats">
                                    ${getVotingStats()}
                                </div>
                                ${isSessionActive ? '' : `
                                    <button class="btn btn-primary" onclick="downloadResults()">
                                        <i class="fas fa-download"></i> Download Results PDF
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    // Session control functions
    function handleSessionStart() {
        if (isSessionActive) {
            showError('A session is already active. Please end the current session first.');
            return;
        }

        if (confirm('Are you sure you want to start a new voting session?')) {
            isSessionActive = true;
            currentSession = {
                startTime: new Date().toLocaleString(),
                votes: []
            };
            showSuccess('Voting session started successfully');
            showAdminDashboard(); // Refresh the dashboard
        }
    }

    function handleSessionEnd() {
        if (!isSessionActive) {
            showError('No active session to end.');
            return;
        }

        if (confirm('Are you sure you want to end the current voting session?')) {
            isSessionActive = false;
            currentSession.endTime = new Date().toLocaleString();
            showSuccess('Voting session ended successfully');
            showAdminDashboard(); // Refresh the dashboard
        }
    }

    // PDF Generation function
    function downloadResults() {
        if (isSessionActive) {
            showError('Cannot download results while session is active');
            return;
        }

        // Create the PDF content
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add header
        doc.setFontSize(20);
        doc.text('Voting Results', 105, 20, { align: 'center' });
        
        // Add session details
        doc.setFontSize(12);
        doc.text(`Session Date: ${currentSession?.startTime}`, 20, 40);
        doc.text(`Session End: ${currentSession?.endTime}`, 20, 50);
        
        // Add voting statistics
        doc.text('Voting Statistics:', 20, 70);
        let yPos = 80;
        const stats = getVotingStatsData();
        
        stats.forEach(party => {
            doc.text(`${party.name}: ${party.votes} votes (${party.percentage}%)`, 30, yPos);
            yPos += 10;
        });
        
        // Add total votes
        doc.text(`Total Votes Cast: ${getTotalVotes()}`, 20, yPos + 10);
        
        // Add footer
        doc.setFontSize(10);
        doc.text('VoteSecure - Official Voting Results', 105, 280, { align: 'center' });
        
        // Save the PDF
        doc.save('voting-results.pdf');
    }

    // Helper functions for statistics
    function getVotingStats() {
        if (!currentSession) {
            return '<p class="no-stats">No voting data available</p>';
        }

        const stats = getVotingStatsData();
        return `
            <div class="total-votes">Total Votes: ${getTotalVotes()}</div>
            ${stats.map(party => `
                <div class="party-stat">
                    <div class="stat-header">
                        <span>${party.name}</span>
                        <span>${party.votes} votes (${party.percentage}%)</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${party.percentage}%">
                            <div class="progress-glow"></div>
                        </div>
                    </div>
                </div>
            `).join('')}
        `;
    }

    function getVotingStatsData() {
        // Simulate voting data - replace with actual data in production
        return [
            { name: 'BJP', votes: 150, percentage: 45 },
            { name: 'Congress', votes: 100, percentage: 30 },
            { name: 'AAP', votes: 83, percentage: 25 }
        ];
    }

    function getTotalVotes() {
        return getVotingStatsData().reduce((total, party) => total + party.votes, 0);
    }
});
