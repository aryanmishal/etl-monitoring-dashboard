# Frontend Product Requirements Document

## ETL Monitoring Application - Frontend Component

---

## 1. Project Overview

### Current State
- **Version**: v2.5.0
- **Status**: Production Ready
- **Framework**: React 18.2.0 with Vite 5.1.0
- **Styling**: Tailwind CSS 3.4.1 + DaisyUI 5.0.43

### Core Features
- User authentication with password validation
- ETL process monitoring dashboard
- Real-time data visualization
- Responsive design for mobile/desktop
- Security features (password strength, required field indicators)
- 404 error handling

---

## 2. Technical Stack

### Core Technologies
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.1.0
- **Styling**: Tailwind CSS 3.4.1 + DaisyUI 5.0.43
- **UI Components**: Material-UI 5.15.10
- **Routing**: React Router DOM 6.22.1
- **HTTP Client**: Axios 1.6.7
- **Testing**: Vitest + Playwright

### Key Dependencies
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.22.1",
  "axios": "^1.6.7",
  "tailwindcss": "^3.4.1",
  "daisyui": "^5.0.43",
  "@mui/material": "^5.15.10",
  "vitest": "^1.2.0",
  "playwright": "^1.40.0"
}
```

---

## 3. Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── CustomDatePicker.jsx
│   │   ├── CustomDropdown.jsx
│   │   ├── PasswordStrengthIndicator.jsx
│   │   └── UserTable.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Summary.jsx
│   │   ├── SyncStatus.jsx
│   │   ├── VitalsStatus.jsx
│   │   ├── Profile.jsx
│   │   ├── Settings.jsx
│   │   ├── Admin.jsx
│   │   ├── AdminLogin.jsx
│   │   └── NotFound.jsx
│   ├── utils/
│   │   ├── dateUtils.js
│   │   ├── passwordValidation.js
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 4. Implementation Tasks

### Task 1: Project Setup
- [ ] Initialize React project with Vite
- [ ] Install and configure Tailwind CSS and DaisyUI
- [ ] Set up React Router DOM for navigation
- [ ] Configure Axios for API communication
- [ ] Set up Vitest and Playwright for testing
- [ ] Create basic project structure and file organization

### Task 2: Authentication System
- [ ] Create Login page with form validation
- [ ] Implement JWT token storage (localStorage/sessionStorage)
- [ ] Create ForgotPassword page with multi-step flow
- [ ] Add session management and auto-logout on 401 errors
- [ ] Implement password validation with strength indicator
- [ ] Add required field indicators (red asterisks) to all forms

### Task 3: Navigation & Layout
- [ ] Create Navbar component with pill-shaped design
- [ ] Implement navigation buttons (Summary, Sync Status, Vitals)
- [ ] Add Profile menu in top-right corner
- [ ] Style admin/user labels with yellow accent
- [ ] Implement responsive design for mobile/desktop

### Task 4: Core Pages Implementation
- [ ] Build Summary page with daily/weekly/monthly views
- [ ] Implement CustomDatePicker component
- [ ] Add date navigation controls (previous/next buttons)
- [ ] Create SyncStatus page with data table and filters
- [ ] Build VitalsStatus page with metrics display
- [ ] Implement CustomDropdown component for filters

### Task 5: User Management
- [ ] Create Profile page for user settings
- [ ] Build Settings page with custom dropdowns
- [ ] Implement AdminLogin page with yellow accent
- [ ] Create Admin panel for user management
- [ ] Add UserTable component for admin interface

### Task 6: Security & Accessibility Features
- [ ] Implement password validation utility (passwordValidation.js)
- [ ] Create PasswordStrengthIndicator component
- [ ] Add required field indicators to all forms
- [ ] Build 404 NotFound page with navigation
- [ ] Implement search bar with trailing space handling
- [ ] Add form accessibility features (keyboard navigation, screen reader support)

### Task 7: Data Integration
- [ ] Set up API client with Axios
- [ ] Implement data fetching for all pages
- [ ] Add loading states and error handling
- [ ] Implement pagination for data tables
- [ ] Add search functionality with proper trimming
- [ ] Create export functionality for data

### Task 8: UI/UX Polish
- [ ] Implement consistent hover effects and transitions
- [ ] Add focus states for accessibility
- [ ] Ensure color contrast meets WCAG standards
- [ ] Optimize for mobile responsiveness
- [ ] Add loading spinners and progress indicators

### Task 9: Testing Implementation
- [ ] Write unit tests with Vitest for all components
- [ ] Create E2E tests with Playwright for critical flows
- [ ] Test password validation functionality
- [ ] Test form accessibility features
- [ ] Test responsive design on different screen sizes

### Task 10: Production Readiness
- [ ] Optimize bundle size and performance
- [ ] Add error boundaries for crash handling
- [ ] Implement proper logging and monitoring
- [ ] Create comprehensive documentation
- [ ] Set up CI/CD pipeline for deployment

---

## 5. Component Specifications

### Authentication Components
- **Login.jsx**: Form with email/password, validation, error handling
- **ForgotPassword.jsx**: Multi-step password reset flow
- **PasswordStrengthIndicator.jsx**: Real-time password strength feedback

### Navigation Components
- **Navbar.jsx**: Pill-shaped navigation with profile menu
- **CustomDatePicker.jsx**: Date selection with highlighting
- **CustomDropdown.jsx**: Custom dropdown with search/filter options

### Data Display Components
- **Summary.jsx**: Dashboard with daily/weekly/monthly views
- **SyncStatus.jsx**: Data table with filtering and pagination
- **VitalsStatus.jsx**: Metrics display with filtering
- **UserTable.jsx**: Admin user management table

### Admin Components
- **Admin.jsx**: User management interface
- **AdminLogin.jsx**: Admin authentication
- **Profile.jsx**: User profile management
- **Settings.jsx**: Application settings

---

## 6. API Integration

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/refresh` - Token refresh

### Data Endpoints
- `GET /api/summary` - Summary data (daily)
- `GET /api/summary/weekly` - Weekly summary
- `GET /api/summary/monthly` - Monthly summary
- `GET /api/sync-status` - Sync status data
- `GET /api/user-vitals` - User vitals data
- `GET /api/user-settings` - User settings

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user

---

## 7. Security Requirements

### Password Validation
- Minimum 8 characters, maximum 128
- Require uppercase, lowercase, numbers, special characters
- Block common passwords and sequential patterns
- Real-time client-side validation with visual feedback

### Form Security
- Required field indicators (red asterisks)
- Input sanitization and validation
- Secure error handling without information leakage
- CSRF protection and XSS prevention

### Session Management
- JWT token storage with expiration handling
- Automatic logout on authentication errors
- Secure token refresh mechanism
- Session timeout after 60 minutes

---

## 8. Accessibility Requirements

### WCAG 2.1 AA Compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratio 4.5:1 minimum
- Focus indicators for all interactive elements
- Semantic HTML structure

### Form Accessibility
- Clear labels and field descriptions
- Required field indicators
- Error messages with clear instructions
- Success feedback for completed actions

---

## 9. Performance Requirements

### Loading Times
- Initial page load: < 3 seconds
- API response time: < 2 seconds
- Time to interactive: < 5 seconds
- Mobile performance: Optimized for 3G networks

### Optimization
- Code splitting for route-based chunks
- Lazy loading for non-critical components
- Image optimization and compression
- Caching strategies for API responses

---

## 10. Testing Strategy

### Unit Testing (Vitest)
- Component rendering and behavior
- Utility function testing
- Form validation logic
- API integration testing

### E2E Testing (Playwright)
- User authentication flows
- Data navigation and filtering
- Admin user management
- Error handling scenarios

### Accessibility Testing
- Keyboard navigation testing
- Screen reader compatibility
- Color contrast validation
- Focus management testing

---

## 11. Deployment Requirements

### Build Configuration
- Vite build optimization
- Environment variable management
- Static asset optimization
- Bundle size analysis

### Production Setup
- HTTPS configuration
- CDN integration for static assets
- Error monitoring and logging
- Performance monitoring

---

*This PRD provides comprehensive implementation guidance for recreating the ETL Monitoring Frontend application. Each task includes specific technical requirements and can be executed sequentially to build the complete system.* 