<template>
  <div class="quiz-player-page">
    <div v-if="loading" class="flex-center py-5 min-vh-70">
      <div class="spinner-sm"></div>
      <span class="ml-3 text-muted-color">Preparing your quiz session...</span>
    </div>

    <div v-else-if="quiz && questions.length" class="quiz-player-container">
      <!-- Player Top Bar -->
      <div class="player-top-bar">
        <div class="quiz-info-group">
          <div class="quiz-title-row">
            <h2>{{ quiz.quiz_name }}</h2>
            <div class="badge-pill-group">
              <span class="badge-pill violet">{{ quiz.subject_name }}</span>
              <span class="badge-pill neutral">{{ quiz.chapter_name }}</span>
            </div>
          </div>
        </div>

        <div class="timer-chip" :class="{ 'warning-pulse': timeLeft < 60 }">
          <Clock size="16" :class="timeLeft < 60 ? 'text-danger-color' : 'text-primary-color'" />
          <span class="timer-countdown">{{ formattedTime }}</span>
        </div>
      </div>

      <!-- Question Stepper Dots -->
      <div class="stepper-card">
        <div class="stepper-info">
          <span class="step-label">Question {{ currentIndex + 1 }} of {{ questions.length }}</span>
          <span class="answered-count">{{ answeredCount }} of {{ questions.length }} Answered</span>
        </div>
        <div class="stepper-dots-grid">
          <button 
            v-for="(q, idx) in questions" 
            :key="q.id"
            class="stepper-dot"
            :class="{
              'active': currentIndex === idx,
              'answered': userAnswers[idx] !== null,
              'unanswered': userAnswers[idx] === null
            }"
            @click="jumpToQuestion(idx)"
          >
            {{ idx + 1 }}
          </button>
        </div>
      </div>

      <!-- Question Board -->
      <div class="question-board-card">
        <div class="q-number-badge">
          <span>Q{{ currentIndex + 1 }}</span>
        </div>

        <h3 class="q-statement">{{ currentQuestion.question_statement }}</h3>

        <div class="options-container">
          <div 
            v-for="n in 4" 
            :key="n"
            class="option-card"
            :class="{ 'selected': userAnswers[currentIndex] === n }"
            @click="selectOption(n)"
          >
            <div class="option-key-badge">
              {{ String.fromCharCode(64 + n) }}
            </div>
            <div class="option-content">
              {{ currentQuestion['option' + n] }}
            </div>
            <div class="option-radio-circle">
              <div v-if="userAnswers[currentIndex] === n" class="radio-inner-dot"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Controls Dock -->
      <div class="player-controls-dock">
        <div class="nav-btn-group">
          <button 
            class="btn-secondary-clean" 
            @click="prevQuestion" 
            :disabled="currentIndex === 0 || submitted"
          >
            <ArrowLeft size="16" /> Previous
          </button>

          <button 
            class="btn-secondary-clean" 
            @click="nextQuestion" 
            :disabled="currentIndex === questions.length - 1 || submitted"
          >
            Next <ArrowRight size="16" />
          </button>
        </div>

        <div class="action-btn-group">
          <button class="btn-danger-clean" @click="exitQuiz" :disabled="submitted">
            <LogOut size="16" /> Exit
          </button>
          <button class="btn-primary-clean" @click="submitQuiz" :disabled="submitted">
            <CheckCircle size="16" /> Submit Assessment
          </button>
        </div>
      </div>

      <!-- Score Modal -->
      <div class="modal-overlay-clean" v-if="showResultModal">
        <div class="modal-content-clean result-dialog text-center">
          <div class="result-header">
            <div class="trophy-badge">
              <Trophy size="36" class="text-warning-color" />
            </div>
            <h2>Quiz Completed!</h2>
            <p class="text-muted-color">Your answers have been recorded successfully.</p>
          </div>

          <div class="score-summary-box">
            <div class="score-circle">
              <span class="score-number">{{ score }}</span>
              <span class="score-divider">/ {{ questions.length }}</span>
            </div>
            <div class="accuracy-pill">
              Accuracy: {{ ((score / questions.length) * 100).toFixed(0) }}%
            </div>
          </div>

          <div class="result-footer">
            <button class="btn-primary-clean w-100" @click="closeModal">
              Return to Dashboard <ArrowRight size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="empty-state-clean max-w-600 mx-auto mt-5">
      <AlertCircle size="36" class="text-danger-color mb-3" />
      <h3>Unable to load quiz</h3>
      <p class="text-muted-color">The selected assessment might be unavailable or has no questions.</p>
      <router-link to="/user-dashboard" class="btn-secondary-clean mt-3">
        Back to Dashboard
      </router-link>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { 
  Clock, ArrowLeft, ArrowRight, CheckCircle, 
  LogOut, Trophy, AlertCircle 
} from 'lucide-vue-next';

export default {
  name: "QuizAttempt",
  components: {
    Clock, ArrowLeft, ArrowRight, CheckCircle, LogOut, Trophy, AlertCircle
  },
  data() {
    return {
      quiz: null,
      questions: [],
      currentIndex: 0,
      userAnswers: [],
      loading: true,
      submitted: false,
      score: 0,
      timer: null,
      timeLeft: 0,
      showResultModal: false
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex] || {};
    },
    answeredCount() {
      return this.userAnswers.filter(a => a !== null).length;
    },
    formattedTime() {
      const min = Math.floor(this.timeLeft / 60).toString().padStart(2, "0");
      const sec = (this.timeLeft % 60).toString().padStart(2, "0");
      return `${min}:${sec}`;
    },
  },
  async created() {
    const quizId = this.$route.params.quizId;
    await this.fetchQuiz(quizId);
    await this.fetchQuestions(quizId);
    this.loading = false;
    
    if (this.quiz && this.quiz.time_duration) {
      const [h, m] = this.quiz.time_duration.split(":").map(Number);
      this.timeLeft = (h || 0) * 3600 + (m || 10) * 60;
      this.startTimer();
    } else {
      this.timeLeft = 600; // 10 minutes default
      this.startTimer();
    }
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
  methods: {
    async fetchQuiz(quizId) {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/quizzes`);
        const allQuizzes = [
          ...(res.data.available_quizzes || []),
          ...(res.data.completed_quizzes || [])
        ];
        this.quiz = allQuizzes.find((q) => q.id == quizId);
      } catch (e) {
        this.quiz = null;
      }
    },
    async fetchQuestions(quizId) {
      try {
        const res = await axios.get(`http://127.0.0.1:5000/api/question?quiz_id=${quizId}`);
        this.questions = res.data;
        this.userAnswers = Array(this.questions.length).fill(null);
      } catch (e) {
        this.questions = [];
      }
    },
    selectOption(n) {
      if (this.submitted) return;
      this.userAnswers[this.currentIndex] = n;
    },
    jumpToQuestion(idx) {
      if (this.submitted) return;
      this.currentIndex = idx;
    },
    nextQuestion() {
      if (this.currentIndex < this.questions.length - 1) this.currentIndex++;
    },
    prevQuestion() {
      if (this.currentIndex > 0) this.currentIndex--;
    },
    startTimer() {
      this.timer = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          clearInterval(this.timer);
          if (!this.submitted) this.submitQuiz();
        }
      }, 1000);
    },
    async submitQuiz() {
      if (this.submitted) return;
      clearInterval(this.timer);
      
      let score = 0;
      this.questions.forEach((q, idx) => {
        if (this.userAnswers[idx] === q.correct_option) score++;
      });
      this.score = score;
      this.submitted = true;
      
      try {
        const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
        await axios.post("http://127.0.0.1:5000/api/score", {
          quiz_id: this.quiz.id,
          user_id: user.id,
          total_scored: score,
        });
      } catch (e) {
        console.error("Failed to submit score", e);
      }
      
      this.showResultModal = true;
    },
    exitQuiz() {
      if (!this.submitted && confirm("Are you sure you want to exit? Unsaved progress will be lost.")) {
        clearInterval(this.timer);
        this.$router.push({ name: "UserDashboard" });
      } else if (this.submitted) {
        this.$router.push({ name: "UserDashboard" });
      }
    },
    closeModal() {
      this.showResultModal = false;
      this.$router.push({ name: "UserDashboard" });
    },
  },
};
</script>

<style scoped>
.quiz-player-page {
  padding: 24px 20px 60px;
}

.quiz-player-container {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.min-vh-70 {
  min-height: 70vh;
}

/* Top Bar */
.player-top-bar {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-xs);
}

.quiz-title-row h2 {
  font-size: 1.35rem;
  margin-bottom: 4px;
}

.badge-pill-group {
  display: flex;
  gap: 6px;
}

.timer-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
}

.timer-countdown {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 1.15rem;
  color: var(--text-main);
  letter-spacing: 0.05em;
}

.warning-pulse {
  background: var(--danger-light);
  border-color: var(--danger-border);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

/* Stepper Dots */
.stepper-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 14px 20px;
  box-shadow: var(--shadow-xs);
}

.stepper-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.stepper-dots-grid {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.stepper-dot {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: #ffffff;
  color: var(--text-body);
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.stepper-dot.active {
  background: #0f172a;
  border-color: #0f172a;
  color: #ffffff;
  font-weight: 800;
}

.stepper-dot.answered:not(.active) {
  background: var(--primary-light);
  border-color: var(--primary-border);
  color: var(--primary);
}

/* Question Board */
.question-board-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 32px 28px;
  box-shadow: var(--shadow-sm);
}

.q-number-badge {
  display: inline-block;
  padding: 3px 9px;
  background: #f1f5f9;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.q-statement {
  font-size: 1.35rem;
  line-height: 1.45;
  color: var(--text-main);
  margin-bottom: 24px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.option-card:hover:not(.selected) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.option-card.selected {
  background: var(--primary-light);
  border-color: var(--primary);
}

.option-key-badge {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #f1f5f9;
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-card.selected .option-key-badge {
  background: var(--primary);
  color: #ffffff;
}

.option-content {
  font-size: 0.95rem;
  color: var(--text-main);
  flex: 1;
  line-height: 1.4;
}

.option-radio-circle {
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.option-card.selected .option-radio-circle {
  border-color: var(--primary);
}

.radio-inner-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  background: var(--primary);
}

/* Controls Dock */
.player-controls-dock {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-xs);
}

.nav-btn-group, .action-btn-group {
  display: flex;
  gap: 10px;
}

/* Result Modal */
.result-dialog {
  padding: 36px 32px;
}

.trophy-badge {
  width: 64px;
  height: 64px;
  background: var(--warning-light);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.score-summary-box {
  margin: 24px 0;
  padding: 20px;
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.score-number {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-main);
}

.score-divider {
  font-size: 1.25rem;
  color: var(--text-muted);
}

.accuracy-pill {
  display: inline-block;
  margin-top: 6px;
  padding: 4px 12px;
  background: var(--success-light);
  color: var(--success-hover);
  border: 1px solid var(--success-border);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 700;
}

.max-w-600 { max-width: 600px; }
.mx-auto { margin-left: auto; margin-right: auto; }
.mt-5 { margin-top: 3rem; }
.w-100 { width: 100%; }
</style>