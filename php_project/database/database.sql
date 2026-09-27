-- ====================================================
-- SMART SCHOOL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Production MySQL Schema for Hostinger / cPanel
-- Multi-Tenant Architecture with school_id isolation
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ====================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Table: schools
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `schools` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_uuid` VARCHAR(64) NOT NULL UNIQUE,
  `name` VARCHAR(191) NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `head_name` VARCHAR(100) DEFAULT 'Principal',
  `academic_session` VARCHAR(50) DEFAULT '2025-2026',
  `urdu_slogan` VARCHAR(255) DEFAULT 'تعلیم روشنی ہے، کردار کامیابی کی پہچان ہے',
  `logo_path` VARCHAR(255) DEFAULT NULL,
  `signature_path` VARCHAR(255) DEFAULT NULL,
  `stamp_path` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_school_username` (`username`),
  INDEX `idx_school_uuid` (`school_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: users (Administrators & Staff Logins)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `role` ENUM('head_admin', 'admin', 'accountant', 'teacher') DEFAULT 'head_admin',
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `last_login` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_school_username` (`school_id`, `username`),
  INDEX `idx_user_school` (`school_id`),
  CONSTRAINT `fk_users_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: classes
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `classes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `numeric_order` INT DEFAULT 1,
  `monthly_fee` DECIMAL(10,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_school_class` (`school_id`, `name`),
  INDEX `idx_classes_school` (`school_id`),
  CONSTRAINT `fk_classes_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: subjects
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(50) DEFAULT NULL,
  `class_id` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_subjects_school` (`school_id`),
  CONSTRAINT `fk_subjects_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_subjects_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: teachers
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `teacher_code` VARCHAR(50) NOT NULL,
  `employee_id` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `father_name` VARCHAR(150) DEFAULT NULL,
  `gender` ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
  `qualification` VARCHAR(150) DEFAULT NULL,
  `cnic` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `mobile_number` VARCHAR(50) NOT NULL,
  `marital_status` ENUM('Single', 'Married', 'Divorced', 'Widowed') DEFAULT 'Single',
  `date_of_birth` DATE DEFAULT NULL,
  `date_of_enrolment` DATE DEFAULT NULL,
  `teaching_level` ENUM('Primary', 'Middle', 'High') DEFAULT 'Primary',
  `subject` VARCHAR(100) DEFAULT NULL,
  `designation` VARCHAR(100) DEFAULT 'Teacher',
  `emergency_contact` VARCHAR(50) DEFAULT NULL,
  `salary` DECIMAL(10,2) DEFAULT 0.00,
  `photo_path` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_school_teacher_code` (`school_id`, `teacher_code`),
  UNIQUE KEY `uniq_school_emp_id` (`school_id`, `employee_id`),
  INDEX `idx_teachers_school` (`school_id`),
  INDEX `idx_teachers_name` (`full_name`),
  CONSTRAINT `fk_teachers_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: students
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `student_code` VARCHAR(50) NOT NULL,
  `student_name` VARCHAR(150) NOT NULL,
  `father_name` VARCHAR(150) NOT NULL,
  `mother_name` VARCHAR(150) DEFAULT NULL,
  `father_mobile` VARCHAR(50) NOT NULL,
  `roll_number` VARCHAR(50) NOT NULL,
  `class_name` VARCHAR(100) NOT NULL,
  `section` VARCHAR(50) DEFAULT 'A',
  `admission_number` VARCHAR(50) NOT NULL,
  `admission_date` DATE NOT NULL,
  `date_of_birth` DATE DEFAULT NULL,
  `gender` ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
  `address` TEXT DEFAULT NULL,
  `previous_school` VARCHAR(191) DEFAULT NULL,
  `guardian_name` VARCHAR(150) DEFAULT NULL,
  `guardian_contact` VARCHAR(50) DEFAULT NULL,
  `monthly_fee` DECIMAL(10,2) DEFAULT 0.00,
  `photo_path` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('Active', 'Inactive', 'Left', 'Graduated') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_school_adm_no` (`school_id`, `admission_number`),
  UNIQUE KEY `uniq_school_student_code` (`school_id`, `student_code`),
  INDEX `idx_students_school` (`school_id`),
  INDEX `idx_students_class` (`school_id`, `class_name`),
  INDEX `idx_students_name` (`student_name`),
  INDEX `idx_students_roll` (`roll_number`),
  CONSTRAINT `fk_students_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: staff (Other Non-Teaching Staff)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `staff` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `staff_code` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `father_name` VARCHAR(150) DEFAULT NULL,
  `photo_path` VARCHAR(255) DEFAULT NULL,
  `cnic` VARCHAR(50) DEFAULT NULL,
  `mobile` VARCHAR(50) NOT NULL,
  `address` TEXT DEFAULT NULL,
  `date_of_birth` DATE DEFAULT NULL,
  `date_of_joining` DATE DEFAULT NULL,
  `designation` VARCHAR(100) NOT NULL,
  `salary` DECIMAL(10,2) DEFAULT 0.00,
  `emergency_contact` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('Active', 'Inactive') DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_school_staff_code` (`school_id`, `staff_code`),
  INDEX `idx_staff_school` (`school_id`),
  INDEX `idx_staff_name` (`full_name`),
  CONSTRAINT `fk_staff_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: inventory
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `item_code` VARCHAR(50) NOT NULL,
  `item_name` VARCHAR(191) NOT NULL,
  `item_category` VARCHAR(100) NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `unit` VARCHAR(50) DEFAULT 'Pcs',
  `purchase_price` DECIMAL(10,2) DEFAULT 0.00,
  `total_value` DECIMAL(12,2) DEFAULT 0.00,
  `purchase_date` DATE DEFAULT NULL,
  `supplier` VARCHAR(191) DEFAULT NULL,
  `item_condition` ENUM('New', 'Good', 'Damaged', 'Repair Required') DEFAULT 'Good',
  `location` VARCHAR(150) DEFAULT 'Main Store',
  `description` TEXT DEFAULT NULL,
  `photo_path` VARCHAR(255) DEFAULT NULL,
  `remarks` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_school_item_code` (`school_id`, `item_code`),
  INDEX `idx_inventory_school` (`school_id`),
  CONSTRAINT `fk_inventory_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: teacher_attendance
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `teacher_attendance` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `teacher_id` INT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Present', 'Absent', 'Leave') NOT NULL DEFAULT 'Present',
  `remarks` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_teacher_date` (`school_id`, `teacher_id`, `date`),
  INDEX `idx_t_att_school_date` (`school_id`, `date`),
  CONSTRAINT `fk_t_att_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_t_att_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: student_attendance
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `student_attendance` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Present', 'Absent', 'Leave') NOT NULL DEFAULT 'Present',
  `remarks` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_student_date` (`school_id`, `student_id`, `date`),
  INDEX `idx_s_att_school_date` (`school_id`, `date`),
  CONSTRAINT `fk_s_att_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_s_att_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: staff_attendance
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `staff_attendance` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `staff_id` INT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Present', 'Absent', 'Leave') NOT NULL DEFAULT 'Present',
  `remarks` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_staff_date` (`school_id`, `staff_id`, `date`),
  INDEX `idx_st_att_school_date` (`school_id`, `date`),
  CONSTRAINT `fk_st_att_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_st_att_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: fees (Monthly / Term Invoices)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fees` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `month` VARCHAR(20) NOT NULL,
  `year` INT UNSIGNED NOT NULL,
  `monthly_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `previous_balance` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `paid_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `remaining_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('PAID', 'PARTIAL', 'PENDING') NOT NULL DEFAULT 'PENDING',
  `due_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_fee_student_month_year` (`school_id`, `student_id`, `month`, `year`),
  INDEX `idx_fees_school` (`school_id`),
  INDEX `idx_fees_status` (`school_id`, `status`),
  CONSTRAINT `fk_fees_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fees_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: fee_payments (Individual Payment Transactions)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `fee_payments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `fee_id` INT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `receipt_no` VARCHAR(64) NOT NULL,
  `paid_amount` DECIMAL(10,2) NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'Cash',
  `payment_date` DATE NOT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `collected_by` VARCHAR(100) DEFAULT 'Admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_receipt_no` (`school_id`, `receipt_no`),
  INDEX `idx_fee_pay_school` (`school_id`),
  CONSTRAINT `fk_fee_pay_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fee_pay_fee` FOREIGN KEY (`fee_id`) REFERENCES `fees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fee_pay_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: certificates (Character & School Leaving)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `certificates` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `student_id` INT UNSIGNED NOT NULL,
  `certificate_type` ENUM('Character', 'Leaving') NOT NULL,
  `certificate_number` VARCHAR(64) NOT NULL,
  `issue_date` DATE NOT NULL,
  `statement` TEXT DEFAULT NULL,
  `reason_for_leaving` VARCHAR(255) DEFAULT NULL,
  `conduct` VARCHAR(100) DEFAULT 'Excellent',
  `remarks` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_cert_number` (`school_id`, `certificate_number`),
  INDEX `idx_cert_school` (`school_id`),
  CONSTRAINT `fk_cert_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cert_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: activity_logs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `record_type` VARCHAR(50) NOT NULL,
  `record_id` VARCHAR(50) DEFAULT NULL,
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_logs_school` (`school_id`),
  INDEX `idx_logs_date` (`created_at`),
  CONSTRAINT `fk_logs_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
