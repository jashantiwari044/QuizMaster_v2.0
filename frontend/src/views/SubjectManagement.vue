<template>
  <div class="admin-page">
    <div class="admin-container">
      <!-- Header -->
      <div class="admin-header-row">
        <div>
          <div class="badge-pill violet mb-2">Subject Management</div>
          <h1>Subjects &amp; Disciplines</h1>
          <p class="text-muted-color">Define academic subjects, departments, and course tracks.</p>
        </div>

        <button class="btn-primary-clean" @click="openAddSubjectModal">
          <Plus size="16" /> Add New Subject
        </button>
      </div>

      <!-- Quick Metrics -->
      <div v-if="!loading" class="admin-metrics-row mb-4">
        <div class="metric-card">
          <div class="metric-icon-wrap violet">
            <BookOpen size="20" />
          </div>
          <div class="metric-data">
            <div class="metric-val">{{ subjects.length }}</div>
            <div class="metric-lbl">Total Configured Subjects</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex-center py-5">
        <div class="spinner-sm"></div>
        <span class="ml-3 text-muted-color">Loading subjects...</span>
      </div>

      <!-- Table Card -->
      <div v-else class="card-clean p-0 overflow-hidden">
        <div class="table-responsive" v-if="subjects.length > 0">
          <table class="table-clean">
            <thead>
              <tr>
                <th style="width: 80px;">ID</th>
                <th style="width: 280px;">Subject Name</th>
                <th>Description</th>
                <th style="width: 140px; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="subject in subjects" :key="subject.id">
                <td>
                  <span class="badge-pill neutral">#{{ subject.id }}</span>
                </td>
                <td>
                  <div v-if="subject.id !== editSubjectId" class="font-bold text-main">
                    {{ subject.name }}
                  </div>
                  <input v-else type="text" class="input-clean" v-model="subject.name" />
                </td>
                <td>
                  <div v-if="subject.id !== editSubjectId" class="text-muted-color font-sm">
                    {{ subject.description || 'No description provided' }}
                  </div>
                  <input v-else type="text" class="input-clean" v-model="subject.description" />
                </td>
                <td style="text-align: right;">
                  <div class="action-btn-row">
                    <template v-if="subject.id !== editSubjectId">
                      <button class="icon-btn edit" @click="startEditing(subject)" title="Edit Subject">
                        <Edit2 size="15" />
                      </button>
                    </template>
                    <template v-else>
                      <button class="icon-btn save" @click="saveEditing(subject)" title="Save Changes">
                        <Check size="15" />
                      </button>
                    </template>
                    <button class="icon-btn delete" @click="deleteSubject(subject)" title="Delete Subject">
                      <Trash2 size="15" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state-clean">
          <BookOpen size="36" class="text-muted-color mb-3" />
          <h3>No subjects added yet</h3>
          <p class="text-muted-color">Create your first subject to start building curriculum chapters.</p>
          <button class="btn-primary-clean mt-3" @click="openAddSubjectModal">
            <Plus size="16" /> Add Subject
          </button>
        </div>
      </div>
    </div>

    <!-- Add Subject Modal -->
    <div class="modal-overlay-clean" v-if="showSubjectModal" @click="closeAddSubjectModal">
      <div class="modal-content-clean" @click.stop>
        <form @submit.prevent="addSubject">
          <div class="modal-header-clean">
            <div class="modal-title-group">
              <div class="badge-pill violet mb-1">New Curriculum Entry</div>
              <h3>Add Academic Subject</h3>
            </div>
            <button type="button" class="btn-close-clean" @click="closeAddSubjectModal">
              <X size="18" />
            </button>
          </div>

          <div class="modal-body-clean">
            <div class="form-group mb-3">
              <label>Subject Name</label>
              <input type="text" class="input-clean" v-model="newSubjectName" placeholder="e.g. Computer Science" required />
            </div>

            <div class="form-group">
              <label>Description</label>
              <textarea class="input-clean" v-model="newSubjectDescription" rows="3" placeholder="Brief outline of this course discipline" required></textarea>
            </div>
          </div>

          <div class="modal-footer-clean">
            <button type="button" class="btn-secondary-clean" @click="closeAddSubjectModal">
              Cancel
            </button>
            <button type="submit" class="btn-primary-clean">
              Create Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { BookOpen, Plus, Edit2, Check, Trash2, X } from 'lucide-vue-next';

export default {
  name: "SubjectManagement",
  components: {
    BookOpen, Plus, Edit2, Check, Trash2, X
  },
  data() {
    return {
      newSubjectName: '',
      newSubjectDescription: '',
      subjects: [],
      editSubjectId: null,
      showSubjectModal: false,
      loading: true,
    };
  },
  mounted() {
    this.loadSubjects();
  },
  methods: {
    async loadSubjects() {
      this.loading = true;
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/subject');
        this.subjects = response.data || [];
      } catch (error) {
        console.error('Error loading subjects:', error);
      } finally {
        this.loading = false;
      }
    },
    async addSubject() {
      try {
        await axios.post('http://127.0.0.1:5000/api/subject', {
          name: this.newSubjectName,
          description: this.newSubjectDescription,
        });
        this.newSubjectName = '';
        this.newSubjectDescription = '';
        this.closeAddSubjectModal();
        this.loadSubjects();
      } catch (error) {
        console.error('Error adding subject:', error);
      }
    },
    openAddSubjectModal() {
      this.showSubjectModal = true;
    },
    closeAddSubjectModal() {
      this.showSubjectModal = false;
      this.newSubjectName = '';
      this.newSubjectDescription = '';
    },
    async deleteSubject(subject) {
      if (!confirm(`Are you sure you want to delete ${subject.name}? All associated chapters will be removed.`)) return;
      try {
        await axios.delete('http://127.0.0.1:5000/api/subject', { data: { id: subject.id } });
        this.loadSubjects();
      } catch (error) {
        console.error('Error deleting subject:', error);
      }
    },
    async saveEditing(subject) {
      try {
        await axios.put('http://127.0.0.1:5000/api/subject', {
          id: subject.id,
          name: subject.name,
          description: subject.description,
        });
        this.editSubjectId = null;
        this.loadSubjects();
      } catch (error) {
        console.error('Error saving subject:', error);
      }
    },
    startEditing(subject) {
      this.editSubjectId = subject.id;
    },
  },
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

.p-0 { padding: 0 !important; }
.overflow-hidden { overflow: hidden; }

.font-bold { font-weight: 600; }
.text-main { color: var(--text-main); }
.font-sm { font-size: 0.85rem; }

.action-btn-row {
  display: inline-flex;
  gap: 6px;
}

.icon-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  padding: 6px;
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

.icon-btn.save {
  background: var(--success-light);
  border-color: var(--success-border);
  color: var(--success);
}

.icon-btn.delete:hover {
  background: var(--danger-light);
  border-color: var(--danger-border);
  color: var(--danger);
}

.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
</style>