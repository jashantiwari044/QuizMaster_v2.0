<template>
  <div class="analytics-page">
    <div class="analytics-container">
      <!-- Header -->
      <div class="page-header-row">
        <div>
          <div class="badge-pill violet mb-2">Analytics &amp; Insights</div>
          <h1>Performance Summary</h1>
          <p class="text-muted-color">Visual insights into your scores, chapter mastery, and subject distribution.</p>
        </div>

        <button class="btn-secondary-clean" @click="goToUserScore">
          <Trophy size="16" /> View Attempts Log
        </button>
      </div>

      <div v-if="loading" class="flex-center py-5">
        <div class="spinner-sm"></div>
        <span class="ml-3 text-muted-color">Analyzing performance data...</span>
      </div>

      <div v-else>
        <!-- Metric Overview Row -->
        <div class="analytics-metric-row">
          <div class="metric-card">
            <div class="metric-icon-wrap primary">
              <BarChart2 size="22" />
            </div>
            <div class="metric-data">
              <div class="metric-val">{{ quizStats.length }}</div>
              <div class="metric-lbl">Quizzes Tracked</div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-wrap success">
              <Award size="22" />
            </div>
            <div class="metric-data">
              <div class="metric-val">{{ maxScoreOverall }}</div>
              <div class="metric-lbl">Highest Score</div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-wrap violet">
              <BookOpen size="22" />
            </div>
            <div class="metric-data">
              <div class="metric-val">{{ activeSubjectsCount }}</div>
              <div class="metric-lbl">Active Subjects</div>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="charts-grid-2">
          <!-- Bar Chart Card -->
          <div class="chart-card-clean">
            <div class="chart-card-header">
              <div>
                <h3 class="chart-title">Highest Score per Quiz</h3>
                <p class="chart-subtitle">Your peak performance across all attempted assessments</p>
              </div>
              <span class="badge-pill primary">Bar View</span>
            </div>

            <div class="chart-canvas-wrapper">
              <Bar v-if="barChartData" :data="barChartData" :options="barChartOptions" />
              <div v-else class="empty-chart-state">
                <HelpCircle size="28" class="text-muted-color mb-2" />
                <p>No assessment score records to plot</p>
              </div>
            </div>
          </div>

          <!-- Pie / Doughnut Chart Card -->
          <div class="chart-card-clean">
            <div class="chart-card-header">
              <div>
                <h3 class="chart-title">Subject Engagement</h3>
                <p class="chart-subtitle">Distribution of quizzes attempted by subject</p>
              </div>
              <span class="badge-pill violet">Distribution</span>
            </div>

            <div class="chart-canvas-wrapper">
              <Pie v-if="pieChartData" :data="pieChartData" :options="pieChartOptions" />
              <div v-else class="empty-chart-state">
                <HelpCircle size="28" class="text-muted-color mb-2" />
                <p>No subject attempt records to plot</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Bar, Pie } from 'vue-chartjs';
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale
} from 'chart.js';
import { BarChart2, Award, BookOpen, Trophy, HelpCircle } from 'lucide-vue-next';

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale);

export default {
  name: 'SummaryUser',
  components: { Bar, Pie, BarChart2, Award, BookOpen, Trophy, HelpCircle },
  props: {
    userId: { type: Number, required: false }
  },
  data() {
    return {
      loading: true,
      quizStats: [],
      subjectStats: []
    };
  },
  computed: {
    effectiveUserId() {
      if (this.userId) return this.userId;
      if (this.$store.state.user && this.$store.state.user.id) return this.$store.state.user.id;
      try {
        const u = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
        return u.id || null;
      } catch (e) {
        return null;
      }
    },
    maxScoreOverall() {
      if (!this.quizStats.length) return 0;
      return Math.max(...this.quizStats.map(q => q.highest_mark || 0), 0);
    },
    activeSubjectsCount() {
      return this.subjectStats.filter(s => s.attempted_count > 0).length || this.subjectStats.length;
    },
    barChartData() {
      if (!this.quizStats || !this.quizStats.length) return null;
      return {
        labels: this.quizStats.map(q => q.quiz_name),
        datasets: [{
          label: 'Highest Score',
          backgroundColor: '#4f46e5',
          borderRadius: 6,
          hoverBackgroundColor: '#4338ca',
          data: this.quizStats.map(q => q.highest_mark || 0)
        }]
      };
    },
    barChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            titleFont: { family: 'Plus Jakarta Sans', size: 13 },
            bodyFont: { family: 'Inter', size: 12 },
            cornerRadius: 8
          }
        },
        scales: {
          y: { 
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { color: '#64748b', font: { family: 'Inter' } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { family: 'Inter' } }
          }
        }
      };
    },
    pieChartData() {
      if (!this.subjectStats || !this.subjectStats.length) return null;
      const palette = [
        '#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', 
        '#0ea5e9', '#ef4444', '#14b8a6', '#f97316', 
        '#a855f7', '#ec4899'
      ];
      const colors = this.subjectStats.map((_, i) => palette[i % palette.length]);
      return {
        labels: this.subjectStats.map(s => s.subject_name),
        datasets: [{
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff',
          data: this.subjectStats.map(s => s.attempted_count || 0)
        }]
      };
    },
    pieChartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'bottom',
            labels: { color: '#334155', padding: 14, font: { family: 'Inter', size: 12 } }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8
          }
        }
      };
    }
  },
  watch: {
    effectiveUserId(newId) {
      if (newId) this.fetchStats();
    }
  },
  created() {
    this.fetchStats();
  },
  methods: {
    goToUserScore() {
      const uid = this.effectiveUserId;
      if (uid) {
        this.$router.push({ name: 'UserScore', params: { userId: uid } });
      } else {
        this.$router.push('/user-dashboard');
      }
    },
    async fetchStats() {
      const uid = this.effectiveUserId;
      if (!uid) {
        this.loading = false;
        return;
      }
      this.loading = true;
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/user-summary?user_id=${uid}`);
        this.quizStats = response.data.quiz_stats || [];
        this.subjectStats = response.data.subject_stats || [];
      } catch (e) {
        console.error("Error fetching user stats:", e);
        this.quizStats = [];
        this.subjectStats = [];
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.analytics-page {
  padding: 32px 24px 60px;
}

.analytics-container {
  max-width: 1100px;
  margin: 0 auto;
}

.page-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.analytics-metric-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.charts-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card-clean {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}

.chart-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 1.15rem;
  margin-bottom: 4px;
}

.chart-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.chart-canvas-wrapper {
  height: 280px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-chart-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.mb-2 { margin-bottom: 0.5rem; }

@media (max-width: 768px) {
  .analytics-metric-row { grid-template-columns: 1fr; }
  .charts-grid-2 { grid-template-columns: 1fr; }
}
</style>