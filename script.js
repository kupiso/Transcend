// Global variables
let episodeProgress = {};
let quizScore = null;
let isSidebarOpen = false; // Initial state should be false (hidden)
let currentEpisode = 1;

// Initialize application
document.addEventListener("DOMContentLoaded", function () {
  loadProgress();
  setupVideoListeners();
  setupSidebarToggle();
  updateEpisodeStatus();
  checkCertificationAccess();
  // Removed setupMobileSidebarToggle(); as it's no longer needed
});

// Load progress from localStorage
function loadProgress() {
  const saved = localStorage.getItem("vuyoProgress");
  if (saved) {
    const data = JSON.parse(saved);
    episodeProgress = data.episodeProgress || {};
    quizScore = data.quizScore || null;
  }
}

// Save progress to localStorage
function saveProgress() {
  const data = {
    episodeProgress: episodeProgress,
    quizScore: quizScore,
  };
  localStorage.setItem("vuyoProgress", JSON.stringify(data));
}

// Setup video event listeners
function setupVideoListeners() {
  for (let i = 1; i <= 6; i++) {
    const video = document.getElementById(`video-${i}`);
    if (video) {
      // Track when video ends
      video.addEventListener("ended", function () {
        markEpisodeComplete(i);
      });

      // Track significant progress (80% watched)
      video.addEventListener("timeupdate", function () {
        if (video.duration > 0) {
          const progress = video.currentTime / video.duration;
          if (progress >= 0.8 && !episodeProgress[i]) {
            markEpisodeComplete(i);
          }
        }
      });

      // Handle video errors gracefully
      video.addEventListener("error", function () {
        console.log(
          `Video ${i} not available yet - placeholder ready for upload`
        );
      });
    }
  }
}

// Setup sidebar toggle functionality
function setupSidebarToggle() {
  const toggleBtn = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("sidebar");

  // The sidebar's initial state is already hidden by CSS transform: translateX(-280px);
  // So, we just need to ensure our JS variable reflects this.
  // isSidebarOpen is already initialized to false globally.

  toggleBtn.addEventListener("click", function () {
    isSidebarOpen = !isSidebarOpen;

    if (isSidebarOpen) {
      sidebar.classList.add("show");
    } else {
      sidebar.classList.remove("show");
    }
  });

  // Close sidebar when clicking outside
  document.addEventListener("click", function (e) {
    if (isSidebarOpen) {
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove("show");
        isSidebarOpen = false;
      }
    }
  });
}

// Removed setupMobileSidebarToggle() and updateMobileSidebarToggle()
// as the main setupSidebarToggle handles all screen sizes.

// Mark episode as complete
function markEpisodeComplete(episodeNumber) {
  episodeProgress[episodeNumber] = true;
  updateEpisodeStatus();
  saveProgress();

  // Show completion notification
  showNotification(`Episode ${episodeNumber} completed! ✅`, "success");
}

// Update episode status indicators
function updateEpisodeStatus() {
  for (let i = 1; i <= 6; i++) {
    const statusElement = document.getElementById(`status-${i}`);
    if (statusElement) {
      statusElement.textContent = episodeProgress[i] ? "✅" : "⚪";
      statusElement.style.color = episodeProgress[i] ? "#27AE60" : "#6C757D";
    }
  }
}

// Show/hide sections
function showSection(sectionName) {
  // Special handling for certification section - check access first
  if (sectionName === "certification") {
    // Load current quiz score from localStorage
    const saved = localStorage.getItem("vuyoProgress");
    let currentQuizScore = null;
    if (saved) {
      const data = JSON.parse(saved);
      currentQuizScore = data.quizScore || null;
    }

    if (currentQuizScore === null || currentQuizScore < 70) {
      showNotification(
        "You need to pass the quiz with at least 70% to access the certificate.",
        "warning"
      );
      return; // Don't proceed to show the section
    }
  }

  // Hide all sections
  const sections = document.querySelectorAll(".content-section");
  sections.forEach((section) => section.classList.remove("active"));

  // Show target section
  const targetSection = document.getElementById(sectionName);
  if (targetSection) {
    targetSection.classList.add("active");
  }

  // Update navigation
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => link.classList.remove("active"));

  const activeLink = document.querySelector(
    `[onclick="showSection('${sectionName}')"]`
  );
  if (activeLink) {
    activeLink.classList.add("active");
  }

  // Close sidebar when navigating
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("show");
  isSidebarOpen = false;

  // Special handling for certification section
  if (sectionName === "certification") {
    checkCertificationAccess();
  }
}

// Show resource detail section
function showResourceDetail(resourceType) {
  if (resourceType === "episodes") {
    showSection("episodes-list");
  } else {
    showSection(`resource-${resourceType}`);
  }
}

// Episode data array
const episodeData = [
  {
    title: "Episode 1: New Beginnings",
    description: "Starting fresh with hope and dreams.",
    video: "videos/Vuyo - Trim1.mp4",
    subtitles: "subtitles/episode1.vtt",
  },
  {
    title: "Episode 2: First Challenges",
    description: "Facing the unexpected hurdles.",
    video: "videos/Vuyo - Trim2.mp4",
    subtitles: "subtitles/episode2.vtt",
  },
  {
    title: "Episode 3: Difficult Choices",
    description: "When life forces hard decisions.",
    video: "videos/Vuyo - Trim3.mp4",
    subtitles: "subtitles/episode3.vtt",
  },
  {
    title: "Episode 4: Family Responsibilities",
    description: "Choosing between dreams and reality.",
    video: "videos/Vuyo - Trim4.mp4",
    subtitles: "subtitles/episode4.vtt",
  },
  {
    title: "Episode 5: Making Tough Decisions",
    description: "Learning from the pain of loss.",
    video: "videos/Vuyo - Trim5.mp4",
    subtitles: "subtitles/episode5.vtt",
  },
  {
    title: "Episode 6: Growth and Wisdom",
    description: "Finding strength and moving forward.",
    video: "videos/Vuyo - Trim6.mp4",
    subtitles: "subtitles/episode6.vtt",
  },
];

// Open video player modal
function openVideoPlayer(episodeNumber) {
  currentEpisode = episodeNumber;
  const modal = document.getElementById("videoModal");
  const video = document.getElementById("modalVideo");
  const videoSource = document.getElementById("videoSource");
  const videoSubtitles = document.getElementById("videoSubtitles");
  const videoTitle = document.getElementById("videoTitle");
  const episodeDescription = document.getElementById("episodeDescription");
  const prevBtn = document.getElementById("prevEpisodeBtn");
  const nextBtn = document.getElementById("nextEpisodeBtn");

  const episode = episodeData[episodeNumber - 1];

  // Set video content
  videoSource.src = episode.video;
  videoSubtitles.src = episode.subtitles;
  videoTitle.textContent = episode.title;
  episodeDescription.textContent = episode.description;

  // Update navigation buttons
  prevBtn.style.display = episodeNumber === 1 ? "none" : "inline-flex";
  nextBtn.style.display = episodeNumber === 6 ? "none" : "inline-flex";

  // Load and show modal
  video.load();
  modal.style.display = "flex";

  // Setup video event listeners for this instance
  setupModalVideoListeners(video, episodeNumber);
}

// Close video player modal
function closeVideoPlayer() {
  const modal = document.getElementById("videoModal");
  const video = document.getElementById("modalVideo");

  video.pause();
  modal.style.display = "none";
}

// Go to previous episode
function goToPreviousEpisode() {
  if (currentEpisode > 1) {
    openVideoPlayer(currentEpisode - 1);
  }
}

// Go to next episode
function goToNextEpisode() {
  if (currentEpisode < 6) {
    openVideoPlayer(currentEpisode + 1);
  }
}

// Setup video listeners for modal video
function setupModalVideoListeners(video, episodeNumber) {
  // Remove existing listeners
  video.removeEventListener("ended", video._endedHandler);
  video.removeEventListener("timeupdate", video._timeupdateHandler);

  // Track when video ends
  video._endedHandler = function () {
    markEpisodeComplete(episodeNumber);
  };
  video.addEventListener("ended", video._endedHandler);

  // Track significant progress (80% watched)
  video._timeupdateHandler = function () {
    if (video.duration > 0) {
      const progress = video.currentTime / video.duration;
      if (progress >= 0.8 && !episodeProgress[episodeNumber]) {
        markEpisodeComplete(episodeNumber);
      }
    }
  };
  video.addEventListener("timeupdate", video._timeupdateHandler);

  // Handle video errors gracefully
  video.addEventListener("error", function () {
    console.log(
      `Video ${episodeNumber} not available yet - placeholder ready for upload`
    );
  });
}

// Quiz functionality
function submitQuiz() {
  const questions = document.querySelectorAll(".question");
  let correctAnswers = 0;
  let totalQuestions = questions.length;
  let allAnswered = true;

  // Correct answers
  const answers = {
    q1: "b",
    q2: "b",
    q3: "b",
    q4: "b",
    q5: "b",
  };

  // Check each question
  questions.forEach((question, index) => {
    const questionNum = `q${index + 1}`;
    const selectedOption = document.querySelector(
      `input[name="${questionNum}"]:checked`
    );

    if (!selectedOption) {
      allAnswered = false;
      return;
    }

    if (selectedOption.value === answers[questionNum]) {
      correctAnswers++;
    }
  });

  if (!allAnswered) {
    showNotification(
      "Please answer all questions before submitting.",
      "warning"
    );
    return;
  }

  // Calculate score
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  quizScore = score;
  saveProgress();

  // Show results
  const resultsDiv = document.getElementById("quiz-results");
  const scoreDisplay = document.getElementById("score-display");
  const quizActions = document.querySelector(".quiz-actions");

  scoreDisplay.textContent = `You scored ${score}% out of 100%`;
  resultsDiv.style.display = "block";

  // Update quiz actions based on score
  if (score >= 70) {
    // Passed - show Get Certificate and Exit options
    quizActions.innerHTML = `
                <button onclick="showSection('certification')" class="cert-btn">Get Certificate</button>
                <button onclick="showSection('about')" class="exit-btn">Exit</button>
            `;
    showNotification(
      "Congratulations! You passed the quiz and can now access your certificate!",
      "success"
    );
  } else {
    // Failed - show Try Again and Exit options
    quizActions.innerHTML = `
                <button onclick="retryQuiz()" class="retry-btn">Try Again</button>
                <button onclick="showSection('about')" class="exit-btn">Exit</button>
            `;
    showNotification(
      "You need to score at least 70% to access the certificate. Try again!",
      "warning"
    );
  }

  // Scroll to results
  resultsDiv.scrollIntoView({ behavior: "smooth" });

  // Update certification access
  checkCertificationAccess();
}

// Retry quiz
function retryQuiz() {
  // Reset all radio buttons
  const radioButtons = document.querySelectorAll('input[type="radio"]');
  radioButtons.forEach((radio) => (radio.checked = false));

  // Hide results
  const resultsDiv = document.getElementById("quiz-results");
  resultsDiv.style.display = "none";

  // Scroll to top of quiz
  const quizContainer = document.querySelector(".quiz-container");
  quizContainer.scrollIntoView({ behavior: "smooth" });
}

// Check certification access
function checkCertificationAccess() {
  const certLocked = document.getElementById("cert-locked");
  const certAvailable = document.getElementById("cert-available");

  if (quizScore !== null && quizScore >= 70) {
    certLocked.style.display = "none";
    certAvailable.style.display = "block";
  } else {
    certLocked.style.display = "block";
    certAvailable.style.display = "none";
  }
}

// Generate certificate
function generateCertificate() {
  const userName = document.getElementById("userName").value.trim();

  if (!userName) {
    showNotification(
      "Please enter your name to generate the certificate.",
      "warning"
    );
    return;
  }

  if (userName.length < 2) {
    showNotification(
      "Please enter a valid name (at least 2 characters).",
      "warning"
    );
    return;
  }

  // Generate certificate using canvas
  const canvas = document.getElementById("certificateCanvas");
  const ctx = canvas.getContext("2d");

  // Set canvas size
  canvas.width = 800;
  canvas.height = 600;

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#F5F7FA");
  gradient.addColorStop(1, "#FFFFFF");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw border
  ctx.strokeStyle = "#1B4F9A";
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Draw inner border
  ctx.strokeStyle = "#27AE60";
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  // Title
  ctx.fillStyle = "#1B4F9A";
  ctx.font = "bold 36px Arial";
  ctx.textAlign = "center";
  ctx.fillText("CERTIFICATE OF COMPLETION", canvas.width / 2, 120);

  // Subtitle
  ctx.fillStyle = "#E67E22";
  ctx.font = "bold 24px Arial";
  ctx.fillText("Learnership Life Course", canvas.width / 2, 160);

  // This certifies that
  ctx.fillStyle = "#6C757D";
  ctx.font = "18px Arial";
  ctx.fillText("This certifies that", canvas.width / 2, 220);

  // User name
  ctx.fillStyle = "#1A1B23";
  ctx.font = "bold 32px Arial";
  ctx.fillText(userName, canvas.width / 2, 280);

  // Achievement text
  ctx.fillStyle = "#6C757D";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  const achievementText =
    "has successfully completed the Vuyo Mphakwana: Learnership Life course";
  ctx.fillText(achievementText, canvas.width / 2, 330);
  ctx.fillText(
    "and demonstrated understanding of real-life learnership challenges",
    canvas.width / 2,
    355
  );
  ctx.fillText("with a score of " + quizScore + "%", canvas.width / 2, 380);

  // Date
  ctx.fillStyle = "#1B4F9A";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "left";
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  ctx.fillText("Date: " + currentDate, 80, 480);

  // Provider
  ctx.textAlign = "right";
  ctx.fillText("Training Provider: Transcend", canvas.width - 80, 480);

  // Signature line
  ctx.strokeStyle = "#6C757D";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(canvas.width - 250, 520);
  ctx.lineTo(canvas.width - 80, 520);
  ctx.stroke();

  ctx.fillStyle = "#6C757D";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Authorized Signature", canvas.width - 165, 540);

  // Download certificate
  const link = document.createElement("a");
  link.download = `${userName.replace(
    /\s+/g,
    "_"
  )}_Learnership_Certificate.png`;
  link.href = canvas.toDataURL();
  link.click();

  showNotification(
    "Certificate generated and downloaded successfully!",
    "success"
  );
}

// Show notification
function showNotification(message, type = "error") {
  const notification = document.getElementById("notification");
  const notificationText = document.getElementById("notification-text");

  notificationText.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = "flex";

  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideNotification();
  }, 5000);
}

// Hide notification
function hideNotification() {
  const notification = document.getElementById("notification");
  notification.style.display = "none";
}

// Keyboard navigation support
document.addEventListener("keydown", function (e) {
  // Escape key closes sidebar on mobile
  if (e.key === "Escape" && window.innerWidth <= 1024) {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.remove("show");
    isSidebarOpen = false;
  }

  // Enter key on quiz submit
  if (
    e.key === "Enter" &&
    document.getElementById("quiz").classList.contains("active")
  ) {
    const submitBtn = document.querySelector(".submit-btn");
    if (
      submitBtn &&
      document.getElementById("quiz-results").style.display === "none"
    ) {
      submitQuiz();
    }
  }

  // Enter key on certificate generation
  if (
    e.key === "Enter" &&
    document.getElementById("certification").classList.contains("active")
  ) {
    const userNameInput = document.getElementById("userName");
    if (document.activeElement === userNameInput) {
      generateCertificate();
    }
  }
});

// Handle video loading errors gracefully
window.addEventListener(
  "error",
  function (e) {
    if (e.target.tagName === "VIDEO") {
      console.log(
        "Video placeholder ready - real video can be uploaded to replace placeholder"
      );
    }
  },
  true
);

// Accessibility improvements
document.addEventListener("focusin", function (e) {
  if (e.target.classList.contains("nav-link")) {
    e.target.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});

// Progress tracking analytics (could be extended)
function trackProgress() {
  const completedEpisodes = Object.keys(episodeProgress).length;
  const totalEpisodes = 6;
  const progressPercentage = Math.round(
    (completedEpisodes / totalEpisodes) * 100
  );

  console.log(
    `Learning Progress: ${progressPercentage}% (${completedEpisodes}/${totalEpisodes} episodes completed)`
  );

  return {
    completedEpisodes,
    totalEpisodes,
    progressPercentage,
    quizScore,
  };
}

// Export progress (for potential future features)
function exportProgress() {
  const progress = trackProgress();
  const exportData = {
    timestamp: new Date().toISOString(),
    progress,
    episodeProgress,
    quizScore,
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(dataBlob);
  link.download = "vuyo_learning_progress.json";
  link.click();
}
