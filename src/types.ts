export interface School {
  id: number;
  school_uuid: string;
  name: string;
  username: string;
  head_name: string;
  academic_session: string;
  urdu_slogan: string;
  logo_path?: string | null;
  signature_path?: string | null;
  stamp_path?: string | null;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Teacher {
  id: number;
  school_id: number;
  teacher_code: string;
  employee_id: string;
  full_name: string;
  father_name: string;
  gender: 'Male' | 'Female' | 'Other';
  qualification: string;
  cnic: string;
  address: string;
  mobile_number: string;
  marital_status: string;
  date_of_birth: string | null;
  date_of_enrolment: string;
  teaching_level: 'Primary' | 'Middle' | 'High';
  subject: string;
  designation: string;
  emergency_contact: string;
  salary: number;
  photo_path?: string | null;
  status: 'Active' | 'Inactive';
}

export interface Student {
  id: number;
  school_id: number;
  student_code: string;
  student_name: string;
  father_name: string;
  mother_name?: string;
  father_mobile: string;
  roll_number: string;
  class_name: string;
  section: string;
  admission_number: string;
  admission_date: string;
  date_of_birth: string | null;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  previous_school?: string;
  guardian_name?: string;
  guardian_contact?: string;
  monthly_fee: number;
  photo_path?: string | null;
  status: 'Active' | 'Inactive' | 'Left';
}

export interface Staff {
  id: number;
  school_id: number;
  staff_code: string;
  full_name: string;
  father_name?: string;
  photo_path?: string | null;
  cnic?: string;
  mobile: string;
  address?: string;
  date_of_birth?: string | null;
  date_of_joining: string;
  designation: string;
  salary: number;
  emergency_contact?: string;
  status: 'Active' | 'Inactive';
}

export interface InventoryItem {
  id: number;
  school_id: number;
  item_code: string;
  item_name: string;
  item_category: string;
  quantity: number;
  unit: string;
  purchase_price: number;
  total_value: number;
  purchase_date: string;
  supplier?: string;
  item_condition: 'New' | 'Good' | 'Damaged' | 'Repair Required';
  location: string;
  description?: string;
  photo_path?: string | null;
  remarks?: string;
}

export interface SchoolClass {
  id: number;
  school_id: number;
  name: string;
  numeric_order: number;
  monthly_fee: number;
}

export interface FeeRecord {
  student_id: number;
  student_name: string;
  father_name: string;
  roll_number: string;
  class_name: string;
  section: string;
  admission_number: string;
  fee_id: number;
  monthly_fee: number;
  previous_balance: number;
  discount: number;
  paid_amount: number;
  remaining_amount: number;
  status: 'PAID' | 'PARTIAL' | 'PENDING';
}

export interface FeePayment {
  id: number;
  school_id: number;
  fee_id: number;
  student_id: number;
  receipt_no: string;
  paid_amount: number;
  payment_method: string;
  payment_date: string;
  notes?: string;
  collected_by: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  record_type: string;
  record_id: string;
  details: string;
  ip_address: string;
  created_at: string;
}
