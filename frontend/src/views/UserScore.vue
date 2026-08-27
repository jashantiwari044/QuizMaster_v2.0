<template>
  <div class="score-page">
    <div class="score-page-container">
      <!-- Header -->
      <div class="page-header-row">
        <div>
          <div class="badge-pill primary mb-2">Performance History</div>
          <h1>My Quiz Attempts</h1>
          <p class="text-muted-color">Review your past assessment scores, accuracy rates, and reattempt options.</p>
        </div>

        <router-link to="/user-summary" class="btn-secondary-clean">
          <BarChart2 size="16" /> View Analytics
        </router-link>
      </div>

      <!-- Quick Metrics Summary -->
      <div v-if="!loading && scores.length > 0" class="score-metrics-row">
        <div class="metric-card">
          <div class="metric-icon-wrap primary">
            <Trophy size="22" />
          </div>
          <div class="metric-data">
            <div class="metric-val">{{ scores.length }}</div>
            <div class="metric-lbl">Total Attempts</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap success">
            <CheckCircle size="22" />
          </div>
          <div class="metric-data">
            <div class="metric-val">{{ totalCorrect }}</div>
            <div class="metric-lbl">Correct Answers</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap violet">
            <Award size="22" />
          </div>
          <div class="metric-data">
            <div class="metric-val">{{ overallAccuracy }}%</div>
            <div class="metric-lbl">Average Accuracy</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex-center py-5">
        <div class="spinner-sm"></div>
        <span class="ml-3 text-muted-color">Loading score records...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="scores.length === 0" class="empty-state-clean">
        <div class="empty-icon-wrap">
          <Trophy size="32" class="text-muted-color" />
        </div>
        <h3>No quiz attempts yet</h3>
        <p class="text-muted-color">Take your first quiz from the assessment hub to start building your score history.</p>
        <router-link to="/user-dashboard" class="btn-primary-clean mt-3">
          Explore Quizzes
        </router-link>
      </div>

      <!-- Score Cards Grid -->
      <div v-else class="score-cards-grid">
        <div v-for="score in scores" :key="score.quiz_id" class="score-card-clean">
          <div class="score-card-header">
            <div>
              <h3 class="quiz-title">{{ score.quiz_name }}</h3>
              <div class="date-text">
                <Calendar size="13" class="mr-1" />
                {{ formatDate(score.date_attempted) }}
              </div>
            </div>
            <span class="score-badge-circle">
              <span class="score-curr">{{ score.score }}</span>
              <span class="score-max">/{{ score.total_questions }}</span>
            </span>
          </div>

          <div class="score-stats-grid">
            <div class="stat-pill correct">
              <CheckCircle size="14" class="text-success-color" />
              <span><strong>{{ score.right }}</strong> Correct</span>
            </div>
            <div class="stat-pill wrong">
              <XCircle size="14" class="text-danger-color" />
              <span><strong>{{ score.wrong }}</strong> Wrong</span>
            </div>
          </div>

          <!-- Accuracy Bar -->
          <div class="accuracy-section">
            <div class="accuracy-header">
              <span class="accuracy-label">Accuracy</span>
              <span class="accuracy-percent">{{ getPercent(score.right, score.total_questions) }}%</span>
            </div>
            <div class="clean-progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: getPercent(score.right, score.total_questions) + '%' }"
              ></div>
            </div>
          </div>

          <div class="score-card-footer">
            <button 
              v-if="!score.reattempted" 
              class="btn-secondary-clean w-100" 
              @click="openPaymentModal(score.quiz_id)"
            >
              <RotateCw size="15" /> Reattempt Quiz
            </button>
            <div v-else class="reattempt-status-pill">
              <CheckCircle size="14" /> Reattempt Used
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reattempt Checkout Modal -->
    <div class="modal-overlay-clean" v-if="showPaymentModal" @click="closePaymentModal">
      <div class="modal-content-clean" @click.stop>
        <form @submit.prevent="processPayment">
          <div class="modal-header-clean">
            <div class="modal-title-group">
              <div class="badge-pill primary mb-1">Premium Reattempt</div>
              <h3>Quiz Reattempt Checkout</h3>
            </div>
            <button type="button" class="btn-close-clean" @click="closePaymentModal">
              <X size="18" />
            </button>
          </div>

          <div class="modal-body-clean">
            <div class="checkout-amount-box">
              <div class="amount-label">Assessment Fee</div>
              <div class="amount-val">₹50.00</div>
            </div>

            <div v-if="paymentError" class="error-banner mb-3">
              <AlertCircle size="16" class="mr-2 flex-shrink-0" />
              <span>{{ paymentError }}</span>
            </div>

            <div class="form-group mb-3">
              <label>Name on Card</label>
              <div class="input-wrap">
                <User class="input-icon" size="16" />
                <input type="text" class="input-clean pl-input" v-model="paymentForm.name" placeholder="John Doe" required />
              </div>
            </div>

            <div class="form-group mb-3">
              <label>Card Number</label>
              <div class="input-wrap">
                <CreditCard class="input-icon" size="16" />
                <input type="text" class="input-clean pl-input" v-model="paymentForm.cardNumber" maxlength="16" placeholder="4242 4242 4242 4242" required />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label>Expiry (MM/YY)</label>
                <input type="text" class="input-clean" v-model="paymentForm.expiry" placeholder="12/26" required />
              </div>
              <div class="form-group">
                <label>CVV</label>
                <input type="password" class="input-clean" v-model="paymentForm.cvv" maxlength="4" placeholder="123" required />
              </div>
            </div>
          </div>

          <div class="modal-footer-clean">
            <button type="button" class="btn-secondary-clean" @click="closePaymentModal">
              Cancel
            </button>
            <button type="submit" class="btn-primary-clean" :disabled="processingPayment">
              <span v-if="processingPayment" class="spinner-sm mr-2"></span>
              {{ processingPayment ? 'Processing...' : 'Pay ₹50 & Reattempt' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { 
  Trophy, CheckCircle, XCircle, BarChart2, Calendar, 
  RotateCw, Award, CreditCard, User, X, AlertCircle 
} from 'lucide-vue-next';

export default {
  name: "UserScore",
  components: {
    Trophy, CheckCircle, XCircle, BarChart2, Calendar,
    RotateCw, Award, CreditCard, User, X, AlertCircle
  },
  data() {
    return {
      scores: [],
      loading: true,
      userId: null,
      showPaymentModal: false,
      paymentForm: {
        cardNumber: '',
        expiry: '',
        cvv: '',
        name: ''
      },
      paymentError: '',
      processingPayment: false,
      pendingQuizId: null,
    };
  },
  computed: {
    totalCorrect() {
      return this.scores.reduce((acc, s) => acc + (s.right || 0), 0);
    },
    overallAccuracy() {
      const totalQ = this.scores.reduce((acc, s) => acc + (s.total_questions || 0), 0);
      if (!totalQ) return 0;
      return ((this.totalCorrect / totalQ) * 100).toFixed(0);
    }
  },
  async created() {
    const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || "{}");
    this.userId = user.id;
    if (!this.userId) {
      this.$router.push('/login');
      return;
    }

    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/score?user_id=${this.userId}`);
      this.scores = (res.data.scores || []).map(score => ({
        ...score,
        reattempted: score.reattempted || false,
      }));
    } catch (e) {
      this.scores = [];
    } finally {
      this.loading = false;
    }
  },
  methods: {
    formatDate(d) {
      if (!d) return 'N/A';
      try {
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) {
        return d;
      }
    },
    getPercent(right, total) {
      if (!total) return 0;
      return ((right / total) * 100).toFixed(0);
    },
    openPaymentModal(quizId) {
      this.pendingQuizId = quizId;
      this.showPaymentModal = true;
      this.paymentForm = { cardNumber: '', expiry: '', cvv: '', name: '' };
      this.paymentError = '';
      this.processingPayment = false;
    },
    closePaymentModal() {
      this.showPaymentModal = false;
      this.pendingQuizId = null;
      this.paymentError = '';
      this.processingPayment = false;
    },
    async processPayment() {
      this.paymentError = '';
      this.processingPayment = true;

      if (!this.paymentForm.cvv.match(/^\d{3,4}$/)) {
        this.paymentError = "Please enter a valid 3 or 4 digit CVV.";
        this.processingPayment = false;
        return;
      }

      setTimeout(() => {
        this.processingPayment = false;
        this.showPaymentModal = false;
        this.$router.push({ name: "QuizAttempt", params: { quizId: this.pendingQuizId } });
      }, 1000);
    },
  },
};
</script>

<style scoped>
.score-page {
  padding: 32px 24px 60px;
}

.score-page-container {
  max-width: 1100px;
  margin: 0 auto;
}

.page-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.score-metrics-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.score-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.score-card-clean {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 22px;
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-fast);
}

.score-card-clean:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: #cbd5e1;
}

.score-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.quiz-title {
  font-size: 1.15rem;
  color: var(--text-main);
  margin-bottom: 4px;
}

.date-text {
  font-size: 0.78rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
}

.score-badge-circle {
  padding: 6px 12px;
  background: #f1f5f9;
  border-radius: var(--radius-full);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  color: var(--text-main);
  font-size: 1.1rem;
}

.score-max {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
}

.score-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}

.stat-pill {
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-pill.correct {
  background: var(--success-light);
  color: var(--success-hover);
  border: 1px solid var(--success-border);
}

.stat-pill.wrong {
  background: var(--danger-light);
  color: var(--danger-hover);
  border: 1px solid var(--danger-border);
}

.accuracy-section {
  margin-bottom: 20px;
  flex: 1;
}

.accuracy-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.clean-progress-bar {
  height: 6px;
  background: #f1f5f9;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

.score-card-footer {
  padding-top: 14px;
  border-top: 1px solid var(--border-light);
}

.reattempt-status-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  background: #f8fafc;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  font-weight: 600;
}

/* Modal Checkout */
.checkout-amount-box {
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.amount-label {
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.88rem;
}

.amount-val {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-main);
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
  pointer-events: none;
}

.pl-input {
  padding-left: 36px;
}

.w-100 { width: 100%; }
.mr-1 { margin-right: 0.25rem; }
.mr-2 { margin-right: 0.5rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }

@media (max-width: 768px) {
  .score-metrics-row {
    grid-template-columns: 1fr;
  }
}
</style>