<template>
  <div class="admin-page">
    <div class="admin-container">
      <!-- Header Row -->
      <div class="admin-header-row">
        <div>
          <div class="badge-pill violet mb-2">Curriculum Architecture</div>
          <h1>Chapter Management</h1>
          <p class="text-muted-color">Browse academic subjects and expand chapters to configure learning modules.</p>
        </div>

        <div class="header-action-group">
          <div class="search-input-wrap">
            <Search class="search-icon" size="16" />
            <input 
              type="search" 
              class="input-clean search-field-admin" 
              v-model="searchQuery" 
              placeholder="Search subjects or chapters..." 
            />
          </div>

          <button 
            class="btn-secondary-clean" 
            @click="toggleExpandAll"
            v-if="filteredSubjects.length > 0"
          >
            <component :is="allExpanded ? 'Minimize2' : 'Maximize2'" size="15" />
            {{ allExpanded ? 'Collapse All' : 'Expand All' }}
          </button>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div v-if="!loading" class="admin-metrics-row mb-4">
        <div class="metric-card">
          <div class="metric-icon-wrap violet">
            <BookOpen size="20" />
          </div>
          <div class="metric-data">
            <div class="metric-val">{{ subjects.length }}</div>
            <div class="metric-lbl">Total Subjects</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-wrap primary">
            <Layers size="20" />
          </div>
          <div class="metric-data">
            <div class="metric-val">{{ totalChaptersCount }}</div>
            <div class="metric-lbl">Total Chapters</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex-center py-5">
        <div class="spinner-sm"></div>
        <span class="ml-3 text-muted-color">Loading curriculum data...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredSubjects.length === 0" class="empty-state-clean">
        <Layers size="36" class="text-muted-color mb-3" />
        <h3>No subjects or chapters found</h3>
        <p class="text-muted-color">Try adjusting your search query.</p>
      </div>

      <!-- Subjects Cards Grid -->
      <div v-else class="subject-cards-grid">
        <div 
          v-for="subject in filteredSubjects" 
          :key="subject.id" 
          class="subject-card-clean"
          :class="{ 'is-expanded': isSubjectExpanded(subject.id) }"
        >
          <!-- Main Subject Card Surface -->
          <div class="subject-card-main">
            <div class="subject-card-header">
              <div class="subject-badge-row">
                <span class="badge-pill violet">Subject #{{ subject.id }}</span>
                <span class="badge-pill" :class="subject.chapters?.length ? 'primary' : 'neutral'">
                  {{ subject.chapters?.length || 0 }} {{ subject.chapters?.length === 1 ? 'Chapter' : 'Chapters' }}
                </span>
              </div>

              <button 
                class="btn-primary-clean btn-sm" 
                @click.stop="openAddChapterModal(subject)"
                title="Add new chapter to this subject"
              >
                <Plus size="14" /> Add Chapter
              </button>
            </div>

            <h3 class="subject-title">{{ subject.name }}</h3>
            <p class="subject-desc">{{ subject.description || 'No description provided for this subject.' }}</p>

            <!-- Expand / Collapse Toggle Bar -->
            <div class="subject-card-footer">
              <button 
                class="btn-expand-chapters" 
                @click="toggleSubject(subject.id)"
              >
                <span>
                  {{ isSubjectExpanded(subject.id) ? 'Hide Chapters' : `See All Chapters (${subject.chapters?.length || 0})` }}
                </span>
                <component 
                  :is="isSubjectExpanded(subject.id) ? 'ChevronUp' : 'ChevronDown'" 
                  size="16" 
                  class="chevron-icon"
                />
              </button>
            </div>
          </div>

          <!-- Collapsible Chapter Drawer -->
          <div 
            class="chapters-drawer" 
            v-show="isSubjectExpanded(subject.id)"
          >
            <div class="drawer-inner">
              <div class="drawer-header flex-between mb-2">
                <span class="drawer-lbl">Syllabus Chapters</span>
                <span class="drawer-count text-muted-color font-sm">{{ subject.chapters?.length || 0 }} modules</span>
              </div>

              <!-- Empty Drawer State -->
              <div v-if="!subject.chapters || !subject.chapters.length" class="empty-chapter-box">
                <p class="text-muted-color mb-2">No chapters configured for this subject yet.</p>
                <button class="btn-secondary-clean btn-sm" @click="openAddChapterModal(subject)">
                  <Plus size="13" /> Create First Chapter
                </button>
              </div>

              <!-- Chapter List -->
              <div v-else class="chapters-list">
                <div 
                  v-for="(chap, idx) in subject.chapters" 
                  :key="chap.id" 
                  class="chapter-row-item"
                >
                  <div class="chapter-left">
                    <div class="chapter-index">{{ idx + 1 }}</div>
                    <div class="chapter-text-group">
                      <span class="chapter-title">{{ chap.name }}</span>
                      <p class="chapter-desc" v-if="chap.description">{{ chap.description }}</p>
                    </div>
                  </div>

                  <div class="chapter-actions">
                    <button class="icon-btn edit" @click="openEditChapterModal(subject, chap)" title="Edit Chapter">
                      <Edit2 size="14" />
                    </button>
                    <button class="icon-btn delete" @click="deleteChapter(chap.id)" title="Delete Chapter">
                      <Trash2 size="14" />
                    </button>
                  </div>
                </div>

                <!-- Add More Chapters Row -->
                <button class="btn-add-chapter-dashed" @click="openAddChapterModal(subject)">
                  <Plus size="14" /> Add Another Chapter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chapter Modal (Add/Edit) -->
    <div class="modal-overlay-clean" v-if="showChapterModal" @click="closeChapterModal">
      <div class="modal-content-clean" @click.stop>
        <form @submit.prevent="submitChapterForm">
          <div class="modal-header-clean">
            <div class="modal-title-group">
              <div class="badge-pill violet mb-1">Subject: {{ currentSubject?.name }}</div>
              <h3>{{ isEditMode ? 'Edit Chapter' : 'Add New Chapter' }}</h3>
            </div>
            <button type="button" class="btn-close-clean" @click="closeChapterModal">
              <X size="18" />
            </button>
          </div>

          <div class="modal-body-clean">
            <div class="form-group mb-3">
              <label>Chapter Title</label>
              <input type="text" class="input-clean" v-model="chapterForm.name" placeholder="e.g. Chapter 1: Introduction to Trees" required />
            </div>

            <div class="form-group">
              <label>Description (Optional)</label>
              <textarea class="input-clean" v-model="chapterForm.description" rows="3" placeholder="Brief outline of topics covered"></textarea>
            </div>
          </div>

          <div class="modal-footer-clean">
            <button type="button" class="btn-secondary-clean" @click="closeChapterModal">
              Cancel
            </button>
            <button type="submit" class="btn-primary-clean">
              {{ isEditMode ? 'Save Changes' : 'Create Chapter' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  BookOpen, Layers, Search, Plus, Edit2, Trash2, X, 
  ChevronDown, ChevronUp, Maximize2, Minimize2 
} from 'lucide-vue-next';

export default {
  name: "AdminDashboard",
  components: {
    BookOpen, Layers, Search, Plus, Edit2, Trash2, X,
    ChevronDown, ChevronUp, Maximize2, Minimize2
  },
  data() {
    return {
      subjects: [],
      expandedSubjectIds: [],
      showChapterModal: false,
      loading: true,
      isEditMode: false,
      searchQuery: '',
      chapterForm: {
        id: null,
        name: "",
        description: "",
        subject_id: null,
      },
      currentSubject: null,
    };
  },
  computed: {
    totalChaptersCount() {
      return this.subjects.reduce((acc, s) => acc + (s.chapters?.length || 0), 0);
    },
    allExpanded() {
      return this.filteredSubjects.length > 0 && 
        this.filteredSubjects.every(s => this.expandedSubjectIds.includes(s.id));
    },
    filteredSubjects() {
      const query = this.searchQuery.toLowerCase().trim();
      if (!query) return this.subjects;
      return this.subjects.filter(subject => {
        if (subject.name.toLowerCase().includes(query)) return true;
        if (subject.chapters && Array.isArray(subject.chapters)) {
          return subject.chapters.some(
            chapter => chapter.name && chapter.name.toLowerCase().includes(query)
          );
        }
        return false;
      });
    }
  },
  watch: {
    searchQuery(newVal) {
      if (newVal.trim()) {
        // Automatically expand matching subjects when searching
        this.expandedSubjectIds = this.filteredSubjects.map(s => s.id);
      }
    }
  },
  created() {
    this.fetchSubjects();
  },
  methods: {
    isSubjectExpanded(subjectId) {
      return this.expandedSubjectIds.includes(subjectId);
    },
    toggleSubject(subjectId) {
      const idx = this.expandedSubjectIds.indexOf(subjectId);
      if (idx > -1) {
        this.expandedSubjectIds.splice(idx, 1);
      } else {
        this.expandedSubjectIds.push(subjectId);
      }
    },
    toggleExpandAll() {
      if (this.allExpanded) {
        this.expandedSubjectIds = [];
      } else {
        this.expandedSubjectIds = this.filteredSubjects.map(s => s.id);
      }
    },
    async fetchSubjects() {
      this.loading = true;
      try {
        const res = await fetch("http://127.0.0.1:5000/api/subject");
        const subjects = await res.json();
        
        for (const subject of subjects) {
          const chapRes = await fetch(`http://127.0.0.1:5000/api/chapter?subject_id=${subject.id}`);
          if (chapRes.ok) {
            subject.chapters = await chapRes.json();
          } else {
            subject.chapters = [];
          }
        }
        this.subjects = subjects;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    openAddChapterModal(subject) {
      this.isEditMode = false;
      this.chapterForm = {
        id: null,
        name: "",
        description: "",
        subject_id: subject.id,
      };
      this.currentSubject = subject;
      this.showChapterModal = true;
    },
    openEditChapterModal(subject, chapter) {
      this.isEditMode = true;
      this.chapterForm = {
        id: chapter.id,
        name: chapter.name,
        description: chapter.description,
        subject_id: subject.id,
      };
      this.currentSubject = subject;
      this.showChapterModal = true;
    },
    closeChapterModal() {
      this.showChapterModal = false;
      this.chapterForm = { id: null, name: "", description: "", subject_id: null };
      this.currentSubject = null;
    },
    async submitChapterForm() {
      try {
        if (this.isEditMode) {
          const res = await fetch("http://127.0.0.1:5000/api/chapter", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: this.chapterForm.id,
              name: this.chapterForm.name,
              description: this.chapterForm.description,
            }),
          });
          if (!res.ok) {
            alert("Failed to update chapter.");
            return;
          }
        } else {
          const res = await fetch("http://127.0.0.1:5000/api/chapter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subject_id: this.chapterForm.subject_id,
              name: this.chapterForm.name,
              description: this.chapterForm.description,
            }),
          });
          if (!res.ok) {
            alert("Failed to add chapter.");
            return;
          }
        }
        // Auto-expand the subject after adding chapter
        if (this.currentSubject && !this.expandedSubjectIds.includes(this.currentSubject.id)) {
          this.expandedSubjectIds.push(this.currentSubject.id);
        }
        await this.fetchSubjects();
        this.closeChapterModal();
      } catch (err) {
        alert("Failed to save chapter.");
      }
    },
    async deleteChapter(chapterId) {
      if (!confirm("Are you sure you want to delete this chapter?")) return;
      try {
        const res = await fetch("http://127.0.0.1:5000/api/chapter", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: chapterId }),
        });
        if (res.ok) {
          await this.fetchSubjects();
        } else {
          alert("Failed to delete chapter.");
        }
      } catch (err) {
        alert("Failed to delete chapter.");
      }
    },
  }
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
  align-items: center;
  gap: 12px;
}

.search-input-wrap {
  position: relative;
  width: 260px;
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
  margin-bottom: 28px;
  max-width: 540px;
}

/* Subject Cards Grid */
.subject-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
  align-items: start;
}

.subject-card-clean {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-fast);
  overflow: hidden;
}

.subject-card-clean:hover {
  box-shadow: var(--shadow-md);
  border-color: #cbd5e1;
}

.subject-card-clean.is-expanded {
  border-color: var(--primary-border);
  box-shadow: var(--shadow-md);
}

.subject-card-main {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.subject-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.subject-badge-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.subject-title {
  font-size: 1.3rem;
  margin: 0 0 6px;
  color: var(--text-main);
  line-height: 1.3;
}

.subject-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 18px;
  flex: 1;
}

.subject-card-footer {
  padding-top: 14px;
  border-top: 1px solid var(--border-light);
}

.btn-expand-chapters {
  width: 100%;
  padding: 9px 14px;
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-main);
  font-family: inherit;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all var(--transition-fast);
}

.btn-expand-chapters:hover {
  background: var(--primary-light);
  border-color: var(--primary-border);
  color: var(--primary);
}

.chevron-icon {
  transition: transform var(--transition-fast);
}

/* Collapsible Drawer */
.chapters-drawer {
  background: #f8fafc;
  border-top: 1px solid var(--border-color);
  animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.drawer-inner {
  padding: 18px 24px 22px;
}

.drawer-lbl {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.empty-chapter-box {
  padding: 24px 16px;
  background: #ffffff;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
}

.chapters-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chapter-row-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.chapter-row-item:hover {
  border-color: #cbd5e1;
  background: #ffffff;
  box-shadow: var(--shadow-xs);
}

.chapter-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.chapter-index {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chapter-text-group {
  min-width: 0;
}

.chapter-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-main);
  display: block;
}

.chapter-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.chapter-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
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

.btn-add-chapter-dashed {
  width: 100%;
  padding: 9px;
  background: transparent;
  border: 1px dashed var(--primary-border);
  border-radius: var(--radius-md);
  color: var(--primary);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all var(--transition-fast);
  margin-top: 4px;
}

.btn-add-chapter-dashed:hover {
  background: var(--primary-light);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.font-sm { font-size: 0.82rem; }
</style>
