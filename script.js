"use strict";

// Define the default title
let scoreboardTitleText = "Real Time Scores";

// --- Timer Class ---
class Timer {
    constructor(minutes, seconds, hundredths, timerLabel) {
        this.minutes = minutes;
        this.seconds = seconds;
        this.hundredths = hundredths;
        this.timerLabel = timerLabel;
        this.isRunning = false;
        this.timerInterval = null;
        this.initialMinutes = minutes;
    }

    formatTime() {
        return String(this.minutes).padStart(2, '0') + ":" +
               String(this.seconds).padStart(2, '0') + "." +
               String(this.hundredths).padStart(2, '0');
    }

    updateTimerLabel = () => {
        this.timerLabel.textContent = this.formatTime();
        if (this.minutes < 2) {
            this.timerLabel.classList.add("low-time");
        } else {
            this.timerLabel.classList.remove("low-time");
        }
    }

    startTimer = () => {
        if (this.isRunning) return;
        this.isRunning = true;

        this.timerInterval = setInterval(() => {
            try {
                if (this.hundredths > 0) {
                    this.hundredths--;
                } else if (this.seconds > 0) {
                    this.seconds--;
                    this.hundredths = 99;
                } else if (this.minutes > 0) {
                    this.minutes--;
                    this.seconds = 59;
                    this.hundredths = 99;
                } else {
                    // Timer reached 0 - stop, flash, and play buzzer
                    this.stopTimer();
                    startFlashing(10); // Flash 10 times
                    playBuzzer(); // Play the buzzer sound
                    return;
                }
                this.updateTimerLabel();
            } catch (error) {
                console.error("Error in timer interval:", error);
                this.stopTimer();
            }
        }, 10);
    };

    stopTimer = () => {
        clearInterval(this.timerInterval);
        this.isRunning = false;
    };

    increaseMinutes = () => {
        this.stopTimer();
        if (this.minutes < this.initialMinutes) {
            this.minutes++;
        }
        this.hundredths = 0; // Reset hundredths on manual adjust
        this.updateTimerLabel();
    };

    decreaseMinutes = () => {
        this.stopTimer();
        if (this.minutes > 0) {
            this.minutes--;
        }
        this.hundredths = 0; // Reset hundredths on manual adjust
        this.updateTimerLabel();
    };

    increaseSeconds = () => {
        this.stopTimer();
        if (this.seconds < 59) {
            this.seconds++;
        } else {
            this.seconds = 0;
            if (this.minutes < this.initialMinutes) {
                //increment minute only if it is not at max
                this.minutes++;
            }
        }
        this.hundredths = 0; // Reset hundredths on manual adjust
        this.updateTimerLabel();
    };

    decreaseSeconds = () => {
        this.stopTimer();
        if (this.seconds > 0) {
            this.seconds--;
        } else {
            this.seconds = 59;
        }
        this.hundredths = 0; // Reset hundredths on manual adjust
        this.updateTimerLabel();
    }

    reset() {
        this.stopTimer();
        stopFlashing();
        this.minutes = this.initialMinutes; // Reset to initialMinutes
        this.seconds = 0;
        this.hundredths = 0;
        this.updateTimerLabel();
    }
}

// --- Scoreboard Logic ---
function updateScore(teamNumber, change) {
    const teamScoreElement = document.getElementById(`team${teamNumber}Score`);
    let score = parseInt(teamScoreElement.textContent, 10) + change;
    score = Math.max(0, score);
    teamScoreElement.textContent = score;
}

// --- Flashing Logic ---
let flashInterval;
let flashCount = 0;

function startFlashing(numFlashes) {
    const container = document.querySelector('.container');
    flashCount = 0;
    flashInterval = setInterval(() => {
        container.classList.toggle("flashing");
        flashCount++;

        if (flashCount >= numFlashes * 2) {
            stopFlashing();
            timer.timerLabel.classList.remove("low-time");
        }
    }, 250);
}

function stopFlashing() {
    const container = document.querySelector('.container');
    clearInterval(flashInterval);
    container.classList.remove("flashing");
    flashCount = 0;
}

// --- Buzzer Sound ---
function playBuzzer() {
    const buzzer = document.getElementById("buzzer");
    buzzer.play();
}

function resetScores() {
    document.getElementById("team1Score").textContent = "0";
    document.getElementById("team2Score").textContent = "0";
}

function resetTeamNames() {
    document.getElementById("team1Name").value = "Team 1";
    document.getElementById("team2Name").value = "Team 2";
}

// --- Reset All ---
function resetAll() {
    timer.reset();
    resetScores();
    resetTeamNames();
    toggleButton.innerHTML = `<img src="play-button.svg" alt="Start">`;
    toggleButton.classList.remove("running");
    toggleButton.style.color = 'var(--primary-color)';
    toggleButton.dataset.running = "false";
    stopFlashing();
}

// --- Initialization ---
const timerLabel = document.getElementById("timerLabel");
const timer = new Timer(24, 0, 0, timerLabel);
const scoreboardTitle = document.getElementById("scoreboardTitle");
scoreboardTitle.textContent = scoreboardTitleText;
const toggleButton = document.getElementById("toggleButton");
const resetButton = document.getElementById("resetButton");

// --- Event Listeners ---

// Toggle Button
toggleButton.addEventListener("click", () => {
    if (timer.isRunning) {
        timer.stopTimer();
        stopFlashing();
        toggleButton.innerHTML = `<img src="play-button.svg" alt="Start">`;
        toggleButton.classList.remove("running");
        //Crucial: Set color to primary color for the play button
        toggleButton.style.color = 'var(--primary-color)';
        toggleButton.dataset.running = "false";
    } else {
        timer.startTimer();
        toggleButton.innerHTML = `<img src="pause-button.svg" alt="Stop">`;
        toggleButton.classList.add("running");
        //Crucial: Set to the complementary color
        toggleButton.style.color = 'var(--complementary-color)';
        toggleButton.dataset.running = "true";
    }
});

// Timer Control Buttons
const timerButtons = document.querySelectorAll('.timer-controls button');
timerButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        toggleButton.innerHTML = `<img src="play-button.svg" alt="Start">`;
        toggleButton.classList.remove("running");
        toggleButton.style.color = 'var(--primary-color)';
        toggleButton.dataset.running = "false";

        if (button.id === 'increaseMinutesButton') timer.increaseMinutes();
        else if (button.id === 'decreaseMinutesButton') timer.decreaseMinutes();
        else if (button.id === 'increaseSecondsButton') timer.increaseSeconds();
        else if (button.id === 'decreaseSecondsButton') timer.decreaseSeconds();
    });
});

// Score Buttons
const increaseTeam1Button = document.getElementById("increaseTeam1Button");
const decreaseTeam1Button = document.getElementById("decreaseTeam1Button");
const increaseTeam2Button = document.getElementById("increaseTeam2Button");
const decreaseTeam2Button = document.getElementById("decreaseTeam2Button");

increaseTeam1Button.addEventListener("click", (event) => {
    event.preventDefault();
    updateScore(1, 1);
});
decreaseTeam1Button.addEventListener("click", (event) => {
    event.preventDefault();
    updateScore(1, -1);
});
increaseTeam2Button.addEventListener("click", (event) => {
    event.preventDefault();
    updateScore(2, 1);
});
decreaseTeam2Button.addEventListener("click", (event) => {
    event.preventDefault();
    updateScore(2, -1);
});

// Reset Button
resetButton.addEventListener("click", resetAll);

// --- Color Palette Logic ---

// Get the color palette options
const colorOptions = document.querySelectorAll(".color-option");

// Add click event listener to each color option
colorOptions.forEach(option => {
    option.addEventListener("click", (event) => {
    // Get the color from the data-color attribute
    const selectedColor = event.target.dataset.color;

    // Set the --primary-color CSS variable
    document.documentElement.style.setProperty('--primary-color', selectedColor);
    // Calculate and set the complementary color
    setComplementaryColor(selectedColor);
    });
});

// --- Helper Functions ---

// Function to calculate complementary color
function getComplementaryColor(hexColor) {
    // Remove '#' if present
    hexColor = hexColor.replace("#", "");

    // Parse hex color to RGB
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);

    // Invert RGB values
    const complementaryR = 255 - r;
    const complementaryG = 255 - g;
    const complementaryB = 255 - b;

    // Convert back to hex
    const complementaryHex = ((1 << 24) + (complementaryR << 16) + (complementaryG << 8) + complementaryB).toString(16).slice(1);

    return `#${complementaryHex}`;
}

// Function to set the complementary color
function setComplementaryColor(baseColor) {
    const complementaryColor = getComplementaryColor(baseColor);
    document.documentElement.style.setProperty('--complementary-color', complementaryColor);
  }

// --- Initial Setup (CORRECTED) ---
document.addEventListener('DOMContentLoaded', () => {
    // Set initial colors for the color palette options
    const colorOptions = document.querySelectorAll(".color-option");
    colorOptions.forEach(option => {
        option.style.backgroundColor = option.dataset.color;
    });

    // Initial call to set complementary color based on the default primary color
    setComplementaryColor(getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim());
    //set correct button color on load
    toggleButton.style.color = "var(--primary-color)";
    timer.updateTimerLabel();
});