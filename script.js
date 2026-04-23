
const urlInput = document.getElementById('urlInput');
const scanBtn = document.getElementById('scanBtn');
const clearBtn = document.getElementById('clearBtn');
const resultPanel = document.getElementById('resultPanel');
const statusIndicator = document.getElementById('statusIndicator');
const statusLabel = document.getElementById('statusLabel');
const statusDetails = document.getElementById('statusDetails');
const inputContainer = document.getElementById('inputContainer');
const aiText = document.getElementById('aiText');
const radarStatus = document.getElementById('radarStatus');
const particlesContainer = document.getElementById('particlesContainer');
const scanningAnimation = document.getElementById('scanningAnimation');


function generateParticles() {
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const randomX = Math.random() * window.innerWidth;
        const randomY = Math.random() * window.innerHeight;
        const randomDuration = 10 + Math.random() * 20;
        
        particle.style.left = randomX + 'px';
        particle.style.top = randomY + 'px';
        particle.style.animationDuration = randomDuration + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        particlesContainer.appendChild(particle);
    }
}


function typeAIText(text, speed = 50) {
    aiText.textContent = '';
    aiText.classList.add('typing');
    let index = 0;

    function type() {
        if (index < text.length) {
            aiText.textContent += text.charAt(index);
            index++;
            setTimeout(type, speed);
        } else {
            aiText.classList.remove('typing');
        }
    }

    type();
}


function playSound(frequency = 800, duration = 200) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
        console.log('Audio context not available');
    }
}

const phishingPatterns = {
    suspicious: [
        /bit\.ly|tinyurl|shortened|goo\.gl|ow\.ly/i,
        /login|signin|account|verify|confirm|update|secure|confirm-payment/i,
        /admin|panel|control|dashboard|back-office/i,
        /%20|%2f|%3f|\.\./,
        /iframe|script|onclick|onload/i,
    ],
    dangerous: [
        /paypal\.com\.security|amazon\.verification|apple-id-account/i,
        /bank.*login|credit.*card|social.*security/i,
        /(bit\.ly|tinyurl).*amazon|(bit\.ly|tinyurl).*apple|(bit\.ly|tinyurl).*bank/i,
        /0x[0-9a-f]+/i,
        /eval|exec|system|cmd/i,
    ]
};

function analyzeLink(url) {
    let riskLevel = 'safe';
    let reasons = [];

    
    phishingPatterns.suspicious.forEach(pattern => {
        if (pattern.test(url)) {
            riskLevel = 'suspicious';
            reasons.push('Suspicious URL pattern detected');
        }
    });

    
    phishingPatterns.dangerous.forEach(pattern => {
        if (pattern.test(url)) {
            riskLevel = 'dangerous';
            reasons.push('Critical threat signature detected');
        }
    });

    
    if (/(\d{1,3}\.){3}\d{1,3}/.test(url)) {
        riskLevel = riskLevel === 'dangerous' ? 'dangerous' : 'suspicious';
        reasons.push('Direct IP address detected (unusual for legitimate sites)');
    }

    
    if (!url.startsWith('https://')) {
        if (riskLevel === 'safe') riskLevel = 'suspicious';
        reasons.push('No HTTPS encryption detected');
    }

    if (reasons.length === 0) {
        reasons.push('No known phishing indicators detected');
        reasons.push('URL structure appears legitimate');
    }

    return { riskLevel, reasons };
}
function displayResult(riskLevel, reasons) {
    resultPanel.classList.add('show');
    scanningAnimation.classList.remove('active');

    
    statusIndicator.className = 'status-indicator';
    statusIndicator.classList.add(riskLevel);
    const icons = {
        safe: '✓',
        suspicious: '⚠',
        dangerous: '✕'
    };

    const labels = {
        safe: 'SAFE',
        suspicious: 'SUSPICIOUS',
        dangerous: 'DANGEROUS'
    };

    statusIndicator.textContent = icons[riskLevel];
    statusLabel.className = 'status-label';
    statusLabel.classList.add(riskLevel);
    statusLabel.textContent = labels[riskLevel];
    statusDetails.innerHTML = '';
    reasons.forEach(reason => {
        const detailItem = document.createElement('div');
        detailItem.className = 'detail-item';
        detailItem.innerHTML = `<div class="detail-label">→</div><div>${reason}</div>`;
        statusDetails.appendChild(detailItem);
    });
    radarStatus.textContent = `STATUS: ${labels[riskLevel]}`;
    const soundFreq = {
        safe: 1000,
        suspicious: 600,
        dangerous: 300
    };
    playSound(soundFreq[riskLevel], 300);
    clearBtn.classList.add('show');
}
scanBtn.addEventListener('click', async () => {
    const input = urlInput.value.trim();

    if (!input) {
        typeAIText('Please enter a link to analyze...');
        return;
    }
    resultPanel.classList.remove('show');
    scanBtn.classList.add('scanning');
    scanningAnimation.classList.add('active');
    inputContainer.classList.add('active');
    typeAIText('Analyzing link');
    setTimeout(() => {
        typeAIText('Scanning databases');
    }, 500);

    setTimeout(() => {
        typeAIText('Threat assessment in progress');
    }, 1000);
    setTimeout(() => {
        const result = analyzeLink(input);
        const statusMessages = {
            safe: 'No threats detected',
            suspicious: 'Low-level threats detected',
            dangerous: 'Critical threats detected'
        };

        typeAIText(statusMessages[result.riskLevel]);
        setTimeout(() => {
            displayResult(result.riskLevel, result.reasons);
            scanBtn.classList.remove('scanning');
        }, 500);
    }, 2000);
});
urlInput.addEventListener('focus', () => {
    inputContainer.classList.add('active');
    typeAIText('Ready to analyze...');
});

urlInput.addEventListener('blur', () => {
    if (!urlInput.value) {
        inputContainer.classList.remove('active');
        aiText.textContent = '';
    }
});
clearBtn.addEventListener('click', () => {
    urlInput.value = '';
    aiText.textContent = '';
    resultPanel.classList.remove('show');
    inputContainer.classList.remove('active');
    clearBtn.classList.remove('show');
    radarStatus.textContent = 'SYSTEM READY';
    scanBtn.classList.remove('scanning');
    scanningAnimation.classList.remove('active');
    urlInput.focus();
});
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        scanBtn.click();
    }
});
window.addEventListener('load', () => {
    generateParticles();
    typeAIText('System initialized. Ready to analyze.');
    urlInput.focus();
});
window.addEventListener('resize', () => {
});
