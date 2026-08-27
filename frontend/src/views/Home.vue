<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-badge">
          <Sparkles class="hero-badge-icon text-primary-color" size="14" />
          <span>Next-Generation Learning &amp; Assessment</span>
        </div>

        <h1 class="hero-headline">
          Master any subject with <br />
          <span class="text-gradient">precision &amp; speed.</span>
        </h1>

        <p class="hero-subtext">
          QuizMaster delivers structured chapter quizzes, timed challenges, and deep performance insights designed for serious students and educators.
        </p>

        <div class="hero-cta-group">
          <router-link to="/signup" class="btn-accent-clean btn-lg">
            Start Learning Free <ArrowRight size="18" />
          </router-link>
          <router-link to="/login" class="btn-secondary-clean btn-lg">
            Sign In to Account
          </router-link>
        </div>

        <!-- Interactive Preview Widget -->
        <div class="hero-interactive-card">
          <div class="demo-card-header">
            <div class="card-dots">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="demo-badge">
              <Clock size="12" class="mr-1" /> Interactive Demo Question
            </div>
          </div>

          <div class="demo-question-body">
            <div class="demo-q-meta">
              <span class="badge-pill violet">Computer Science</span>
              <span class="badge-pill sky">Data Structures</span>
            </div>

            <h3 class="demo-q-title">What is the average time complexity of searching in a Hash Map?</h3>

            <div class="demo-options-grid">
              <button 
                v-for="(opt, idx) in demoOptions" 
                :key="idx"
                class="demo-opt-btn"
                :class="{ 
                  'correct': selectedDemoOpt === idx && opt.correct, 
                  'wrong': selectedDemoOpt === idx && !opt.correct,
                  'selected': selectedDemoOpt === idx
                }"
                @click="selectDemoOption(idx)"
              >
                <span class="opt-key">{{ String.fromCharCode(65 + idx) }}</span>
                <span class="opt-label">{{ opt.text }}</span>
                <CheckCircle v-if="selectedDemoOpt === idx && opt.correct" class="text-success-color ml-auto" size="16" />
                <XCircle v-if="selectedDemoOpt === idx && !opt.correct" class="text-danger-color ml-auto" size="16" />
              </button>
            </div>

            <div v-if="demoFeedback" class="demo-feedback-banner" :class="demoFeedback.type">
              <component :is="demoFeedback.icon" size="16" />
              <span>{{ demoFeedback.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bento Features Grid -->
    <section class="features-section">
      <div class="section-header text-center">
        <span class="badge-pill primary mb-2">Features</span>
        <h2>Built for focused mastery</h2>
        <p class="text-muted-color">Everything you need to test knowledge, analyze gaps, and level up.</p>
      </div>

      <div class="bento-grid">
        <div class="bento-card bento-span-2">
          <div class="bento-icon-box indigo">
            <Layers size="22" />
          </div>
          <h3>Structured Chapter Architecture</h3>
          <p>Organize exams by subjects and chapters. Progress through foundational topics before tackling advanced quizzes.</p>
          <div class="bento-mockup-tags">
            <span class="tag-pill">Mathematics</span>
            <span class="tag-pill">Physics</span>
            <span class="tag-pill">Computer Science</span>
            <span class="tag-pill">+12 more</span>
          </div>
        </div>

        <div class="bento-card">
          <div class="bento-icon-box amber">
            <Clock size="22" />
          </div>
          <h3>Timed Assessments</h3>
          <p>Sharpen your exam readiness with countdown timers and automated submission handlers.</p>
        </div>

        <div class="bento-card">
          <div class="bento-icon-box violet">
            <BarChart2 size="22" />
          </div>
          <h3>Deep Analytics</h3>
          <p>Visualize your accuracy rates, highest scores, and subject distribution across all attempts.</p>
        </div>

        <div class="bento-card bento-span-2">
          <div class="bento-icon-box emerald">
            <Trophy size="22" />
          </div>
          <h3>Continuous Improvement</h3>
          <p>Reattempt completed quizzes, review mistakes, and track your performance trends over time.</p>
          <div class="bento-stat-chips">
            <div class="stat-chip">
              <span class="stat-num">98.4%</span>
              <span class="stat-lbl">Platform Uptime</span>
            </div>
            <div class="stat-chip">
              <span class="stat-num">Instant</span>
              <span class="stat-lbl">Result Generation</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Banner -->
    <section class="footer-cta-section">
      <div class="footer-cta-card">
        <h2>Ready to elevate your scores?</h2>
        <p>Join hundreds of learners testing and excelling with QuizMaster.</p>
        <div class="footer-cta-buttons">
          <router-link to="/signup" class="btn-accent-clean btn-lg">
            Create Free Account
          </router-link>
          <router-link to="/login" class="btn-secondary-clean btn-lg">
            Login
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { 
  Sparkles, ArrowRight, Clock, CheckCircle, XCircle, 
  Layers, BarChart2, Trophy 
} from 'lucide-vue-next';

export default {
  name: 'HomeView',
  components: {
    Sparkles, ArrowRight, Clock, CheckCircle, XCircle,
    Layers, BarChart2, Trophy
  },
  data() {
    return {
      selectedDemoOpt: null,
      demoOptions: [
        { text: 'O(1) Constant Time', correct: true },
        { text: 'O(N) Linear Time', correct: false },
        { text: 'O(log N) Logarithmic', correct: false },
        { text: 'O(N²) Quadratic', correct: false },
      ],
      demoFeedback: null
    };
  },
  methods: {
    selectDemoOption(index) {
      this.selectedDemoOpt = index;
      const isCorrect = this.demoOptions[index].correct;
      if (isCorrect) {
        this.demoFeedback = {
          type: 'success',
          icon: 'CheckCircle',
          message: 'Spot on! Hash tables provide O(1) average lookup time.'
        };
      } else {
        this.demoFeedback = {
          type: 'danger',
          icon: 'XCircle',
          message: 'Not quite! Hash tables achieve O(1) average time.'
        };
      }
    }
  }
};
</script>

<style scoped>
.home-page {
  padding-bottom: 80px;
}

/* Hero */
.hero-section {
  padding: 60px 24px 40px;
  display: flex;
  justify-content: center;
}

.hero-container {
  max-width: 860px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: var(--primary-light);
  border: 1px solid var(--primary-border);
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 24px;
}

.hero-headline {
  font-size: 3.2rem;
  line-height: 1.15;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.035em;
  margin-bottom: 20px;
}

.hero-subtext {
  font-size: 1.1rem;
  color: var(--text-muted);
  max-width: 620px;
  line-height: 1.6;
  margin-bottom: 32px;
}

.hero-cta-group {
  display: flex;
  gap: 12px;
  margin-bottom: 50px;
}

.btn-lg {
  padding: 12px 24px;
  font-size: 0.95rem;
}

/* Interactive Demo Card */
.hero-interactive-card {
  width: 100%;
  max-width: 680px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  text-align: left;
  overflow: hidden;
}

.demo-card-header {
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
}
.dot.red { background: #fca5a5; }
.dot.yellow { background: #fde047; }
.dot.green { background: #86efac; }

.demo-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  display: flex;
  align-items: center;
}

.demo-question-body {
  padding: 24px 28px;
}

.demo-q-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.demo-q-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 20px;
}

.demo-options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}

.demo-opt-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-main);
  text-align: left;
  transition: all var(--transition-fast);
}

.demo-opt-btn:hover:not(.selected) {
  border-color: #94a3b8;
  background: #f8fafc;
}

.opt-key {
  width: 24px;
  height: 24px;
  background: #f1f5f9;
  color: var(--text-muted);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.demo-opt-btn.correct {
  background: var(--success-light);
  border-color: var(--success);
  color: var(--success-hover);
}

.demo-opt-btn.correct .opt-key {
  background: var(--success);
  color: #ffffff;
}

.demo-opt-btn.wrong {
  background: var(--danger-light);
  border-color: var(--danger);
  color: var(--danger-hover);
}

.demo-opt-btn.wrong .opt-key {
  background: var(--danger);
  color: #ffffff;
}

.demo-feedback-banner {
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 0.84rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: fadeIn 0.2s ease-out;
}

.demo-feedback-banner.success {
  background: var(--success-light);
  color: var(--success-hover);
  border: 1px solid var(--success-border);
}

.demo-feedback-banner.danger {
  background: var(--danger-light);
  color: var(--danger-hover);
  border: 1px solid var(--danger-border);
}

/* Bento Features */
.features-section {
  max-width: 1080px;
  margin: 60px auto 0;
  padding: 0 24px;
}

.section-header {
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 2.2rem;
  margin-bottom: 8px;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.bento-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 28px;
  box-shadow: var(--shadow-xs);
  transition: all var(--transition-fast);
}

.bento-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: #cbd5e1;
}

.bento-span-2 {
  grid-column: span 2;
}

.bento-icon-box {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.bento-icon-box.indigo { background: var(--primary-light); color: var(--primary); }
.bento-icon-box.amber { background: var(--warning-light); color: var(--warning); }
.bento-icon-box.violet { background: var(--violet-light); color: var(--violet); }
.bento-icon-box.emerald { background: var(--success-light); color: var(--success); }

.bento-card h3 {
  font-size: 1.15rem;
  margin-bottom: 8px;
}

.bento-card p {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}

.bento-mockup-tags {
  display: flex;
  gap: 8px;
  margin-top: 18px;
  flex-wrap: wrap;
}

.tag-pill {
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-body);
}

.bento-stat-chips {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

.stat-chip {
  padding: 10px 16px;
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-weight: 800;
  font-size: 1.25rem;
  color: var(--text-main);
}

.stat-lbl {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Footer CTA */
.footer-cta-section {
  max-width: 1080px;
  margin: 70px auto 0;
  padding: 0 24px;
}

.footer-cta-card {
  background: #0f172a;
  color: #ffffff;
  border-radius: var(--radius-xl);
  padding: 50px 30px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footer-cta-card h2 {
  color: #ffffff;
  font-size: 2.2rem;
  margin-bottom: 10px;
}

.footer-cta-card p {
  color: #94a3b8;
  font-size: 1.05rem;
  margin-bottom: 28px;
}

.footer-cta-buttons {
  display: flex;
  gap: 12px;
}

.footer-cta-buttons .btn-secondary-clean {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #ffffff !important;
}

.footer-cta-buttons .btn-secondary-clean:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-headline { font-size: 2.3rem; }
  .bento-grid { grid-template-columns: 1fr; }
  .bento-span-2 { grid-column: span 1; }
  .demo-options-grid { grid-template-columns: 1fr; }
  .hero-cta-group { flex-direction: column; width: 100%; }
}
</style>