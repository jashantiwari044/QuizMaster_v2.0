<template>
  <div class="dashboard-page">
    <div class="dashboard-container">
      <!-- Welcome & Metric Banner -->
      <div class="welcome-header">
        <div class="welcome-text">
          <div class="greeting-badge">
            <Sparkles size="14" class="text-primary-color" />
            <span>Student Learning Hub</span>
          </div>
          <h1>Explore Assessments</h1>
          <p class="text-muted-color">Choose a quiz below to test your chapter mastery and track your progress.</p>
        </div>

        <div class="stats-metric-row">
          <div class="metric-card">
            <div class="metric-icon-wrap primary">
              <BookOpen size="22" />
            </div>
            <div class="metric-data">
              <div class="metric-val">{{ availableQuizzes.length }}</div>
              <div class="metric-lbl">Available Quizzes</div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-wrap success">
              <CheckCircle size="22" />
            </div>
            <div class="metric-data">
              <div class="metric-val">{{ completedQuizzes.length }}</div>
              <div class="metric-lbl">Completed Quizzes</div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-wrap violet">
              <Layers size="22" />
            </div>
            <div class="metric-data">
              <div class="metric-val">{{ uniqueSubjects.length }}</div>
              <div class="metric-lbl">Active Subjects</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Controls & Filter Toolbar -->
      <div class="toolbar-card">
        <div class="search-input-wrap">
          <Search class="search-icon" size="18" />
          <input 
            type="search" 
            class="input-clean search-field" 
            v-model="searchQuery" 
            placeholder="Search by quiz name, subject, or chapter..." 
          />
        </div>

        <!-- Status Filter Tabs -->
        <div class="filter-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeStatusTab === 'all' }"
            @click="activeStatusTab = 'all'"
          >
            All ({{ allQuizzesCount }})
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeStatusTab === 'available' }"
            @click="activeStatusTab = 'available'"
          >
            Available ({{ availableQuizzes.length }})
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeStatusTab === 'completed' }"
            @click="activeStatusTab = 'completed'"
          >
            Completed ({{ completedQuizzes.length }})
          </button>
        </div>
      </div>

      <!-- Subject Category Pills -->
      <div v-if="uniqueSubjects.length > 1" class="subject-pills-bar">
        <button 
          class="subject-pill" 
          :class="{ active: selectedSubject === null }"
          @click="selectedSubject = null"
        >
          All Subjects
        </button>
        <button 
          v-for="subj in uniqueSubjects" 
          :key="subj"
          class="subject-pill"
          :class="{ active: selectedSubject === subj }"
          @click="selectedSubject = subj"
        >
          {{ subj }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex-center py-5">
        <div class="spinner-sm"></div>
        <span class="ml-3 text-muted-color">Loading assessments...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredQuizzes.length === 0" class="empty-state-clean">
        <div class="empty-icon-wrap">
          <HelpCircle size="32" class="text-muted-color" />
        </div>
        <h3>No quizzes match your filters</h3>
        <p class="text-muted-color">Try resetting your search query or subject filters.</p>
        <button class="btn-secondary-clean mt-3" @click="resetFilters">
          Reset Filters
        </button>
      </div>

      <!-- Quiz Cards Grid -->
      <div v-else class="quizzes-grid">
        <div 
          v-for="quiz in filteredQuizzes" 
          :key="quiz.id" 
          class="quiz-card-clean"
          :class="{ 'is-completed': quiz.isCompleted }"
        >
          <div class="quiz-card-top">
            <div class="quiz-tags">
              <span class="badge-pill violet">{{ quiz.subject_name }}</span>
              <span class="badge-pill neutral">{{ quiz.chapter_name }}</span>
            </div>
            
            <span v-if="quiz.isCompleted" class="badge-pill success">
              <CheckCircle size="12" /> Done
            </span>
            <span v-else class="badge-pill primary">
              <Sparkles size="12" /> New
            </span>
          </div>

          <h3 class="quiz-name">{{ quiz.quiz_name }}</h3>

          <div class="quiz-meta-list">
            <div class="meta-row">
              <Clock size="15" class="text-warning-color" />
              <span><strong>Duration:</strong> {{ formatDuration(quiz.time_duration) }}</span>
            </div>
            <div class="meta-row">
              <Calendar size="15" class="text-sky-color" />
              <span><strong>Date:</strong> {{ formatDate(quiz.date_of_quiz) }}</span>
            </div>
            <div class="meta-row" v-if="quiz.remarks">
              <MessageSquare size="15" class="text-muted-color" />
              <span class="remarks-text">{{ quiz.remarks }}</span>
            </div>
          </div>

          <div class="quiz-card-bottom">
            <button 
              v-if="!quiz.isCompleted" 
              class="btn-accent-clean w-100" 
              @click="openModal(quiz)"
            >
              Start Quiz <ArrowRight size="16" />
            </button>
            <router-link 
              v-else 
              :to="{ name: 'UserScore', params: { userId: currentUserId } }" 
              class="btn-secondary-clean w-100 text-center"
            >
              View My Score <Trophy size="16" />
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Instructions / Confirmation Modal -->
    <div class="modal-overlay-clean" v-if="showModal" @click="closeModal">
      <div class="modal-content-clean" @click.stop>
        <div class="modal-header-clean">
          <div class="modal-title-group">
            <div class="badge-pill primary mb-2">{{ selectedQuiz?.subject_name }} &bull; {{ selectedQuiz?.chapter_name }}</div>
            <h3>{{ selectedQuiz?.quiz_name }}</h3>
          </div>
          <button class="btn-close-clean" @click="closeModal">
            <X size="18" />
          </button>
        </div>

        <div class="modal-body-clean">
          <div class="instructions-box">
            <div class="instruction-item">
              <Clock size="18" class="text-warning-color flex-shrink-0" />
              <div>
                <strong>Duration:</strong> {{ formatDuration(selectedQuiz?.time_duration) }}
                <p class="instruction-desc">The timer will start immediately once you click Start Assessment.</p>
              </div>
            </div>

            <div class="instruction-item">
              <CheckCircle size="18" class="text-success-color flex-shrink-0" />
              <div>
                <strong>Single Attempt:</strong>
                <p class="instruction-desc">Make sure you have an uninterrupted connection before proceeding.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer-clean">
          <button class="btn-secondary-clean" @click="closeModal">
            Cancel
          </button>
          <button class="btn-accent-clean" @click="startQuiz(selectedQuiz?.id)">
            Start Assessment <ArrowRight size="16" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { 
  Sparkles, BookOpen, CheckCircle, Layers, Search, 
  HelpCircle, Clock, Calendar, MessageSquare, ArrowRight, 
  Trophy, X 
} from 'lucide-vue-next';

export default {
  name: "UserDashboard",
  components: {
    Sparkles, BookOpen, CheckCircle, Layers, Search,
    HelpCircle, Clock, Calendar, MessageSquare, ArrowRight,
    Trophy, X
  },
  data() {
    return {
      availableQuizzes: [],
      completedQuizzes: [],
      loading: true,
      searchQuery: '',
      activeStatusTab: 'all',
      selectedSubject: null,
      showModal: false,
      selectedQuiz: null,
      currentUserId: null
    };
  },
  computed: {
    allQuizzesCount() {
      return this.availableQuizzes.length + this.completedQuizzes.length;
    },
    uniqueSubjects() {
      const all = [...this.availableQuizzes, ...this.completedQuizzes];
      const subs = all.map(q => q.subject_name).filter(Boolean);
      return [...new Set(subs)];
    },
    filteredQuizzes() {
      let list = [];
      if (this.activeStatusTab === 'all') {
        list = [
          ...this.availableQuizzes.map(q => ({ ...q, isCompleted: false })),
          ...this.completedQuizzes.map(q => ({ ...q, isCompleted: true }))
        ];
      } else if (this.activeStatusTab === 'available') {
        list = this.availableQuizzes.map(q => ({ ...q, isCompleted: false }));
      } else {
        list = this.completedQuizzes.map(q => ({ ...q, isCompleted: true }));
      }

      if (this.selectedSubject) {
        list = list.filter(q => q.subject_name === this.selectedSubject);
      }

      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        list = list.filter(item => 
          (item.quiz_name && item.quiz_name.toLowerCase().includes(q)) ||
          (item.subject_name && item.subject_name.toLowerCase().includes(q)) ||
          (item.chapter_name && item.chapter_name.toLowerCase().includes(q))
        );
      }

      return list;
    }
  },
  async created() {
    const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
    this.currentUserId = user.id;
    await this.fetchQuizzes();
  },
  methods: {
    async fetchQuizzes() {
      this.loading = true;
      try {
        const res = await axios.get("http://127.0.0.1:5000/api/quizzes");
        this.availableQuizzes = res.data.available_quizzes || [];
        this.completedQuizzes = res.data.completed_quizzes || [];
      } catch (e) {
        this.availableQuizzes = [];
        this.completedQuizzes = [];
      } finally {
        this.loading = false;
      }
    },
    formatDuration(duration) {
      if (!duration) return '15 mins';
      const parts = duration.split(':');
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      if (h > 0) return `${h}h ${m}m`;
      return `${m} mins`;
    },
    formatDate(d) {
      if (!d) return 'Flexible';
      try {
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) {
        return d;
      }
    },
    resetFilters() {
      this.searchQuery = '';
      this.activeStatusTab = 'all';
      this.selectedSubject = null;
    },
    openModal(quiz) {
      this.selectedQuiz = quiz;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedQuiz = null;
    },
    startQuiz(quizId) {
      this.closeModal();
      this.$router.push({ name: 'QuizAttempt', params: { quizId } });
    }
  }
};
</script>

<style scoped>
.dashboard-page {
  padding: 32px 24px 60px;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Header & Metrics */
.welcome-header {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.greeting-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--primary-light);
  border: 1px solid var(--primary-border);
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 8px;
}

.welcome-text h1 {
  font-size: 2rem;
  margin-bottom: 4px;
}

.stats-metric-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* Toolbar */
.toolbar-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  box-shadow: var(--shadow-xs);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-input-wrap {
  position: relative;
  flex: 1;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
  pointer-events: none;
}

.search-field {
  padding-left: 38px;
  background: #f8fafc;
}

.filter-tabs {
  display: flex;
  background: #f1f5f9;
  border-radius: var(--radius-md);
  padding: 3px;
  gap: 2px;
}

.tab-btn {
  background: transparent;
  border: none;
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-btn.active {
  background: #ffffff;
  color: var(--text-main);
  box-shadow: var(--shadow-xs);
}

/* Subject Pills */
.subject-pills-bar {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 24px;
}

.subject-pill {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 600;
  border: 1px solid var(--border-color);
  background: #ffffff;
  color: var(--text-body);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.subject-pill.active {
  background: #0f172a;
  border-color: #0f172a;
  color: #ffffff;
}

/* Grid */
.quizzes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.quiz-card-clean {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 22px;
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-fast);
}

.quiz-card-clean:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: #cbd5e1;
}

.quiz-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.quiz-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.quiz-name {
  font-size: 1.2rem;
  color: var(--text-main);
  margin-bottom: 16px;
  line-height: 1.35;
}

.quiz-meta-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  flex: 1;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-body);
}

.remarks-text {
  color: var(--text-muted);
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.quiz-card-bottom {
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

/* Empty State */
.empty-state-clean {
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 48px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

/* Modal */
.modal-header-clean {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-title-group h3 {
  font-size: 1.25rem;
}

.btn-close-clean {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

.btn-close-clean:hover {
  color: var(--text-main);
}

.modal-body-clean {
  padding: 20px 24px;
}

.instructions-box {
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.instruction-item {
  display: flex;
  gap: 12px;
  font-size: 0.88rem;
}

.instruction-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.modal-footer-clean {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #f8fafc;
}

.text-sky-color { color: var(--sky); }

/* Responsive */
@media (max-width: 768px) {
  .stats-metric-row {
    grid-template-columns: 1fr;
  }
  .toolbar-card {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>