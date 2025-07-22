# ETL Monitoring Application - User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Authentication](#user-authentication)
4. [Application Navigation](#application-navigation)
5. [Summary Page](#summary-page)
6. [Sync Status Page](#sync-status-page)
7. [Vitals Page](#vitals-page)
8. [Profile & Settings](#profile--settings)
9. [Admin Panel](#admin-panel)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)
12. [Support](#support)

## Introduction
The ETL Monitoring Application is a web-based dashboard for monitoring and managing ETL (Extract, Transform, Load) processes. It provides real-time analytics, user and admin management, and customizable settings for a tailored experience.

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Internet connection
- Valid user account (provided by an administrator)

### Accessing the Application
1. Open your web browser
2. Navigate to the application URL (default: http://localhost:5173)
3. You will be redirected to the login page if not authenticated

## User Authentication

### Login
1. Enter your username (email)
2. Enter your password
3. Click "Login"
4. You will be redirected to the Summary page upon successful login

### Password Reset
1. Click "Forgot Password" on the login page
2. Enter your registered email address
3. Follow the instructions to reset your password

*Note: User registration is managed by administrators. If you need an account, contact your admin.*

## Application Navigation

After logging in, use the navigation bar to access:
- **Summary**: View analytics and trends for ETL processes (daily, weekly, monthly)
- **Sync Status**: See the status of ETL sync operations for all users
- **Vitals**: Monitor user/system health metrics
- **Profile**: View and update your personal information (nickname, full name, password)
- **Settings**: Change your preferences (analytics logic, custom user count, theme)
- **Admin**: (If you have admin access) Manage users and system settings

## Summary Page
- View daily, weekly, or monthly analytics for ETL processes
- Use the date picker to select the period you want to analyze
- Switch between different views (daily/weekly/monthly)
- If you have custom user settings (e.g., custom user count), set them in Settings and see the analytics update accordingly

## Sync Status Page
- View the status of all ETL sync processes (available, missing)
- See historical sync data for all users
- Use pagination or filters to navigate records

## Vitals Page
- Monitor key health metrics for users and the system
- Quickly spot issues or bottlenecks in the ETL pipeline

## Profile & Settings
- **Profile**: Update your personal information (nickname, full name) and change your password
- **Settings**: Change your preferences, such as analytics logic (raw files or custom user count) and theme (light/dark)
- All changes are saved and applied to analytics and dashboard views

## Admin Panel
*For users with admin access only:*
- Manage user accounts (add, edit, or remove users)
- Access the Admin Login page to authenticate as an admin if required
- View and update system settings

## Troubleshooting

### Common Issues
1. **Login Problems**
   - Verify username and password
   - Check internet connection
   - Clear browser cache
   - Try incognito mode
2. **Session Expired / Auto-Logout**
   - The app will automatically log you out if your session expires or if authentication fails (global error handler)
   - Simply log in again to continue
3. **Process/Data Issues**
   - Check error messages
   - Verify data source availability
   - Contact your administrator if issues persist
4. **Performance Issues**
   - Clear browser cache
   - Check internet speed
   - Reduce data load
   - Contact support if persistent

### Getting Help
1. Check the FAQ section
2. Review error messages
3. Contact system administrator
4. Submit support ticket

## Best Practices
1. **Regular Monitoring**
   - Check the Summary and Sync Status pages regularly
   - Review error logs and system health metrics
2. **Data Management**
   - Ensure important data is backed up (admin responsibility)
   - Archive old processes as needed
3. **Security**
   - Use strong passwords
   - Log out after sessions
   - Report suspicious activities
   - Keep credentials secure

## Support
For additional support:
1. Check out Video Guide (https://www.loom.com/share/7ac894fe57304a76a1af7babf325cd3a?sid=c6761730-3e52-4857-bcbc-d3e5d9e683e5)
2. Contact system administrator
3. Submit support ticket
4. Email: aryanmishal@outlook.com

---