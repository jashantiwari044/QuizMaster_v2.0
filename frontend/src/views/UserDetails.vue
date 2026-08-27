<template>
  <div class="admin-page">
    <div class="admin-container">
      <!-- Header -->
      <div class="admin-header-row">
        <div>
          <div class="badge-pill violet mb-2">User Administration</div>
          <h1>Student Directory</h1>
          <p class="text-muted-color">Inspect student accounts, view assessment records, and export roster data.</p>
        </div>

        <button class="btn-primary-clean" :disabled="csvExporting" @click="csvExport">
          <span v-if="csvExporting" class="spinner-sm mr-2"></span>
          <Download v-else size="16" class="mr-2" />
          {{ csvExporting ? 'Exporting Roster...' : 'Export CSV' }}
        </button>
      </div>

      <!-- Metrics -->
      <div v-if="!loading" class="admin-metrics-row mb-4">
        <div class="metric-card">
          <div class="metric-icon-wrap violet">
            <Users size="20" />
          </div>
          <div class="metric-data">
            <div class="metric-val">{{ users.length }}</div>
            <div class="metric-lbl">Enrolled Students</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex-center py-5">
        <div class="spinner-sm"></div>
        <span class="ml-3 text-muted-color">Loading student records...</span>
      </div>

      <!-- Users Table Card -->
      <div v-else class="card-clean p-0 overflow-hidden">
        <div class="table-responsive" v-if="users.length > 0">
          <table class="table-clean">
            <thead>
              <tr>
                <th style="width: 70px;">#</th>
                <th>Student</th>
                <th>Qualification</th>
                <th>DOB</th>
                <th>Role</th>
                <th style="text-align: right; width: 140px;">Scores</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, idx) in users" :key="user.id">
                <td>
                  <span class="badge-pill neutral">#{{ idx + 1 }}</span>
                </td>
                <td>
                  <div class="user-row-meta">
                    <div class="avatar-sm">
                      {{ user.username?.charAt(0).toUpperCase() || 'U' }}
                    </div>
                    <div>
                      <div class="font-bold text-main">{{ user.username }}</div>
                      <div class="text-muted-color font-sm">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ user.qualification || 'N/A' }}</td>
                <td>{{ user.dob || 'N/A' }}</td>
                <td>
                  <span class="badge-pill primary">
                    {{ user.role }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button class="btn-secondary-clean btn-sm" @click="showScores(user)">
                    <Eye size="14" /> View Scores
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state-clean">
          <Users size="36" class="text-muted-color mb-3" />
          <h3>No students enrolled yet</h3>
          <p class="text-muted-color">Registered students will appear here.</p>
        </div>
      </div>
    </div>

    <!-- Student Score Inspection Modal -->
    <div class="modal-overlay-clean" v-if="showScoreModal" @click="closeModal">
      <div class="modal-content-clean modal-lg" @click.stop>
        <div class="modal-header-clean">
          <div class="modal-title-group">
            <div class="badge-pill violet mb-1">Student Transcript</div>
            <h3>Score History for {{ selectedUser?.username }}</h3>
          </div>
          <button type="button" class="btn-close-clean" @click="closeModal">
            <X size="18" />
          </button>
        </div>

        <div class="modal-body-clean p-0 max-h-60vh overflow-y-auto">
          <div v-if="loadingScores" class="flex-center py-5">
            <div class="spinner-sm"></div>
            <span class="ml-3 text-muted-color">Loading transcripts...</span>
          </div>

          <div v-else>
            <div v-if="userScores.length === 0" class="empty-state-clean p-4">
              <Trophy size="28" class="text-muted-color mb-2" />
              <p>No assessment attempts recorded for this student.</p>
            </div>

            <table v-else class="table-clean">
              <thead>
                <tr>
                  <th>Quiz Name</th>
                  <th>Subject &amp; Chapter</th>
                  <th>Score</th>
                  <th>Reattempted</th>
                  <th>Attempted Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="score in userScores" :key="score.quiz_id">
                  <td class="font-bold text-main">{{ score.quiz_name }}</td>
                  <td>
                    <span class="badge-pill neutral">{{ score.subject_name }} &bull; {{ score.chapter_name }}</span>
                  </td>
                  <td>
                    <span class="score-chip">{{ score.score }}</span>
                  </td>
                  <td>
                    <span v-if="score.reattempted" class="badge-pill warning">Yes</span>
                    <span v-else class="badge-pill success">No</span>
                  </td>
                  <td class="font-sm text-muted-color">{{ score.attempted_on }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer-clean flex-between">
          <span class="text-muted-color font-sm">{{ userScores.length }} total attempts logged</span>
          <button class="btn-secondary-clean" @click="closeModal">
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Users, Download, Eye, X, Trophy } from 'lucide-vue-next';

export default {
  name: 'UserDetails',
  components: {
    Users, Download, Eye, X, Trophy
  },
  data() {
    return {
      users: [],
      selectedUser: null,
      loading: true,
      userScores: [],
      loadingScores: false,
      showScoreModal: false,
      csvExporting: false
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    fetchUsers() {
      this.loading = true;
      axios.get('http://127.0.0.1:5000/api/users')
        .then(res => {
          this.users = (res.data || []).filter(u => u.role !== 'admin');
        })
        .catch(() => {
          this.users = [];
        })
        .finally(() => {
          this.loading = false;
        });
    },
    showScores(user) {
      this.selectedUser = user;
      this.userScores = [];
      this.loadingScores = true;
      this.showScoreModal = true;
      axios.get(`http://127.0.0.1:5000/api/user-scores?user_id=${user.id}`)
        .then(res => {
          this.userScores = res.data || [];
        })
        .catch(() => {
          this.userScores = [];
        })
        .finally(() => {
          this.loadingScores = false;
        });
    },
    closeModal() {
      this.showScoreModal = false;
      this.selectedUser = null;
      this.userScores = [];
      this.loadingScores = false;
    },
    csvExport() {
      this.csvExporting = true;
      fetch('http://127.0.0.1:5000/api/export_users_csv', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          if (data.task_id) {
            this.pollCsvResult(data.task_id, 0);
          } else {
            this.csvExporting = false;
            alert('Could not start export process.');
          }
        })
        .catch(err => {
          this.csvExporting = false;
          alert('Export error: ' + err);
        });
    },
    pollCsvResult(taskId, attempts) {
      const pollUrl = `http://127.0.0.1:5000/api/csv_result/${taskId}`;
      fetch(pollUrl)
        .then(async res => {
          if (res.headers.get('content-type') && res.headers.get('content-type').includes('text/csv')) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            let filename = 'users_export.csv';
            const disposition = res.headers.get('Content-Disposition');
            if (disposition && disposition.indexOf('filename=') !== -1) {
              filename = disposition.split('filename=')[1].replace(/["']/g, '');
            }
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            this.csvExporting = false;
          } else {
            const data = await res.json();
            if (data.status === 'Processing') {
              if (attempts < 30) {
                setTimeout(() => this.pollCsvResult(taskId, attempts + 1), 1000);
              } else {
                this.csvExporting = false;
                alert('Export timed out.');
              }
            } else {
              this.csvExporting = false;
              alert('Export failed: ' + (data.error || 'Unknown error'));
            }
          }
        })
        .catch(e => {
          this.csvExporting = false;
          alert('Export error: ' + e);
        });
    }
  }
};
</script>

<style scoped>
.admin-page {
  padding: 32px 24px 60px;
}

.admin-container {
  max-width: 1100px;
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

.admin-metrics-row {
  max-width: 320px;
}

.user-row-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-sm {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-full);
  background: #0f172a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.82rem;
  flex-shrink: 0;
}

.score-chip {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  color: var(--primary);
  font-size: 1rem;
}

.modal-lg { max-width: 760px; }
.max-h-60vh { max-height: 60vh; }
.overflow-y-auto { overflow-y: auto; }
.p-0 { padding: 0 !important; }
.p-4 { padding: 1.5rem; }
.font-bold { font-weight: 600; }
.text-main { color: var(--text-main); }
.font-sm { font-size: 0.82rem; }
.btn-sm { padding: 6px 12px; font-size: 0.8rem; }
.mr-2 { margin-right: 0.5rem; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
</style>