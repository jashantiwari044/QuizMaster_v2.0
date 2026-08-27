<template>
  <div class="analytics-page">
    <div class="analytics-container">
      <!-- Header -->
      <div class="page-header-row">
        <div>
          <div class="badge-pill violet mb-2">Platform Analytics</div>
          <h1>System Overview &amp; Statistics</h1>
          <p class="text-muted-color">High-level statistics on quiz engagement, maximum scores, and overall student activity.</p>
        </div>

        <router-link to="/admin-dashboard" class="btn-secondary-clean">
          <Layers size="16" /> Back to Dashboard
        </router-link>
      </div>

      <div v-if="loading" class="flex-center py-5">
        <div class="spinner-sm"></div>
        <span class="ml-3 text-muted-color">Loading platform analytics...</span>
      </div>

      <div v-else>
        <!-- Metrics Row -->
        <div class="analytics-metric-row">
          <div class="metric-card">
            <div class="metric-icon-wrap primary">
              <BarChart2 size="22" />
            </div>
            <div class="metric-data">
              <div class="metric-val">{{ stats.length }}</div>
              <div class="metric-lbl">Total Quizzes</div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-wrap success">
              <TrendingUp size="22" />
            </div>
            <div class="metric-data">
              <div class="metric-val">{{ totalPlatformAttempts }}</div>
              <div class="metric-lbl">Total Submissions</div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon-wrap violet">
              <Award size="22" />
            </div>
            <div class="metric-data">
              <div class="metric-val">{{ highestScoreEver }}</div>
              <div class="metric-lbl">Peak Score Record</div>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="charts-grid-2">
          <!-- Highest Marks Chart -->
          <div class="chart-card-clean">
            <div class="chart-card-header">
              <div>
                <h3 class="chart-title">Highest Score in Each Assessment</h3>
                <p class="chart-subtitle">Maximum marks scored by any student</p>
              </div>
              <span class="badge-pill primary">Bar View</span>
            </div>

            <div class="chart-canvas-wrapper">
              <Bar v-if="barChartData" :data="barChartData" :options="barChartOptions" />
              <div v-else class="empty-chart-state">
                <HelpCircle size="28" class="text-muted-color mb-2" />
                <p>No assessment data available</p>
              </div>
            </div>
          </div>

          <!-- Attempt Popularity Chart -->
          <div class="chart-card-clean">
            <div class="chart-card-header">
              <div>
                <h3 class="chart-title">Assessment Popularity</h3>
                <p class="chart-subtitle">Distribution of total student attempts per quiz</p>
              </div>
              <span class="badge-pill violet">Distribution</span>
            </div>

            <div class="chart-canvas-wrapper">
              <Pie v-if="pieChartData" :data="pieChartData" :options="pieChartOptions" />
              <div v-else class="empty-chart-state">
                <HelpCircle size="28" class="text-muted-color mb-2" />
                <p>No attempt records available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Bar, Pie } from 'vue-chartjs';
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale
} from 'chart.js';
import { BarChart2, TrendingUp, Award, Layers, HelpCircle } from 'lucide-vue-next';

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale);

export default {
  name: 'SummaryAdmin',
  components: { Bar, Pie, BarChart2, TrendingUp, Award, Layers, HelpCircle },
  data() {
    return {
      loading: true,
      stats: []
    };
  },
  computed: {
    totalPlatformAttempts() {
      return this.stats.reduce((acc, s) => acc + (s.attempts || 0), 0);
    },
    highestScoreEver() {
      if (!this.stats.length) return 0;
      return Math.max(...this.stats.map(s => s.highest_mark || 0), 0);
    },
    barChartData() {
      if (!this.stats.length) return null;
      return {
        labels: this.stats.map(q => q.quiz_name),
        datasets: [{
          label: 'Highest Score',
          backgroundColor: '#10b981',
          borderRadius: 6,
          hoverBackgroundColor: '#059669',
          data: this.stats.map(q => q.highest_mark)
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
      if (!this.stats.length) return null;
      const palette = ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9', '#ef4444', '#14b8a6', '#f97316'];
      const colors = this.stats.map((_, i) => palette[i % palette.length]);
      return {
        labels: this.stats.map(q => q.quiz_name),
        datasets: [{
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff',
          data: this.stats.map(q => q.attempts)
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
            labels: { color: '#334155', padding: 16, font: { family: 'Inter', size: 12 } }
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
  methods: {
    async fetchStats() {
      this.loading = true;
      try {
        const response = await fetch('http://127.0.0.1:5000/api/quiz-stats');
        this.stats = await response.json();
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.fetchStats();
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