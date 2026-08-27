<template>
  <div id="app" class="app-wrapper">
    <!-- Top Navigation Bar -->
    <header class="app-header">
      <div class="header-container">
        <div class="header-left">
          <router-link to="/" class="brand-link">
            <div class="brand-badge">
              <Sparkles class="brand-icon" size="18" />
            </div>
            <span class="brand-text">QuizMaster<span class="brand-dot">.</span></span>
          </router-link>

          <span v-if="isAuthenticated" class="role-chip" :class="userRole">
            {{ userRole === 'admin' ? 'Administrator' : 'Student' }}
          </span>
        </div>

        <button class="mobile-toggle" @click="toggleMobileMenu" aria-label="Toggle menu">
          <Menu v-if="!isMobileMenuOpen" size="20" />
          <X v-else size="20" />
        </button>

        <div class="header-right" :class="{ 'mobile-active': isMobileMenuOpen }">
          <template v-if="isAuthenticated">
            <div class="user-profile-chip">
              <div class="avatar-circle">
                {{ userInitial }}
              </div>
              <div class="user-meta">
                <span class="user-name">{{ userName }}</span>
                <span class="user-status-pill">Active</span>
              </div>
            </div>

            <button class="btn-logout" @click="handleLogout">
              <LogOut size="16" />
              <span>Sign out</span>
            </button>
          </template>

          <template v-else>
            <router-link to="/login" class="btn-login-clean">
              Sign In
            </router-link>
            <router-link to="/signup" class="btn-primary-clean">
              Get Started
            </router-link>
          </template>
        </div>
      </div>
    </header>

    <!-- Body Layout with Sidebar -->
    <div class="app-body">
      <!-- Authenticated Sidebar -->
      <aside v-if="isAuthenticated" class="app-sidebar" :class="{ 'sidebar-open': isMobileMenuOpen }">
        <div class="sidebar-section-title">Navigation</div>
        
        <!-- Admin Navigation -->
        <nav v-if="userRole === 'admin'" class="sidebar-nav">
          <router-link class="nav-item" to="/subject" @click="closeMobileMenu">
            <div class="nav-item-icon"><BookOpen size="18" /></div>
            <span class="nav-item-text">Subjects</span>
          </router-link>
          <router-link class="nav-item" to="/admin-dashboard" @click="closeMobileMenu">
            <div class="nav-item-icon"><Layers size="18" /></div>
            <span class="nav-item-text">Chapters</span>
          </router-link>
          <router-link class="nav-item" to="/quiz-management" @click="closeMobileMenu">
            <div class="nav-item-icon"><HelpCircle size="18" /></div>
            <span class="nav-item-text">Quiz Manager</span>
          </router-link>
          <router-link class="nav-item" to="/users" @click="closeMobileMenu">
            <div class="nav-item-icon"><Users size="18" /></div>
            <span class="nav-item-text">Students</span>
          </router-link>
          <router-link class="nav-item" to="/admin-summary" @click="closeMobileMenu">
            <div class="nav-item-icon"><BarChart2 size="18" /></div>
            <span class="nav-item-text">Analytics</span>
          </router-link>
        </nav>

        <!-- User / Student Navigation -->
        <nav v-else-if="userRole === 'user'" class="sidebar-nav">
          <router-link class="nav-item" to="/user-dashboard" @click="closeMobileMenu">
            <div class="nav-item-icon"><BookOpen size="18" /></div>
            <span class="nav-item-text">Explore Quizzes</span>
          </router-link>
          <button class="nav-item btn-nav-item" :class="{'router-link-active router-link-exact-active': isScoreActive}" @click="goToMyScore">
            <div class="nav-item-icon"><Trophy size="18" /></div>
            <span class="nav-item-text">My Scores</span>
          </button>
          <router-link class="nav-item" to="/user-summary" @click="closeMobileMenu">
            <div class="nav-item-icon"><BarChart2 size="18" /></div>
            <span class="nav-item-text">Performance</span>
          </router-link>
        </nav>

        <div class="sidebar-footer">
          <div class="support-card">
            <div class="support-icon"><Sparkles size="16" /></div>
            <div class="support-content">
              <div class="support-title">QuizMaster 2.0</div>
              <div class="support-subtitle">Minimal Light Edition</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Router View Area -->
      <main class="app-main-content" :class="{ 'with-sidebar': isAuthenticated }">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { 
  Sparkles, Menu, X, BarChart2, LogOut, 
  BookOpen, Layers, HelpCircle, Users, Trophy
} from 'lucide-vue-next';

export default {
  name: 'App',
  components: {
    Sparkles, Menu, X, BarChart2, LogOut,
    BookOpen, Layers, HelpCircle, Users, Trophy
  },
  data() {
    return {
      isMobileMenuOpen: false
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'userRole']),
    userId() {
      return this.$store.state.user?.id || null;
    },
    userName() {
      return this.$store.state.user?.username || (this.userRole === 'admin' ? 'Admin' : 'Student');
    },
    userInitial() {
      return this.userName ? this.userName.charAt(0).toUpperCase() : 'U';
    },
    isScoreActive() {
      return (
        this.$route.name === 'UserScore' &&
        this.$route.params.userId &&
        String(this.$route.params.userId) === String(this.userId)
      );
    },
  },
  watch: {
    $route() {
      this.closeMobileMenu();
    }
  },
  methods: {
    ...mapActions(['logout']),
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    },
    goToMyScore() {
      this.closeMobileMenu();
      if (!this.userId) {
        this.$router.push('/login');
        return;
      }
      this.$router.push({ name: 'UserScore', params: { userId: this.userId } });
    },
    handleLogout() {
      this.closeMobileMenu();
      this.logout();
      this.$router.push('/login');
    }
  },
};
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-canvas);
}

/* Header */
.app-header {
  height: 64px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
}

.header-container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.brand-badge {
  width: 34px;
  height: 34px;
  background: #0f172a;
  color: #ffffff;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.03em;
}

.brand-dot {
  color: var(--primary);
}

.role-chip {
  padding: 3px 9px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.role-chip.admin {
  background: var(--violet-light);
  color: var(--violet);
  border: 1px solid var(--violet-border);
}

.role-chip.user {
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid var(--primary-border);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-profile-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px 4px 4px;
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
}

.avatar-circle {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: #0f172a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.1;
}

.user-status-pill {
  font-size: 0.65rem;
  color: var(--success);
  font-weight: 600;
}

.btn-logout {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  border-radius: var(--radius-md);
  padding: 7px 12px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all var(--transition-fast);
}

.btn-logout:hover {
  background: var(--danger-light);
  border-color: var(--danger-border);
  color: var(--danger);
}

.btn-login-clean {
  color: var(--text-main);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.btn-login-clean:hover {
  background: #f1f5f9;
}

.mobile-toggle {
  display: none;
  background: transparent;
  border: none;
  color: var(--text-main);
  cursor: pointer;
  padding: 6px;
}

/* Body & Sidebar */
.app-body {
  display: flex;
  flex: 1;
}

.app-sidebar {
  width: 240px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  flex-shrink: 0;
}

.sidebar-section-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-light);
  letter-spacing: 0.06em;
  padding: 0 12px 10px 12px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 12px;
  color: var(--text-body);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-size: 0.88rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.btn-nav-item {
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
}

.nav-item-icon {
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-fast);
}

.nav-item:hover {
  background: #f1f5f9;
  color: var(--text-main);
}

.nav-item:hover .nav-item-icon {
  color: var(--text-main);
}

.nav-item.router-link-active,
.nav-item.router-link-exact-active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 600;
}

.nav-item.router-link-active .nav-item-icon,
.nav-item.router-link-exact-active .nav-item-icon {
  color: var(--primary);
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.support-card {
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.support-icon {
  width: 28px;
  height: 28px;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.support-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-main);
}

.support-subtitle {
  font-size: 0.68rem;
  color: var(--text-muted);
}

/* Main Content */
.app-main-content {
  flex: 1;
  min-width: 0;
  background-color: var(--bg-canvas);
}

/* Mobile Responsive */
@media (max-width: 868px) {
  .mobile-toggle {
    display: block;
  }

  .header-right {
    display: none;
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border-color);
    padding: 16px 24px;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    box-shadow: var(--shadow-md);
  }

  .header-right.mobile-active {
    display: flex;
  }

  .app-sidebar {
    display: none;
    position: fixed;
    top: 64px;
    left: 0;
    bottom: 0;
    width: 260px;
    z-index: 40;
    box-shadow: var(--shadow-xl);
  }

  .app-sidebar.sidebar-open {
    display: flex;
  }
}
</style>
