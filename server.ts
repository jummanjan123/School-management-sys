import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import JSZip from 'jszip';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure persistent data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'school_database.json');

// Interface types
interface School {
  id: number;
  school_uuid: string;
  name: string;
  username: string;
  password_hash: string;
  phone: string;
  email: string;
  address: string;
  head_name: string;
  academic_session: string;
  urdu_slogan: string;
  logo_path: string | null;
  signature_path: string | null;
  stamp_path: string | null;
  created_at: string;
}

interface DatabaseSchema {
  schools: School[];
  classes: any[];
  teachers: any[];
  students: any[];
  staff: any[];
  inventory: any[];
  student_attendance: any[];
  teacher_attendance: any[];
  staff_attendance: any[];
  fees: any[];
  fee_payments: any[];
  activity_logs: any[];
  sessions: { token: string; school_id: number; user_name: string; created_at: string }[];
}

// Initial Database Seeder
function getInitialDb(): DatabaseSchema {
  const defaultSalt = crypto.randomBytes(16).toString('hex');
  const defaultHash = crypto.scryptSync('admin123', defaultSalt, 64).toString('hex') + ':' + defaultSalt;

  const defaultSchool: School = {
    id: 1,
    school_uuid: 'SCH-HJAMIA-01',
    name: 'Hjamia Model High School',
    username: 'hjamiaschool',
    password_hash: defaultHash,
    phone: '0300-1234567',
    email: 'info@hjamiaschool.edu.pk',
    address: 'Campus 1, Education Boulevard, Lahore, Pakistan',
    head_name: 'Prof. Muhammad Tariq',
    academic_session: '2025-2026',
    urdu_slogan: 'تعلیم روشنی ہے، کردار کامیابی کی پہچان ہے',
    logo_path: null,
    signature_path: null,
    stamp_path: null,
    created_at: new Date().toISOString()
  };

  const defaultClasses = [
    { id: 1, school_id: 1, name: 'Play Group', numeric_order: 1, monthly_fee: 1500 },
    { id: 2, school_id: 1, name: 'Nursery', numeric_order: 2, monthly_fee: 1500 },
    { id: 3, school_id: 1, name: 'Prep', numeric_order: 3, monthly_fee: 1800 },
    { id: 4, school_id: 1, name: 'Class 1', numeric_order: 4, monthly_fee: 2000 },
    { id: 5, school_id: 1, name: 'Class 2', numeric_order: 5, monthly_fee: 2000 },
    { id: 6, school_id: 1, name: 'Class 3', numeric_order: 6, monthly_fee: 2200 },
    { id: 7, school_id: 1, name: 'Class 4', numeric_order: 7, monthly_fee: 2200 },
    { id: 8, school_id: 1, name: 'Class 5', numeric_order: 8, monthly_fee: 2500 },
    { id: 9, school_id: 1, name: 'Class 6', numeric_order: 9, monthly_fee: 2800 },
    { id: 10, school_id: 1, name: 'Class 7', numeric_order: 10, monthly_fee: 2800 },
    { id: 11, school_id: 1, name: 'Class 8', numeric_order: 11, monthly_fee: 3000 },
    { id: 12, school_id: 1, name: 'Class 9', numeric_order: 12, monthly_fee: 3500 },
    { id: 13, school_id: 1, name: 'Class 10', numeric_order: 13, monthly_fee: 3500 }
  ];

  const defaultTeachers = [
    {
      id: 1,
      school_id: 1,
      teacher_code: 'TCH-1001',
      employee_id: 'EMP-01',
      full_name: 'Muhammad Asif',
      father_name: 'Abdul Rehman',
      gender: 'Male',
      qualification: 'M.Sc Mathematics, B.Ed',
      cnic: '35201-1122334-1',
      mobile_number: '0301-4455667',
      address: 'Johar Town, Lahore',
      marital_status: 'Married',
      date_of_birth: '1988-04-12',
      date_of_enrolment: '2020-03-01',
      teaching_level: 'High',
      subject: 'Mathematics',
      designation: 'Senior Teacher',
      emergency_contact: '0300-9988776',
      salary: 55000,
      photo_path: null,
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      school_id: 1,
      teacher_code: 'TCH-1002',
      employee_id: 'EMP-02',
      full_name: 'Farzana Kausar',
      father_name: 'Kausar Ali',
      gender: 'Female',
      qualification: 'M.A English, M.Ed',
      cnic: '35201-9988112-2',
      mobile_number: '0322-8877665',
      address: 'Model Town, Lahore',
      marital_status: 'Married',
      date_of_birth: '1992-08-25',
      date_of_enrolment: '2021-02-15',
      teaching_level: 'Middle',
      subject: 'English & Urdu',
      designation: 'Subject Specialist',
      emergency_contact: '0321-1122334',
      salary: 48000,
      photo_path: null,
      status: 'Active',
      created_at: new Date().toISOString()
    }
  ];

  const defaultStudents = [
    {
      id: 1,
      school_id: 1,
      student_code: 'STD-1001',
      student_name: 'Hamza Farooq',
      father_name: 'Farooq Ahmad',
      mother_name: 'Sobia Farooq',
      father_mobile: '0300-5544332',
      roll_number: '01',
      class_name: 'Class 5',
      section: 'A',
      admission_number: 'ADM-501',
      admission_date: '2024-03-10',
      date_of_birth: '2014-06-15',
      gender: 'Male',
      address: 'Street 4, Sector B, Lahore',
      previous_school: 'City Grammar School',
      guardian_name: 'Farooq Ahmad',
      guardian_contact: '0300-5544332',
      monthly_fee: 2500,
      photo_path: null,
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      school_id: 1,
      student_code: 'STD-1002',
      student_name: 'Ayesha Bilal',
      father_name: 'Bilal Hussain',
      mother_name: 'Amina Bilal',
      father_mobile: '0313-7766554',
      roll_number: '02',
      class_name: 'Class 5',
      section: 'A',
      admission_number: 'ADM-502',
      admission_date: '2024-03-12',
      date_of_birth: '2014-09-20',
      gender: 'Female',
      address: 'Block C, Gulberg, Lahore',
      previous_school: 'Beacon Public School',
      guardian_name: 'Bilal Hussain',
      guardian_contact: '0313-7766554',
      monthly_fee: 2500,
      photo_path: null,
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      school_id: 1,
      student_code: 'STD-1003',
      student_name: 'Zainab Fatima',
      father_name: 'Sultan Mehmood',
      mother_name: 'Farah Sultan',
      father_mobile: '0333-8899001',
      roll_number: '01',
      class_name: 'Class 10',
      section: 'A',
      admission_number: 'ADM-1001',
      admission_date: '2023-04-01',
      date_of_birth: '2009-11-18',
      gender: 'Female',
      address: 'Faisal Town, Lahore',
      previous_school: 'Allama Iqbal Model School',
      guardian_name: 'Sultan Mehmood',
      guardian_contact: '0333-8899001',
      monthly_fee: 3500,
      photo_path: null,
      status: 'Active',
      created_at: new Date().toISOString()
    }
  ];

  const defaultStaff = [
    {
      id: 1,
      school_id: 1,
      staff_code: 'STF-1001',
      full_name: 'Akram Masih',
      father_name: 'Inayat Masih',
      designation: 'Security Guard',
      mobile: '0345-9988771',
      cnic: '35201-4433221-3',
      salary: 28000,
      date_of_joining: '2022-01-10',
      address: 'Kot Lakhpat, Lahore',
      emergency_contact: '0300-1122998',
      photo_path: null,
      status: 'Active',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      school_id: 1,
      staff_code: 'STF-1002',
      full_name: 'Kashif Mehmood',
      father_name: 'Mehmood Ali',
      designation: 'Computer Operator',
      mobile: '0305-6677889',
      cnic: '35201-7788990-1',
      salary: 35000,
      date_of_joining: '2021-08-01',
      address: 'Township, Lahore',
      emergency_contact: '0301-2233445',
      photo_path: null,
      status: 'Active',
      created_at: new Date().toISOString()
    }
  ];

  const defaultInventory = [
    {
      id: 1,
      school_id: 1,
      item_code: 'INV-1001',
      item_name: 'Dual Student Wooden Desks',
      item_category: 'Furniture',
      quantity: 50,
      unit: 'Pcs',
      purchase_price: 4500,
      total_value: 225000,
      purchase_date: '2024-01-15',
      supplier: 'National Furniture Works',
      item_condition: 'Good',
      location: 'Block A & B Classrooms',
      description: 'Sturdy Sheesham wood framed two-seater student desks.',
      photo_path: null,
      remarks: 'Inspected for session 2025',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      school_id: 1,
      item_code: 'INV-1002',
      item_name: 'Computer Lab Core i5 Workstations',
      item_category: 'Electronics',
      quantity: 25,
      unit: 'Units',
      purchase_price: 32000,
      total_value: 800000,
      purchase_date: '2024-02-20',
      supplier: 'Hafeez Centre Tech Links',
      item_condition: 'Good',
      location: 'Main IT Computer Lab',
      description: 'Core i5 8th Gen, 16GB RAM, 256GB SSD with 19" LED screens.',
      photo_path: null,
      remarks: 'Under hardware warranty',
      created_at: new Date().toISOString()
    }
  ];

  const today = new Date().toISOString().split('T')[0];

  const defaultStudentAttendance = [
    { id: 1, school_id: 1, student_id: 1, date: today, status: 'Present' },
    { id: 2, school_id: 1, student_id: 2, date: today, status: 'Present' },
    { id: 3, school_id: 1, student_id: 3, date: today, status: 'Leave' }
  ];

  const defaultTeacherAttendance = [
    { id: 1, school_id: 1, teacher_id: 1, date: today, status: 'Present' },
    { id: 2, school_id: 1, teacher_id: 2, date: today, status: 'Present' }
  ];

  const defaultStaffAttendance = [
    { id: 1, school_id: 1, staff_id: 1, date: today, status: 'Present' },
    { id: 2, school_id: 1, staff_id: 2, date: today, status: 'Present' }
  ];

  const defaultFees = [
    {
      id: 1,
      school_id: 1,
      student_id: 1,
      month: 'September',
      year: 2026,
      monthly_fee: 2500,
      previous_balance: 0,
      discount: 0,
      paid_amount: 2500,
      remaining_amount: 0,
      status: 'PAID'
    },
    {
      id: 2,
      school_id: 1,
      student_id: 2,
      month: 'September',
      year: 2026,
      monthly_fee: 2500,
      previous_balance: 0,
      discount: 500,
      paid_amount: 2000,
      remaining_amount: 0,
      status: 'PAID'
    },
    {
      id: 3,
      school_id: 1,
      student_id: 3,
      month: 'September',
      year: 2026,
      monthly_fee: 3500,
      previous_balance: 0,
      discount: 0,
      paid_amount: 0,
      remaining_amount: 3500,
      status: 'PENDING'
    }
  ];

  const defaultFeePayments = [
    {
      id: 1,
      school_id: 1,
      fee_id: 1,
      student_id: 1,
      receipt_no: 'REC-202609-001',
      paid_amount: 2500,
      payment_method: 'Cash',
      payment_date: today,
      notes: 'Paid at reception',
      collected_by: 'Admin'
    },
    {
      id: 2,
      school_id: 1,
      fee_id: 2,
      student_id: 2,
      receipt_no: 'REC-202609-002',
      paid_amount: 2000,
      payment_method: 'Bank Transfer',
      payment_date: today,
      notes: 'Sibling discount Rs. 500 applied',
      collected_by: 'Admin'
    }
  ];

  const defaultLogs = [
    {
      id: 1,
      school_id: 1,
      user_id: 1,
      action: 'School Initialized',
      record_type: 'System',
      record_id: 'SCH-HJAMIA-01',
      details: 'Production database initialized with institutional defaults.',
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString()
    }
  ];

  return {
    schools: [defaultSchool],
    classes: defaultClasses,
    teachers: defaultTeachers,
    students: defaultStudents,
    staff: defaultStaff,
    inventory: defaultInventory,
    student_attendance: defaultStudentAttendance,
    teacher_attendance: defaultTeacherAttendance,
    staff_attendance: defaultStaffAttendance,
    fees: defaultFees,
    fee_payments: defaultFeePayments,
    activity_logs: defaultLogs,
    sessions: []
  };
}

// Read database from disk
function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading DB file:', err);
    return getInitialDb();
  }
}

// Write database to disk atomically
function writeDb(data: DatabaseSchema): void {
  try {
    const tempFile = DB_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing DB file:', err);
  }
}

// Password hashing helper (crypto scrypt)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return hash + ':' + salt;
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [hash, salt] = stored.split(':');
    if (!hash || !salt) return false;
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
  } catch (e) {
    return false;
  }
}

// Authentication middleware
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/, '') || (req.query.token as string);

  if (!token) {
    return res.status(401).json({ error: 'Unauthenticated. Please log in.' });
  }

  const db = readDb();
  const session = db.sessions.find(s => s.token === token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  const school = db.schools.find(s => s.id === session.school_id);
  if (!school) {
    return res.status(401).json({ error: 'School not found.' });
  }

  req.schoolId = school.id;
  req.school = school;
  req.userName = session.user_name;
  next();
}

function logActivity(db: DatabaseSchema, schoolId: number, action: string, recordType: string, recordId: string, details: string, req: any) {
  const newLog = {
    id: db.activity_logs.length + 1,
    school_id: schoolId,
    user_id: 1,
    action,
    record_type: recordType,
    record_id: recordId,
    details,
    ip_address: req.ip || '127.0.0.1',
    created_at: new Date().toISOString()
  };
  db.activity_logs.unshift(newLog);
  if (db.activity_logs.length > 200) {
    db.activity_logs = db.activity_logs.slice(0, 200);
  }
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Multi-School Registration
app.post('/api/register', (req, res) => {
  const { school_name, username, password, phone, head_name, address } = req.body;

  if (!school_name || !username || !password) {
    return res.status(400).json({ error: 'School Name, Username, and Password are required.' });
  }

  const cleanUser = username.trim().toLowerCase();
  if (cleanUser.length < 3 || !/^[a-z0-9_-]+$/.test(cleanUser)) {
    return res.status(400).json({ error: 'Username must contain only lowercase letters, numbers, and hyphens.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const db = readDb();
  const exists = db.schools.find(s => s.username === cleanUser);
  if (exists) {
    return res.status(400).json({ error: `The username '${cleanUser}' is already registered.` });
  }

  const newSchoolId = db.schools.length + 1;
  const newSchool: School = {
    id: newSchoolId,
    school_uuid: 'SCH-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
    name: school_name.trim(),
    username: cleanUser,
    password_hash: hashPassword(password),
    phone: phone || '',
    email: `${cleanUser}@school.edu.pk`,
    address: address || '',
    head_name: head_name || 'Principal',
    academic_session: '2025-2026',
    urdu_slogan: 'تعلیم روشنی ہے، کردار کامیابی کی پہچان ہے',
    logo_path: null,
    signature_path: null,
    stamp_path: null,
    created_at: new Date().toISOString()
  };

  db.schools.push(newSchool);

  // Seed standard classes for the new school
  const defaultClasses = [
    'Play Group', 'Nursery', 'Prep', 'Class 1', 'Class 2', 'Class 3',
    'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
  ];
  defaultClasses.forEach((name, idx) => {
    db.classes.push({
      id: db.classes.length + 1,
      school_id: newSchoolId,
      name,
      numeric_order: idx + 1,
      monthly_fee: 2000
    });
  });

  logActivity(db, newSchoolId, 'School Registered', 'School', newSchool.school_uuid, `Registered school: ${newSchool.name}`, req);
  writeDb(db);

  return res.json({ success: true, message: 'School registered successfully! You can now log in.' });
});

// 2. Multi-Device Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'School Username and Password are required.' });
  }

  const cleanUser = username.trim().toLowerCase();
  const db = readDb();
  const school = db.schools.find(s => s.username === cleanUser);

  if (!school || !verifyPassword(password, school.password_hash)) {
    return res.status(401).json({ error: 'Invalid School Username or Password.' });
  }

  // Generate secure session token
  const token = 'sess_' + crypto.randomBytes(32).toString('hex');
  db.sessions.push({
    token,
    school_id: school.id,
    user_name: school.head_name || 'Principal',
    created_at: new Date().toISOString()
  });

  logActivity(db, school.id, 'User Login', 'Auth', String(school.id), `Logged in from ${req.ip || 'device'}`, req);
  writeDb(db);

  return res.json({
    success: true,
    token,
    school: {
      id: school.id,
      name: school.name,
      username: school.username,
      head_name: school.head_name,
      academic_session: school.academic_session,
      urdu_slogan: school.urdu_slogan,
      logo_path: school.logo_path,
      signature_path: school.signature_path,
      stamp_path: school.stamp_path,
      address: school.address,
      phone: school.phone
    }
  });
});

// 3. Current User / School Profile
app.get('/api/me', authenticate, (req: any, res) => {
  const s = req.school;
  return res.json({
    id: s.id,
    name: s.name,
    username: s.username,
    head_name: s.head_name,
    academic_session: s.academic_session,
    urdu_slogan: s.urdu_slogan,
    logo_path: s.logo_path,
    signature_path: s.signature_path,
    stamp_path: s.stamp_path,
    address: s.address,
    phone: s.phone
  });
});

// 4. Logout
app.post('/api/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/, '');
  if (token) {
    const db = readDb();
    db.sessions = db.sessions.filter(s => s.token !== token);
    writeDb(db);
  }
  return res.json({ success: true });
});

// 5. Dashboard Metrics
app.get('/api/dashboard', authenticate, (req: any, res) => {
  const db = readDb();
  const sId = req.schoolId;
  const today = new Date().toISOString().split('T')[0];

  const totalStudents = db.students.filter(s => s.school_id === sId && s.status === 'Active').length;
  const totalTeachers = db.teachers.filter(t => t.school_id === sId && t.status === 'Active').length;
  const totalStaff = db.staff.filter(st => st.school_id === sId && st.status === 'Active').length;
  const totalInventory = db.inventory.filter(i => i.school_id === sId).length;
  const totalClasses = db.classes.filter(c => c.school_id === sId).length;

  const schoolPayments = db.fee_payments.filter(p => p.school_id === sId);
  const totalFeesCollected = schoolPayments.reduce((acc, p) => acc + (Number(p.paid_amount) || 0), 0);

  const pendingFees = db.fees.filter(f => f.school_id === sId && (f.status === 'PENDING' || f.status === 'PARTIAL'));
  const totalPendingFees = pendingFees.reduce((acc, f) => acc + (Number(f.remaining_amount) || 0), 0);

  const studentAttToday = db.student_attendance.filter(a => a.school_id === sId && a.date === today);
  const studPresent = studentAttToday.filter(a => a.status === 'Present').length;
  const studAbsent = studentAttToday.filter(a => a.status === 'Absent').length;
  const studLeave = studentAttToday.filter(a => a.status === 'Leave').length;

  const teacherAttToday = db.teacher_attendance.filter(a => a.school_id === sId && a.date === today);
  const teachPresent = teacherAttToday.filter(a => a.status === 'Present').length;

  const staffAttToday = db.staff_attendance.filter(a => a.school_id === sId && a.date === today);
  const staffPresent = staffAttToday.filter(a => a.status === 'Present').length;

  const recentLogs = db.activity_logs.filter(l => l.school_id === sId).slice(0, 8);

  return res.json({
    totalStudents,
    totalTeachers,
    totalStaff,
    totalInventory,
    totalClasses,
    totalFeesCollected,
    totalPendingFees,
    attendanceToday: {
      student: { total: totalStudents, present: studPresent, absent: studAbsent, leave: studLeave },
      teacher: { total: totalTeachers, present: teachPresent },
      staff: { total: totalStaff, present: staffPresent }
    },
    recentActivities: recentLogs
  });
});

// 6. Teachers CRUD
app.get('/api/teachers', authenticate, (req: any, res) => {
  const db = readDb();
  const teachers = db.teachers.filter(t => t.school_id === req.schoolId);
  res.json(teachers);
});

app.post('/api/teachers', authenticate, (req: any, res) => {
  const db = readDb();
  const sId = req.schoolId;
  const { full_name, mobile_number, father_name, gender, qualification, cnic, address, marital_status, teaching_level, subject, designation, emergency_contact, photo_path, status } = req.body;

  if (!full_name || !mobile_number) {
    return res.status(400).json({ error: 'Full Name and Mobile Number are required.' });
  }

  const count = db.teachers.filter(t => t.school_id === sId).length + 1;
  const code = 'TCH-' + String(1000 + count);
  const empId = 'EMP-' + String(count).padStart(2, '0');

  const newTeacher = {
    id: db.teachers.length + 1,
    school_id: sId,
    teacher_code: code,
    employee_id: empId,
    full_name: full_name.trim(),
    father_name: father_name || '',
    gender: gender || 'Male',
    qualification: qualification || '',
    cnic: cnic || '',
    address: address || '',
    mobile_number: mobile_number.trim(),
    marital_status: marital_status || 'Single',
    date_of_birth: req.body.date_of_birth || null,
    date_of_enrolment: req.body.date_of_enrolment || new Date().toISOString().split('T')[0],
    teaching_level: teaching_level || 'Primary',
    subject: subject || '',
    designation: designation || 'Teacher',
    emergency_contact: emergency_contact || '',
    salary: Number(req.body.salary) || 0,
    photo_path: photo_path || null,
    status: status || 'Active',
    created_at: new Date().toISOString()
  };

  db.teachers.unshift(newTeacher);
  logActivity(db, sId, 'Teacher Added', 'Teacher', code, `Added faculty member: ${newTeacher.full_name} (${code})`, req);
  writeDb(db);

  res.json(newTeacher);
});

app.delete('/api/teachers/:id', authenticate, (req: any, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const sId = req.schoolId;
  const teacher = db.teachers.find(t => t.id === id && t.school_id === sId);
  if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

  db.teachers = db.teachers.filter(t => !(t.id === id && t.school_id === sId));
  db.teacher_attendance = db.teacher_attendance.filter(a => !(a.teacher_id === id && a.school_id === sId));
  logActivity(db, sId, 'Teacher Deleted', 'Teacher', String(id), `Deleted teacher: ${teacher.full_name}`, req);
  writeDb(db);

  res.json({ success: true });
});

// 7. Students CRUD
app.get('/api/students', authenticate, (req: any, res) => {
  const db = readDb();
  const students = db.students.filter(s => s.school_id === req.schoolId);
  res.json(students);
});

app.post('/api/students', authenticate, (req: any, res) => {
  const db = readDb();
  const sId = req.schoolId;
  const { student_name, father_name, father_mobile, roll_number, class_name, section, admission_number, admission_date, date_of_birth, gender, address, monthly_fee, photo_path, status } = req.body;

  if (!student_name || !father_name || !father_mobile) {
    return res.status(400).json({ error: 'Student Name, Father Name, and Father Mobile are required.' });
  }

  const count = db.students.filter(s => s.school_id === sId).length + 1;
  const studentCode = 'STD-' + String(1000 + count);
  const admNo = admission_number ? admission_number.trim() : 'ADM-' + String(500 + count);

  const mFee = Number(monthly_fee) || 2000;
  const newStudent = {
    id: db.students.length + 1,
    school_id: sId,
    student_code: studentCode,
    student_name: student_name.trim(),
    father_name: father_name.trim(),
    mother_name: req.body.mother_name || '',
    father_mobile: father_mobile.trim(),
    roll_number: roll_number || String(count).padStart(2, '0'),
    class_name: class_name || 'Class 1',
    section: section || 'A',
    admission_number: admNo,
    admission_date: admission_date || new Date().toISOString().split('T')[0],
    date_of_birth: date_of_birth || null,
    gender: gender || 'Male',
    address: address || '',
    previous_school: req.body.previous_school || '',
    guardian_name: req.body.guardian_name || father_name,
    guardian_contact: req.body.guardian_contact || father_mobile,
    monthly_fee: mFee,
    photo_path: photo_path || null,
    status: status || 'Active',
    created_at: new Date().toISOString()
  };

  db.students.unshift(newStudent);

  // Generate initial fee record for current month
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const curMonth = months[new Date().getMonth()];
  const curYear = new Date().getFullYear();

  db.fees.push({
    id: db.fees.length + 1,
    school_id: sId,
    student_id: newStudent.id,
    month: curMonth,
    year: curYear,
    monthly_fee: mFee,
    previous_balance: 0,
    discount: 0,
    paid_amount: 0,
    remaining_amount: mFee,
    status: 'PENDING'
  });

  logActivity(db, sId, 'Student Admitted', 'Student', studentCode, `Admitted ${newStudent.student_name} (${studentCode}) in ${newStudent.class_name}`, req);
  writeDb(db);

  res.json(newStudent);
});

app.delete('/api/students/:id', authenticate, (req: any, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const sId = req.schoolId;
  const student = db.students.find(s => s.id === id && s.school_id === sId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  db.students = db.students.filter(s => !(s.id === id && s.school_id === sId));
  db.fees = db.fees.filter(f => !(f.student_id === id && f.school_id === sId));
  db.student_attendance = db.student_attendance.filter(a => !(a.student_id === id && a.school_id === sId));
  logActivity(db, sId, 'Student Deleted', 'Student', String(id), `Deleted student: ${student.student_name}`, req);
  writeDb(db);

  res.json({ success: true });
});

// 8. Staff CRUD
app.get('/api/staff', authenticate, (req: any, res) => {
  const db = readDb();
  res.json(db.staff.filter(s => s.school_id === req.schoolId));
});

app.post('/api/staff', authenticate, (req: any, res) => {
  const db = readDb();
  const sId = req.schoolId;
  const { full_name, designation, mobile, salary, cnic, address, father_name, emergency_contact, photo_path, status } = req.body;

  if (!full_name || !mobile) {
    return res.status(400).json({ error: 'Full Name and Mobile are required.' });
  }

  const count = db.staff.filter(s => s.school_id === sId).length + 1;
  const staffCode = 'STF-' + String(1000 + count);

  const newStaff = {
    id: db.staff.length + 1,
    school_id: sId,
    staff_code: staffCode,
    full_name: full_name.trim(),
    father_name: father_name || '',
    photo_path: photo_path || null,
    cnic: cnic || '',
    mobile: mobile.trim(),
    address: address || '',
    date_of_birth: req.body.date_of_birth || null,
    date_of_joining: req.body.date_of_joining || new Date().toISOString().split('T')[0],
    designation: designation || 'Security Guard',
    salary: Number(salary) || 0,
    emergency_contact: emergency_contact || '',
    status: status || 'Active',
    created_at: new Date().toISOString()
  };

  db.staff.unshift(newStaff);
  logActivity(db, sId, 'Staff Added', 'Staff', staffCode, `Added staff: ${newStaff.full_name} (${newStaff.designation})`, req);
  writeDb(db);

  res.json(newStaff);
});

app.delete('/api/staff/:id', authenticate, (req: any, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const sId = req.schoolId;
  db.staff = db.staff.filter(s => !(s.id === id && s.school_id === sId));
  logActivity(db, sId, 'Staff Deleted', 'Staff', String(id), `Removed staff record #${id}`, req);
  writeDb(db);
  res.json({ success: true });
});

// 9. Inventory CRUD
app.get('/api/inventory', authenticate, (req: any, res) => {
  const db = readDb();
  res.json(db.inventory.filter(i => i.school_id === req.schoolId));
});

app.post('/api/inventory', authenticate, (req: any, res) => {
  const db = readDb();
  const sId = req.schoolId;
  const { item_name, item_category, quantity, unit, purchase_price, purchase_date, supplier, item_condition, location, description, remarks, photo_path } = req.body;

  if (!item_name) return res.status(400).json({ error: 'Item Name is required.' });

  const count = db.inventory.filter(i => i.school_id === sId).length + 1;
  const itemCode = 'INV-' + String(1000 + count);
  const qty = Number(quantity) || 1;
  const price = Number(purchase_price) || 0;

  const newItem = {
    id: db.inventory.length + 1,
    school_id: sId,
    item_code: itemCode,
    item_name: item_name.trim(),
    item_category: item_category || 'Furniture',
    quantity: qty,
    unit: unit || 'Pcs',
    purchase_price: price,
    total_value: qty * price,
    purchase_date: purchase_date || new Date().toISOString().split('T')[0],
    supplier: supplier || '',
    item_condition: item_condition || 'Good',
    location: location || 'Main Store',
    description: description || '',
    photo_path: photo_path || null,
    remarks: remarks || '',
    created_at: new Date().toISOString()
  };

  db.inventory.unshift(newItem);
  logActivity(db, sId, 'Inventory Added', 'Inventory', itemCode, `Added asset: ${newItem.item_name} (Qty: ${qty})`, req);
  writeDb(db);

  res.json(newItem);
});

app.delete('/api/inventory/:id', authenticate, (req: any, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const sId = req.schoolId;
  db.inventory = db.inventory.filter(i => !(i.id === id && i.school_id === sId));
  logActivity(db, sId, 'Inventory Deleted', 'Inventory', String(id), `Removed inventory record #${id}`, req);
  writeDb(db);
  res.json({ success: true });
});

// 10. Attendance API
app.get('/api/attendance/:role', authenticate, (req: any, res) => {
  const { role } = req.params;
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const sId = req.schoolId;
  const db = readDb();

  if (role === 'student') {
    const list = db.student_attendance.filter(a => a.school_id === sId && a.date === date);
    return res.json(list);
  } else if (role === 'teacher') {
    const list = db.teacher_attendance.filter(a => a.school_id === sId && a.date === date);
    return res.json(list);
  } else {
    const list = db.staff_attendance.filter(a => a.school_id === sId && a.date === date);
    return res.json(list);
  }
});

app.post('/api/attendance/:role', authenticate, (req: any, res) => {
  const { role } = req.params;
  const { date, records } = req.body; // records: { id: status }
  const sId = req.schoolId;
  const db = readDb();

  if (!records || typeof records !== 'object') {
    return res.status(400).json({ error: 'Invalid attendance payload' });
  }

  const subDate = date || new Date().toISOString().split('T')[0];

  if (role === 'student') {
    Object.entries(records).forEach(([studentIdStr, status]) => {
      const studentId = Number(studentIdStr);
      const existing = db.student_attendance.find(a => a.school_id === sId && a.student_id === studentId && a.date === subDate);
      if (existing) {
        existing.status = status;
      } else {
        db.student_attendance.push({
          id: db.student_attendance.length + 1,
          school_id: sId,
          student_id: studentId,
          date: subDate,
          status
        });
      }
    });
    logActivity(db, sId, 'Attendance Saved', 'StudentAttendance', subDate, `Recorded student attendance for ${subDate}`, req);
  } else if (role === 'teacher') {
    Object.entries(records).forEach(([teacherIdStr, status]) => {
      const teacherId = Number(teacherIdStr);
      const existing = db.teacher_attendance.find(a => a.school_id === sId && a.teacher_id === teacherId && a.date === subDate);
      if (existing) {
        existing.status = status;
      } else {
        db.teacher_attendance.push({
          id: db.teacher_attendance.length + 1,
          school_id: sId,
          teacher_id: teacherId,
          date: subDate,
          status
        });
      }
    });
    logActivity(db, sId, 'Attendance Saved', 'TeacherAttendance', subDate, `Recorded faculty attendance for ${subDate}`, req);
  } else {
    Object.entries(records).forEach(([staffIdStr, status]) => {
      const staffId = Number(staffIdStr);
      const existing = db.staff_attendance.find(a => a.school_id === sId && a.staff_id === staffId && a.date === subDate);
      if (existing) {
        existing.status = status;
      } else {
        db.staff_attendance.push({
          id: db.staff_attendance.length + 1,
          school_id: sId,
          staff_id: staffId,
          date: subDate,
          status
        });
      }
    });
    logActivity(db, sId, 'Attendance Saved', 'StaffAttendance', subDate, `Recorded staff attendance for ${subDate}`, req);
  }

  writeDb(db);
  res.json({ success: true, message: 'Attendance updated successfully' });
});

// 11. Fees Ledger & Payments
app.get('/api/fees', authenticate, (req: any, res) => {
  const db = readDb();
  const sId = req.schoolId;
  const month = req.query.month as string;
  const year = req.query.year ? Number(req.query.year) : undefined;
  const className = req.query.class as string;

  let students = db.students.filter(s => s.school_id === sId && s.status === 'Active');
  if (className) {
    students = students.filter(s => s.class_name === className);
  }

  const result = students.map(s => {
    let fee = db.fees.find(f => f.school_id === sId && f.student_id === s.id && (!month || f.month === month) && (!year || f.year === year));
    if (!fee) {
      fee = {
        id: 0,
        school_id: sId,
        student_id: s.id,
        month: month || 'Current',
        year: year || new Date().getFullYear(),
        monthly_fee: s.monthly_fee,
        previous_balance: 0,
        discount: 0,
        paid_amount: 0,
        remaining_amount: s.monthly_fee,
        status: 'PENDING'
      };
    }
    return {
      student_id: s.id,
      student_name: s.student_name,
      father_name: s.father_name,
      roll_number: s.roll_number,
      class_name: s.class_name,
      section: s.section,
      admission_number: s.admission_number,
      fee_id: fee.id,
      monthly_fee: fee.monthly_fee,
      previous_balance: fee.previous_balance,
      discount: fee.discount,
      paid_amount: fee.paid_amount,
      remaining_amount: fee.remaining_amount,
      status: fee.status
    };
  });

  res.json(result);
});

app.post('/api/fees/collect', authenticate, (req: any, res) => {
  const db = readDb();
  const sId = req.schoolId;
  const { student_id, month, year, monthly_fee, previous_balance, discount, paid_amount, payment_method, notes } = req.body;

  const studId = Number(student_id);
  const paid = Number(paid_amount) || 0;
  if (!studId || paid <= 0) {
    return res.status(400).json({ error: 'Valid student and paid amount are required.' });
  }

  const student = db.students.find(s => s.id === studId && s.school_id === sId);
  if (!student) return res.status(404).json({ error: 'Student not found.' });

  const subMonth = month || 'Current';
  const subYear = Number(year) || new Date().getFullYear();
  const mFee = Number(monthly_fee) || student.monthly_fee;
  const prevBal = Number(previous_balance) || 0;
  const disc = Number(discount) || 0;

  let fee = db.fees.find(f => f.school_id === sId && f.student_id === studId && f.month === subMonth && f.year === subYear);
  if (fee) {
    const totalPaid = fee.paid_amount + paid;
    const totalPayable = (mFee + prevBal) - disc;
    fee.monthly_fee = mFee;
    fee.previous_balance = prevBal;
    fee.discount = disc;
    fee.paid_amount = totalPaid;
    fee.remaining_amount = Math.max(0, totalPayable - totalPaid);
    fee.status = fee.remaining_amount <= 0 ? 'PAID' : 'PARTIAL';
  } else {
    const totalPayable = (mFee + prevBal) - disc;
    const remaining = Math.max(0, totalPayable - paid);
    fee = {
      id: db.fees.length + 1,
      school_id: sId,
      student_id: studId,
      month: subMonth,
      year: subYear,
      monthly_fee: mFee,
      previous_balance: prevBal,
      discount: disc,
      paid_amount: paid,
      remaining_amount: remaining,
      status: remaining <= 0 ? 'PAID' : 'PARTIAL'
    };
    db.fees.push(fee);
  }

  const receiptNo = 'REC-' + new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();

  const payment = {
    id: db.fee_payments.length + 1,
    school_id: sId,
    fee_id: fee.id,
    student_id: studId,
    receipt_no: receiptNo,
    paid_amount: paid,
    payment_method: payment_method || 'Cash',
    payment_date: new Date().toISOString().split('T')[0],
    notes: notes || '',
    collected_by: req.userName || 'Admin'
  };

  db.fee_payments.unshift(payment);
  logActivity(db, sId, 'Fee Collected', 'FeePayment', receiptNo, `Received Rs. ${paid} for ${student.student_name} (${receiptNo})`, req);
  writeDb(db);

  res.json({ success: true, receipt_no: receiptNo, payment });
});

// 12. Classes Management
app.get('/api/classes', authenticate, (req: any, res) => {
  const db = readDb();
  res.json(db.classes.filter(c => c.school_id === req.schoolId));
});

app.post('/api/classes', authenticate, (req: any, res) => {
  const db = readDb();
  const sId = req.schoolId;
  const { name, numeric_order, monthly_fee } = req.body;

  if (!name) return res.status(400).json({ error: 'Class name is required' });

  const newClass = {
    id: db.classes.length + 1,
    school_id: sId,
    name: name.trim(),
    numeric_order: Number(numeric_order) || db.classes.length + 1,
    monthly_fee: Number(monthly_fee) || 2000
  };

  db.classes.push(newClass);
  writeDb(db);
  res.json(newClass);
});

// 13. Settings Update
app.post('/api/settings', authenticate, (req: any, res) => {
  const db = readDb();
  const sId = req.schoolId;
  const school = db.schools.find(s => s.id === sId);
  if (!school) return res.status(404).json({ error: 'School not found' });

  const { name, phone, email, address, head_name, academic_session, urdu_slogan, logo_path, signature_path, stamp_path } = req.body;

  if (name) school.name = name.trim();
  if (phone !== undefined) school.phone = phone;
  if (email !== undefined) school.email = email;
  if (address !== undefined) school.address = address;
  if (head_name) school.head_name = head_name;
  if (academic_session) school.academic_session = academic_session;
  if (urdu_slogan) school.urdu_slogan = urdu_slogan;
  if (logo_path !== undefined) school.logo_path = logo_path;
  if (signature_path !== undefined) school.signature_path = signature_path;
  if (stamp_path !== undefined) school.stamp_path = stamp_path;

  logActivity(db, sId, 'Settings Updated', 'SchoolProfile', String(sId), 'Updated institutional branding and profile', req);
  writeDb(db);

  res.json({ success: true, school });
});

// 14. Activity Logs
app.get('/api/activity-logs', authenticate, (req: any, res) => {
  const db = readDb();
  res.json(db.activity_logs.filter(l => l.school_id === req.schoolId));
});

// 15. Hostinger PHP Code File List & Source Code Viewer
const PHP_DIR = path.resolve(process.cwd(), 'php_project');

app.get('/api/hostinger-files', (req, res) => {
  try {
    function getFiles(dir: string, base = ''): { path: string; name: string; size: number }[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      let results: any[] = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(base, entry.name);
        if (entry.isDirectory()) {
          results = results.concat(getFiles(fullPath, relPath));
        } else {
          const stat = fs.statSync(fullPath);
          results.push({ path: relPath, name: entry.name, size: stat.size });
        }
      }
      return results;
    }

    if (fs.existsSync(PHP_DIR)) {
      const files = getFiles(PHP_DIR);
      return res.json(files);
    }
    return res.json([]);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to read Hostinger files' });
  }
});

app.get('/api/hostinger-file-content', (req, res) => {
  const filePath = req.query.file as string;
  if (!filePath) return res.status(400).json({ error: 'Missing file path' });

  // Security check: ensure path is within php_project
  const safePath = path.resolve(PHP_DIR, filePath);
  if (!safePath.startsWith(PHP_DIR) || !fs.existsSync(safePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const content = fs.readFileSync(safePath, 'utf-8');
  res.json({ content, path: filePath });
});

// 16. 1-Click ZIP Download for Hostinger Deployment
app.get('/api/download-hostinger-zip', async (req, res) => {
  try {
    const zip = new JSZip();

    function addDirToZip(dir: string, zipFolder: JSZip) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const subFolder = zipFolder.folder(entry.name);
          if (subFolder) addDirToZip(fullPath, subFolder);
        } else {
          const content = fs.readFileSync(fullPath);
          zipFolder.file(entry.name, content);
        }
      }
    }

    if (fs.existsSync(PHP_DIR)) {
      addDirToZip(PHP_DIR, zip);
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="smart-school-management-hostinger.zip"');
      return res.send(zipBuffer);
    } else {
      return res.status(404).json({ error: 'PHP source directory not found.' });
    }
  } catch (err: any) {
    console.error('ZIP generation error:', err);
    return res.status(500).json({ error: 'Failed to generate ZIP archive.' });
  }
});

// Vite Middleware Integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart School Management System Server listening on port ${PORT}`);
  });
}

startServer();
