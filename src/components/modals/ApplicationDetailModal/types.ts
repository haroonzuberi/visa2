import { JSX } from "react";

export interface Document {
  id: number;
  document_id: number;
  document_type: string;
  file_path: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  status: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

export interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string;
  passport_number: string;
  created_at: string;
}

export interface ApplicationData {
  id: number;
  application_id: string;
  form_id: number | null;
  form_name: string | null;
  customer_id: number;
  applicant_id: number;
  visa_status: string;
  price_paid: any;
  payment_status: string;
  priority: string;
  submitted_by: string;
  source: string;
  created_at: string;
  updated_at: string;
  values: Record<string, any>;
  documents?: Record<string, Document | Document[]>;
  visa_type?: {
    id: number;
    name: string;
    code: string;
    description: string;
    is_active: boolean;
    price: number;
    duration: number;
    currency: string;
    meta_data?: Record<string, any>;
    country?: {
      id: number;
      name: string;
      code: string;
      flag_emoji: string;
    };
  };
  extracted_visa_data?: Record<string, any>;
  customer?: Customer;
  applicant?: Applicant;
  background_processing_status?: {
    status: string;
    error: string | null;
    started_at: string;
    completed_at: string;
    steps: Record<string, { status: string; error: string | null }>;
  };
  internal_notes?: string;
}

export interface ModalProps {
  setIsApplicationDetail?: (value: boolean) => void;
  onClose: () => void;
  data: { id: number } | ApplicationData;
}

export type EditingFieldState = {
  value: any;
  originalValue: any;
  isSaving: boolean;
};

export type EditingFieldsMap = Record<string, EditingFieldState>;

