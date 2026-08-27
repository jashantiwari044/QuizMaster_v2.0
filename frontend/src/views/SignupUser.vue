<template>
  <div class="auth-page-container">
    <div class="auth-card-clean">
      <div class="auth-header text-center">
        <div class="auth-logo-badge emerald">
          <UserPlus class="text-success-color" size="22" />
        </div>
        <h2>Create an account</h2>
        <p class="text-muted-color">Join QuizMaster to test your knowledge and track your growth.</p>
      </div>

      <form @submit.prevent="signupUser" class="auth-form">
        <div v-if="error" class="error-banner">
          <AlertCircle size="16" class="mr-2 flex-shrink-0" />
          <span>{{ error }}</span>
        </div>

        <div v-if="successMsg" class="success-banner">
          <CheckCircle size="16" class="mr-2 flex-shrink-0" />
          <span>{{ successMsg }}</span>
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <div class="input-wrap">
            <User class="input-icon" size="18" />
            <input 
              type="text" 
              id="username" 
              class="input-clean pl-input" 
              v-model="form.username" 
              placeholder="Choose a username" 
              required 
            />
          </div>
        </div>

        <div class="form-group">
          <label for="email">Email address</label>
          <div class="input-wrap">
            <Mail class="input-icon" size="18" />
            <input 
              type="email" 
              id="email" 
              class="input-clean pl-input" 
              v-model="form.email" 
              placeholder="name@example.com" 
              required 
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrap">
            <Lock class="input-icon" size="18" />
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              class="input-clean pl-input pr-input" 
              v-model="form.password" 
              placeholder="Create a strong password" 
              required 
            />
            <button type="button" class="eye-toggle-btn" @click="showPassword = !showPassword">
              <EyeOff v-if="showPassword" size="16" />
              <Eye v-else size="16" />
            </button>
          </div>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label for="qualifications">Qualification</label>
            <div class="input-wrap">
              <GraduationCap class="input-icon" size="18" />
              <input 
                type="text" 
                id="qualifications" 
                class="input-clean pl-input" 
                v-model="form.qualifications" 
                placeholder="e.g. B.Tech" 
              />
            </div>
          </div>

          <div class="form-group">
            <label for="dob">Date of Birth</label>
            <div class="input-wrap">
              <Calendar class="input-icon" size="18" />
              <input 
                type="date" 
                id="dob" 
                class="input-clean pl-input" 
                v-model="form.dob" 
              />
            </div>
          </div>
        </div>

        <button type="submit" class="btn-primary-clean w-100 btn-auth" :disabled="loading">
          <span v-if="loading" class="spinner-sm mr-2"></span>
          <UserPlus v-else class="mr-2" size="18" />
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>

        <div class="auth-footer text-center">
          <span class="text-muted-color">Already have an account?</span>
          <router-link to="/login" class="link-clean">Sign in</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { UserPlus, User, Mail, Lock, GraduationCap, Calendar, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-vue-next';

export default {
  name: "SignupUser",
  components: {
    UserPlus, User, Mail, Lock, GraduationCap, Calendar, Eye, EyeOff, AlertCircle, CheckCircle
  },
  data() {
    return {
      form: {
        username: '',
        email: '',
        password: '',
        qualifications: '',
        dob: ''
      },
      error: '',
      successMsg: '',
      loading: false,
      showPassword: false
    };
  },
  methods: {
    async signupUser() {
      this.error = '';
      this.successMsg = '';
      this.loading = true;

      try {
        await axios.post('http://127.0.0.1:5000/api/signup', this.form);
        this.successMsg = 'Account created successfully! Redirecting to login...';
        setTimeout(() => {
          this.$router.push('/login');
        }, 1500);
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to create account. Please check your details.';
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
  max-width: 480px;
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

.auth-logo-badge.emerald {
  background: var(--success-light);
  border-color: var(--success-border);
}

.auth-header h2 {
  font-size: 1.6rem;
  margin-bottom: 6px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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

.success-banner {
  padding: 12px 14px;
  background: var(--success-light);
  border: 1px solid var(--success-border);
  color: var(--success-hover);
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
  margin-top: 6px;
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
.flex-shrink-0 { flex-shrink: 0; }

@media (max-width: 480px) {
  .form-grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>