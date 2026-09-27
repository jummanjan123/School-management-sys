# Hostinger Deployment Guide for Smart School Management System

This comprehensive guide details how to deploy the **Smart School Management System** on a shared Hostinger PHP + MySQL web hosting account (or any cPanel / DirectAdmin host).

---

## 📋 System Prerequisites on Hostinger
- **PHP Version:** PHP 8.0, 8.1, 8.2, or 8.3+
- **MySQL Version:** MySQL 5.7+ or MariaDB 10.3+
- **PHP Extensions:** `pdo_mysql`, `mbstring`, `fileinfo`, `gd`, `openssl`, `session` (enabled by default on Hostinger)
- **Web Server:** Apache or LiteSpeed (supports `.htaccess`)

---

## 🚀 Step-by-Step Deployment Procedure

### Step 1: Create MySQL Database in Hostinger hPanel
1. Log in to your **Hostinger Control Panel (hPanel)**.
2. Navigate to **Databases** → **Management**.
3. Under **Create a New MySQL Database and Database User**:
   - **MySQL Database Name:** e.g., `u123456789_school`
   - **MySQL Username:** e.g., `u123456789_admin`
   - **Password:** Enter a strong password (e.g., `SchoolSecure#2026!`)
4. Click **Create**.
5. Save the generated Database Name, Database Username, and Password for Step 4.

---

### Step 2: Import `database.sql` via phpMyAdmin
1. In hPanel, under the **List of Current MySQL Databases And Users**, locate your new database.
2. Click **Enter phpMyAdmin**.
3. Click on your database name in the left sidebar.
4. Click on the **Import** tab at the top.
5. Under **File to import**, click **Choose File** and select `database/database.sql` from this release.
6. Ensure Format is set to **SQL**.
7. Click the **Go** button at the bottom.
8. Verify that all 17 tables (`schools`, `users`, `teachers`, `students`, `staff`, `inventory`, `classes`, `subjects`, `fees`, `fee_payments`, etc.) are created successfully.

---

### Step 3: Upload Files to `public_html`
1. In hPanel, go to **Files** → **File Manager** (or connect via FTP like FileZilla).
2. Open the `public_html` directory (or your chosen subdomain directory, e.g. `school.yourdomain.com`).
3. Upload all the files and folders from this project so that `index.php` sits directly inside `public_html/`.
4. Ensure the following directory structure exists:
   ```text
   public_html/
   ├── config/
   │   └── database.php
   ├── includes/
   │   ├── auth.php
   │   ├── csrf.php
   │   ├── footer.php
   │   ├── functions.php
   │   ├── header.php
   │   └── sidebar.php
   ├── database/
   │   └── database.sql
   ├── uploads/
   │   ├── students/
   │   ├── teachers/
   │   ├── staff/
   │   ├── inventory/
   │   ├── logos/
   │   ├── signatures/
   │   └── stamps/
   ├── .htaccess
   ├── index.php
   ├── login.php
   ├── register.php
   ├── logout.php
   ├── dashboard.php
   ├── universal_add.php
   ├── teachers.php
   ├── teacher_view.php
   ├── students.php
   ├── student_view.php
   ├── staff.php
   ├── inventory.php
   ├── student_attendance.php
   ├── teacher_attendance.php
   ├── staff_attendance.php
   ├── attendance_report.php
   ├── fees.php
   ├── collect_fee.php
   ├── fee_history.php
   ├── pending_fees.php
   ├── fee_receipt.php
   ├── id_cards.php
   ├── character_certificate.php
   ├── leaving_certificate.php
   ├── reports.php
   └── settings.php
   ```

---

### Step 4: Configure `config/database.php`
1. In Hostinger File Manager, navigate to `config/database.php` and click **Edit**.
2. Update the credentials with the values created in Step 1:
   ```php
   define('DB_HOST', 'localhost'); // Hostinger uses 'localhost'
   define('DB_NAME', 'u123456789_school');
   define('DB_USER', 'u123456789_admin');
   define('DB_PASS', 'YourActualPasswordHere');
   ```
3. Save the file.

---

### Step 5: Configure Folder Permissions (`chmod`)
1. In File Manager, right-click on the `uploads/` folder.
2. Select **Permissions** (or `chmod`).
3. Set permissions to `755` (or `775` if required by your PHP handler). Ensure permissions apply recursively to all child directories (`students`, `teachers`, `staff`, `logos`, etc.).

---

### Step 6: Enable Free SSL / HTTPS in Hostinger
1. In hPanel, go to **Security** → **SSL**.
2. Click **Install SSL** on your domain or subdomain.
3. Turn on **Force HTTPS** to ensure secure session cookies and encrypted credential transmission.

---

### Step 7: Verification & Testing
1. **Multi-School Registration Test:**
   - Visit `https://yourdomain.com/register.php`.
   - Register a school name (e.g., *Hjamia Model School*), choose a login name (e.g., `hjamiaschool`), and enter a secure password.
   - Confirm that the system creates the school record and automatically redirects to `login.php`.
2. **Multi-Device Login Test:**
   - On a phone or another laptop, open the same URL `https://yourdomain.com/login.php`.
   - Enter `hjamiaschool` and password.
   - Confirm that you are logged into the same synchronized database.
3. **Core Feature Verification:**
   - Go to **Universal Add** and register a Student and a Teacher.
   - Mark **Student Attendance** and verify percentage changes.
   - Go to **Collect Fee**, receive a payment, and print the generated **Fee Receipt**.
   - Check **PVC ID Cards** (Yellow for student, Blue for teacher).
   - Test **Character Certificate** and **School Leaving Certificate** printouts.
