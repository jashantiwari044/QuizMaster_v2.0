<template>
  <div class="admin-page">
    <div class="admin-container">
      <!-- Header -->
      <div class="admin-header-row">
        <div>
          <div class="badge-pill violet mb-2">Assessment Operations</div>
          <h1>Quiz Management</h1>
          <p class="text-muted-color">Create assessments, configure question banks, and set exam timers.</p>
        </div>

        <div class="header-action-group">
          <div class="search-input-wrap">
            <Search class="search-icon" size="16" />
            <input 
              type="search" 
              class="input-clean search-field-admin" 
              v-model="searchQuery" 
              placeholder="Search quizzes..." 
            />
          </div>

          <button class="btn-primary-clean" @click="openQuizModal()">
            <Plus size="16" /> Create New Quiz
          </button>
        </div>
      </div>

      <!-- Metrics -->
      <div v-if="!loading" class="admin-metrics-row mb-4">
        <div class="metric-card">
          <div class="metric-icon-wrap primary">
            <HelpCircle size="20" />
          </div>
          <div class="metric-data">
            <div class="metric-val">{{ quizzes.length }}</div>
            <div class="metric-lbl">Total Quizzes</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap success">
            <Layers size="20" />
          </div>
          <div class="metric-data">
            <div class="metric-val">{{ totalQuestionsCount }}</div>
            <div class="metric-lbl">Total Questions</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex-center py-5">
        <div class="spinner-sm"></div>
        <span class="ml-3 text-muted-color">Loading quiz data...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredQuiz.length === 0" class="empty-state-clean">
        <HelpCircle size="36" class="text-muted-color mb-3" />
        <h3>No quizzes found</h3>
        <p class="text-muted-color">Try adjusting your search query or click "Create New Quiz".</p>
      </div>

      <!-- Quizzes Grid -->
      <div v-else class="admin-quiz-grid">
        <div v-for="quiz in filteredQuiz" :key="quiz.id" class="admin-quiz-card">
          <div class="card-top-row">
            <div class="quiz-header-meta">
              <span class="badge-pill neutral">{{ quiz.chapter_name || 'Chapter ' + quiz.chapter_id }}</span>
              <span class="badge-pill primary">{{ quiz.number_of_questions || 0 }} Qs</span>
            </div>

            <div class="card-action-menu">
              <button class="icon-btn edit" @click="openQuizModal(quiz)" title="Edit Quiz Settings">
                <Edit2 size="14" />
              </button>
              <button class="icon-btn delete" @click="openDeleteQuizModal(quiz)" title="Delete Quiz">
                <Trash2 size="14" />
              </button>
            </div>
          </div>

          <h3 class="admin-quiz-name">{{ quiz.quiz_name }}</h3>

          <div class="quiz-meta-specs">
            <div class="spec-row">
              <Clock size="14" class="text-warning-color" />
              <span><strong>Duration:</strong> {{ quiz.time_duration || '00:30' }}</span>
            </div>
            <div class="spec-row">
              <Calendar size="14" class="text-sky-color" />
              <span><strong>Date:</strong> {{ formatDate(quiz.date_of_quiz) }}</span>
            </div>
            <div class="spec-row" v-if="quiz.remarks">
              <MessageSquare size="14" class="text-muted-color" />
              <span class="text-truncate">{{ quiz.remarks }}</span>
            </div>
          </div>

          <div class="admin-quiz-card-footer">
            <button class="btn-secondary-clean w-100 btn-sm" @click="openQuestionModal(quiz)">
              <Eye size="14" /> View Questions ({{ quiz.number_of_questions || 0 }})
            </button>
            <button class="btn-primary-clean w-100 btn-sm" @click="openAddQuestionModal(quiz)">
              <Plus size="14" /> Add Question
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Modal (Create / Edit) -->
    <div class="modal-overlay-clean" v-if="showQuizModal" @click="closeQuizModal">
      <div class="modal-content-clean" @click.stop>
        <form @submit.prevent="saveQuiz">
          <div class="modal-header-clean">
            <div class="modal-title-group">
              <div class="badge-pill primary mb-1">Assessment Setup</div>
              <h3>{{ quizForm.id ? 'Edit Assessment' : 'Create New Assessment' }}</h3>
            </div>
            <button type="button" class="btn-close-clean" @click="closeQuizModal">
              <X size="18" />
            </button>
          </div>

          <div class="modal-body-clean">
            <div class="form-group mb-3">
              <label>Quiz Title</label>
              <input type="text" class="input-clean" v-model="quizForm.quiz_name" placeholder="e.g. Data Structures Midterm" required />
            </div>

            <div class="form-group mb-3">
              <label>Chapter Association</label>
              <select class="input-clean" v-model="quizForm.chapter_id" required>
                <option disabled value="">-- Select Chapter --</option>
                <option v-for="chapter in chapters" :key="chapter.id" :value="chapter.id">
                  {{ chapter.name }}
                </option>
              </select>
            </div>

            <div class="form-grid-2 mb-3">
              <div class="form-group">
                <label>Date / Deadline</label>
                <input type="datetime-local" class="input-clean" v-model="quizForm.date_of_quiz" />
              </div>
              <div class="form-group">
                <label>Duration (HH:MM)</label>
                <input type="text" class="input-clean" v-model="quizForm.time_duration" placeholder="00:30" />
              </div>
            </div>

            <div class="form-group">
              <label>Remarks / Instructions</label>
              <input type="text" class="input-clean" v-model="quizForm.remarks" placeholder="Optional examiner notes" />
            </div>
          </div>

          <div class="modal-footer-clean">
            <button type="button" class="btn-secondary-clean" @click="closeQuizModal">
              Cancel
            </button>
            <button type="submit" class="btn-primary-clean">
              {{ quizForm.id ? 'Save Changes' : 'Create Quiz' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Questions Drawer / Modal -->
    <div class="modal-overlay-clean" v-if="showQuestionsModal" @click="showQuestionsModal = false">
      <div class="modal-content-clean modal-lg" @click.stop>
        <div class="modal-header-clean">
          <div class="modal-title-group">
            <div class="badge-pill primary mb-1">Question Bank</div>
            <h3>Questions for "{{ currentQuiz.quiz_name }}"</h3>
          </div>
          <button type="button" class="btn-close-clean" @click="showQuestionsModal = false">
            <X size="18" />
          </button>
        </div>

        <div class="modal-body-clean p-0 max-h-60vh overflow-y-auto">
          <div v-if="questions.length === 0" class="empty-state-clean p-4">
            <HelpCircle size="28" class="text-muted-color mb-2" />
            <p>No questions added to this quiz yet.</p>
          </div>

          <div v-else class="question-list-clean">
            <div v-for="(q, index) in questions" :key="q.id" class="question-row-clean">
              <div class="q-top-bar flex-between mb-2">
                <span class="q-idx-badge">Question {{ index + 1 }}</span>
                <button class="icon-btn delete" @click="deleteQuestion(q)" title="Delete Question">
                  <Trash2 size="14" />
                </button>
              </div>

              <h4 class="q-statement-clean">{{ q.question_statement }}</h4>

              <div class="q-options-grid-clean">
                <div 
                  v-for="i in 4" 
                  :key="i"
                  class="q-opt-pill"
                  :class="{ 'is-correct': q.correct_option === i }"
                >
                  <span class="opt-k">{{ String.fromCharCode(64 + i) }}</span>
                  <span class="opt-v">{{ q['option' + i] }}</span>
                  <CheckCircle v-if="q.correct_option === i" size="14" class="text-success-color ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer-clean flex-between">
          <span class="text-muted-color font-sm">{{ questions.length }} questions configured</span>
          <button class="btn-secondary-clean" @click="showQuestionsModal = false">
            Done
          </button>
        </div>
      </div>
    </div>

    <!-- Add Question Modal -->
    <div class="modal-overlay-clean" v-if="showAddQuestionModal" @click="showAddQuestionModal = false">
      <div class="modal-content-clean modal-lg" @click.stop>
        <form @submit.prevent="saveQuestion">
          <div class="modal-header-clean">
            <div class="modal-title-group">
              <div class="badge-pill violet mb-1">{{ currentQuiz.quiz_name }}</div>
              <h3>Add Question</h3>
            </div>
            <button type="button" class="btn-close-clean" @click="showAddQuestionModal = false">
              <X size="18" />
            </button>
          </div>

          <div class="modal-body-clean">
            <div class="form-group mb-3">
              <label>Question Statement</label>
              <textarea class="input-clean" v-model="questionForm.question_statement" rows="2" placeholder="What is the question statement?" required></textarea>
            </div>

            <div class="form-grid-2 mb-3">
              <div class="form-group" v-for="i in 4" :key="i">
                <label>Option {{ String.fromCharCode(64 + i) }}</label>
                <input type="text" class="input-clean" v-model="questionForm['option' + i]" placeholder="Option text" required />
              </div>
            </div>

            <div class="form-group">
              <label>Select Correct Option</label>
              <div class="radio-selector-row">
                <label 
                  v-for="i in 4" 
                  :key="i"
                  class="radio-pill-opt"
                  :class="{ active: questionForm.correct_option === i }"
                >
                  <input type="radio" :value="i" v-model.number="questionForm.correct_option" class="d-none" />
                  <span>Option {{ String.fromCharCode(64 + i) }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="modal-footer-clean">
            <button type="button" class="btn-secondary-clean" @click="showAddQuestionModal = false">
              Cancel
            </button>
            <button type="submit" class="btn-primary-clean">
              Add Question
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay-clean" v-if="showDeleteQuizModal" @click="showDeleteQuizModal = false">
      <div class="modal-content-clean text-center p-4" @click.stop>
        <Trash2 size="36" class="text-danger-color mb-3 mx-auto" />
        <h3>Delete Assessment?</h3>
        <p class="text-muted-color mb-4">Are you sure you want to delete <strong>{{ quizToDelete.quiz_name }}</strong>? All questions and attempts will be removed permanently.</p>
        <div class="flex-center gap-2">
          <button class="btn-secondary-clean" @click="showDeleteQuizModal = false">
            Cancel
          </button>
          <button class="btn-danger-clean" @click="deleteQuiz">
            Yes, Delete Quiz
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { 
  HelpCircle, Layers, Search, Plus, Edit2, Trash2, 
  Clock, Calendar, MessageSquare, Eye, X, CheckCircle 
} from 'lucide-vue-next';

export default {
  name: "QuizManagement",
  components: {
    HelpCircle, Layers, Search, Plus, Edit2, Trash2,
    Clock, Calendar, MessageSquare, Eye, X, CheckCircle
  },
  data() {
    return {
      quizzes: [],
      loading: true,
      chapters: [],
      searchQuery: '',
      showQuizModal: false,
      showDeleteQuizModal: false,
      showQuestionsModal: false,
      showAddQuestionModal: false,
      quizForm: {
        id: null,
        quiz_name: '',
        chapter_id: '',
        date_of_quiz: '',
        time_duration: '',
        remarks: '',
      },
      quizToDelete: {},
      currentQuiz: {},
      questions: [],
      questionForm: {
        question_statement: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correct_option: 1,
      },
    };
  },
  computed: {
    totalQuestionsCount() {
      return this.quizzes.reduce((acc, q) => acc + (q.number_of_questions || 0), 0);
    },
    filteredQuiz() {
      const q = this.searchQuery.toLowerCase().trim();
      if (!q) return this.quizzes;
      return this.quizzes.filter(quiz => 
        (quiz.quiz_name && quiz.quiz_name.toLowerCase().includes(q)) ||
        (quiz.chapter_name && quiz.chapter_name.toLowerCase().includes(q))
      );
    }
  },
  mounted() {
    this.loadAllQuizzes();
  },
  methods: {
    async loadAllQuizzes() {
      this.loading = true;
      try {
        const { data: subjects } = await axios.get('http://127.0.0.1:5000/api/subject');
        const chapterPromises = subjects.map(subj =>
          axios.get('http://127.0.0.1:5000/api/chapter', { params: { subject_id: subj.id } }).then(res => res.data).catch(() => [])
        );
        const chapterResults = await Promise.all(chapterPromises);
        const allChapters = chapterResults.flat();
        this.chapters = allChapters;

        const quizPromises = allChapters.map(chapter =>
          axios.get('http://127.0.0.1:5000/api/quiz', { params: { chapter_id: chapter.id } })
            .then(res => res.data.map(q => ({ ...q, chapter_id: chapter.id, chapter_name: chapter.name })))
            .catch(() => [])
        );
        const quizResults = await Promise.all(quizPromises);
        this.quizzes = quizResults.flat();
      } catch (err) {
        console.error(err);
        this.quizzes = [];
      } finally {
        this.loading = false;
      }
    },
    formatDate(d) {
      if (!d) return 'Flexible';
      try {
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch (e) {
        return d;
      }
    },
    openQuizModal(quiz = null) {
      if (quiz) {
        this.quizForm = {
          id: quiz.id,
          quiz_name: quiz.quiz_name,
          chapter_id: quiz.chapter_id,
          date_of_quiz: quiz.date_of_quiz ? quiz.date_of_quiz.replace(' ', 'T') : '',
          time_duration: quiz.time_duration,
          remarks: quiz.remarks,
        };
      } else {
        this.quizForm = { id: null, quiz_name: '', chapter_id: '', date_of_quiz: '', time_duration: '', remarks: '' };
      }
      this.showQuizModal = true;
    },
    closeQuizModal() {
      this.showQuizModal = false;
    },
    async saveQuiz() {
      try {
        const payload = {
          chapter_id: this.quizForm.chapter_id,
          quiz_name: this.quizForm.quiz_name,
          date_of_quiz: this.quizForm.date_of_quiz ? new Date(this.quizForm.date_of_quiz).toISOString().slice(0, 19).replace('T', ' ') : null,
          time_duration: this.quizForm.time_duration,
          remarks: this.quizForm.remarks,
        };
        if (this.quizForm.id) {
          payload.id = this.quizForm.id;
          await axios.put('http://127.0.0.1:5000/api/quiz', payload);
        } else {
          await axios.post('http://127.0.0.1:5000/api/quiz', payload);
        }
        this.showQuizModal = false;
        this.loadAllQuizzes();
      } catch (e) {
        alert('Error saving quiz');
      }
    },
    openDeleteQuizModal(quiz) {
      this.quizToDelete = quiz;
      this.showDeleteQuizModal = true;
    },
    async deleteQuiz() {
      try {
        await axios.delete('http://127.0.0.1:5000/api/quiz', { data: { id: this.quizToDelete.id } });
        this.showDeleteQuizModal = false;
        this.loadAllQuizzes();
      } catch (e) {
        alert('Error deleting quiz');
      }
    },
    openQuestionModal(quiz) {
      this.currentQuiz = quiz;
      this.loadQuestions(quiz.id);
      this.showQuestionsModal = true;
    },
    async loadQuestions(quiz_id) {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/question', { params: { quiz_id } });
        this.questions = res.data || [];
      } catch (e) {
        this.questions = [];
      }
    },
    async deleteQuestion(question) {
      if (!confirm('Delete this question?')) return;
      try {
        await axios.delete('http://127.0.0.1:5000/api/question', { data: { id: question.id } });
        this.loadQuestions(this.currentQuiz.id);
        this.loadAllQuizzes();
      } catch (e) {
        alert('Error deleting question');
      }
    },
    openAddQuestionModal(quiz) {
      this.currentQuiz = quiz;
      this.questionForm = { question_statement: '', option1: '', option2: '', option3: '', option4: '', correct_option: 1 };
      this.showAddQuestionModal = true;
    },
    async saveQuestion() {
      try {
        const payload = { quiz_id: this.currentQuiz.id, ...this.questionForm };
        await axios.post('http://127.0.0.1:5000/api/question', payload);
        this.showAddQuestionModal = false;
        this.loadQuestions(this.currentQuiz.id);
        this.loadAllQuizzes();
      } catch (e) {
        alert('Error adding question');
      }
    },
  },
};
</script>

<style scoped>
.admin-page {
  padding: 32px 24px 60px;
}

.admin-container {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.header-action-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input-wrap {
  position: relative;
  width: 240px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
  pointer-events: none;
}

.search-field-admin {
  padding-left: 36px;
  background: var(--bg-surface);
}

.admin-metrics-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 520px;
}

/* Grid */
.admin-quiz-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.admin-quiz-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 22px;
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-fast);
}

.admin-quiz-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: #cbd5e1;
}

.card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.quiz-header-meta {
  display: flex;
  gap: 6px;
}

.card-action-menu {
  display: flex;
  gap: 4px;
}

.icon-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  padding: 5px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.icon-btn.edit:hover {
  background: var(--primary-light);
  border-color: var(--primary-border);
  color: var(--primary);
}

.icon-btn.delete:hover {
  background: var(--danger-light);
  border-color: var(--danger-border);
  color: var(--danger);
}

.admin-quiz-name {
  font-size: 1.2rem;
  margin-bottom: 14px;
}

.quiz-meta-specs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 18px;
  flex: 1;
}

.spec-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
  color: var(--text-body);
}

.admin-quiz-card-footer {
  padding-top: 14px;
  border-top: 1px solid var(--border-light);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.btn-sm {
  padding: 7px 12px;
  font-size: 0.8rem;
}

/* Question List in Modal */
.modal-lg {
  max-width: 720px;
}

.max-h-60vh {
  max-height: 60vh;
}

.overflow-y-auto {
  overflow-y: auto;
}

.question-list-clean {
  display: flex;
  flex-direction: column;
}

.question-row-clean {
  padding: 18px 24px;
  border-bottom: 1px solid var(--border-color);
}

.question-row-clean:last-child {
  border-bottom: none;
}

.q-idx-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
}

.q-statement-clean {
  font-size: 1rem;
  margin-bottom: 12px;
}

.q-options-grid-clean {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.q-opt-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
}

.q-opt-pill.is-correct {
  background: var(--success-light);
  border-color: var(--success-border);
  color: var(--success-hover);
  font-weight: 600;
}

.opt-k {
  font-weight: 700;
  color: var(--text-muted);
}

/* Radio Pill Selector */
.radio-selector-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.radio-pill-opt {
  padding: 10px;
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.radio-pill-opt:hover {
  background: #f1f5f9;
}

.radio-pill-opt.active {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary);
}

.d-none { display: none; }
.text-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.p-0 { padding: 0 !important; }
.p-4 { padding: 1.5rem; }
</style>