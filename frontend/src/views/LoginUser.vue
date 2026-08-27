<template>
  <div class="auth-page-container">
    <div class="auth-card-clean">
      <div class="auth-header text-center">
        <div class="auth-logo-badge">
          <Sparkles class="text-primary-color" size="22" />
        </div>
        <h2>Welcome back</h2>
        <p class="text-muted-color">Sign in to your QuizMaster account to continue.</p>
      </div>

      <!-- 1-Click Demo Login Bar -->
      <div class="demo-quick-fill">
        <div class="quick-fill-title">⚡ Quick Fill Demo Credentials:</div>
        <div class="quick-fill-chips">
          <button type="button" class="chip-btn admin" @click="fillCredentials('admin', 'admin')">
            <Shield size="13" /> Admin (admin / admin)
          </button>
          <button type="button" class="chip-btn user" @click="fillCredentials('jashan', 'password123')">
            <User size="13" /> Student (jashan / password123)
          </button>
        </div>
      </div>

      <form @submit.prevent="loginUser" class="auth-form">
        <div v-if="error" class="error-banner">
          <AlertCircle size="16" class="mr-2 flex-shrink-0" />
          <span>{{ error }}</span>
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <div class="input-wrap">
            <User class="input-icon" size="18" />
            <input 
              type="text" 
              id="username" 
              class="input-clean pl-input" 
              v-model="username" 
              placeholder="Enter your username" 
              required 
            />
          </div>
        </div>

        <div class="form-group">
          <div class="flex-between mb-1">
            <label for="password" class="m-0">Password</label>
          </div>
          <div class="input-wrap">
            <Lock class="input-icon" size="18" />
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              class="input-clean pl-input pr-input" 
              v-model="password" 
              placeholder="Enter your password" 
              required 
            />
            <button type="button" class="eye-toggle-btn" @click="showPassword = !showPassword">
              <EyeOff v-if="showPassword" size="16" />
              <Eye v-else size="16" />
            </button>
          </div>
        </div>

        <button type="submit" class="btn-primary-clean w-100 btn-auth" :disabled="loading">
          <span v-if="loading" class="spinner-sm mr-2"></span>
          <LogIn v-else class="mr-2" size="18" />
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

        <div class="auth-footer text-center">
          <span class="text-muted-color">Don't have an account?</span>
          <router-link to="/signup" class="link-clean">Create account</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { Sparkles, User, Lock, Eye, EyeOff, LogIn, AlertCircle, Shield } from 'lucide-vue-next';

export default {
  name: "LoginUser",
  components: {
    Sparkles, User, Lock, Eye, EyeOff, LogIn, AlertCircle, Shield
  },
  data() {
    return {
      username: '',
      password: '',
      error: '',
      loading: false,
      showPassword: false
    };
  },
  methods: {
    fillCredentials(u, p) {
      this.username = u;
      this.password = p;
      this.error = '';
    },
    async loginUser() {
      this.error = '';
      this.loading = true;
      try {
        const response = await axios.post('http://127.0.0.1:5000/api/login', {
          username: this.username,
          password: this.password,
        });

        const token = response.data.access_token;
        const user = response.data.user;

        this.$store.dispatch('login', { token, user });

        if (user && user.role === 'admin') {
          this.$router.push('/admin-dashboard');
        } else {
          this.$router.push('/user-dashboard');
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Invalid credentials. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.auth-page-container {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: var(--bg-canvas);
}

.auth-card-clean {
  width: 100%;
  max-width: 440px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 36px 32px;
}

.auth-header {
  margin-bottom: 24px;
}

.auth-logo-badge {
  width: 48px;
  height: 48px;
  background: var(--primary-light);
  border: 1px solid var(--primary-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.auth-header h2 {
  font-size: 1.6rem;
  margin-bottom: 6px;
}

.demo-quick-fill {
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-bottom: 24px;
}

.quick-fill-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}

.quick-fill-chips {
  display: flex;
  gap: 8px;
  flex-direction: column;
}

.chip-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--transition-fast);
  text-align: left;
}

.chip-btn.admin {
  background: var(--violet-light);
  color: var(--violet);
  border-color: var(--violet-border);
}

.chip-btn.admin:hover {
  background: #ede9fe;
}

.chip-btn.user {
  background: var(--primary-light);
  color: var(--primary);
  border-color: var(--primary-border);
}

.chip-btn.user:hover {
  background: #e0e7ff;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.error-banner {
  padding: 12px 14px;
  background: var(--danger-light);
  border: 1px solid var(--danger-border);
  color: var(--danger-hover);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-light);
  pointer-events: none;
}

.pl-input {
  padding-left: 42px;
}

.pr-input {
  padding-right: 42px;
}

.eye-toggle-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 4px;
}

.eye-toggle-btn:hover {
  color: var(--text-main);
}

.btn-auth {
  padding: 12px;
  font-size: 0.95rem;
  margin-top: 4px;
}

.auth-footer {
  margin-top: 8px;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.link-clean {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.link-clean:hover {
  text-decoration: underline;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin { to { transform: rotate(360deg); } }

.w-100 { width: 100%; }
.mr-2 { margin-right: 0.5rem; }
.mb-1 { margin-bottom: 0.25rem; }
.m-0 { margin: 0; }
.flex-shrink-0 { flex-shrink: 0; }
</style>