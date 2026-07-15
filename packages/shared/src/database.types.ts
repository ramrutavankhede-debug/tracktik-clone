export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProfilesRow = {
  id: string;
  org_id: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  employee_number: string | null;
  status: string;
  skills: Json;
  created_at: string;
};

type SitesRow = {
  id: string;
  org_id: string;
  client_id: string | null;
  parent_client_id: string | null;
  account_uid: string;
  account_type: string;
  name: string;
  address: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  status: string;
  site_template_id: string | null;
  timezone: string | null;
  preferred_language: string;
  logo_url: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_job_title: string | null;
  phone_main: string | null;
  phone_other: string | null;
  fax: string | null;
  email: string | null;
  sms_consent_main: boolean;
  sms_consent_other: boolean;
  tags: string[];
  business_registration_number: string | null;
  website: string | null;
  account_rep_id: string | null;
  sales_rep_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          timezone: string;
          settings: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          timezone?: string;
          settings?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          timezone?: string;
          settings?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: ProfilesRow;
        Insert: {
          id: string;
          org_id: string;
          role?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          employee_number?: string | null;
          status?: string;
          skills?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          role?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          employee_number?: string | null;
          status?: string;
          skills?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          type: string;
          main_contact: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          type?: string;
          main_contact?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          type?: string;
          main_contact?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      site_templates: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      zones: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      sites: {
        Row: SitesRow;
        Insert: {
          id?: string;
          org_id: string;
          client_id?: string | null;
          parent_client_id?: string | null;
          account_uid: string;
          account_type?: string;
          name: string;
          address?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string | null;
          lat?: number | null;
          lng?: number | null;
          status?: string;
          site_template_id?: string | null;
          timezone?: string | null;
          preferred_language?: string;
          logo_url?: string | null;
          contact_first_name?: string | null;
          contact_last_name?: string | null;
          contact_job_title?: string | null;
          phone_main?: string | null;
          phone_other?: string | null;
          fax?: string | null;
          email?: string | null;
          sms_consent_main?: boolean;
          sms_consent_other?: boolean;
          tags?: string[];
          business_registration_number?: string | null;
          website?: string | null;
          account_rep_id?: string | null;
          sales_rep_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          client_id?: string | null;
          parent_client_id?: string | null;
          account_uid?: string;
          account_type?: string;
          name?: string;
          address?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string | null;
          lat?: number | null;
          lng?: number | null;
          status?: string;
          site_template_id?: string | null;
          timezone?: string | null;
          preferred_language?: string;
          logo_url?: string | null;
          contact_first_name?: string | null;
          contact_last_name?: string | null;
          contact_job_title?: string | null;
          phone_main?: string | null;
          phone_other?: string | null;
          fax?: string | null;
          email?: string | null;
          sms_consent_main?: boolean;
          sms_consent_other?: boolean;
          tags?: string[];
          business_registration_number?: string | null;
          website?: string | null;
          account_rep_id?: string | null;
          sales_rep_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_zones: {
        Row: { site_id: string; zone_id: string };
        Insert: { site_id: string; zone_id: string };
        Update: { site_id?: string; zone_id?: string };
        Relationships: [];
      };
      incidents: {
        Row: {
          id: string;
          org_id: string;
          site_id: string | null;
          title: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          site_id?: string | null;
          title?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          site_id?: string | null;
          title?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      shifts: {
        Row: {
          id: string;
          org_id: string;
          site_id: string | null;
          guard_id: string | null;
          status: string;
          clock_in: string | null;
          clock_out: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          site_id?: string | null;
          guard_id?: string | null;
          status?: string;
          clock_in?: string | null;
          clock_out?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          site_id?: string | null;
          guard_id?: string | null;
          status?: string;
          clock_in?: string | null;
          clock_out?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      tour_sessions: {
        Row: {
          id: string;
          org_id: string;
          site_id: string | null;
          status: string;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          site_id?: string | null;
          status?: string;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          site_id?: string | null;
          status?: string;
          ended_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          org_id: string;
          actor_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          before: Json | null;
          after: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          actor_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          before?: Json | null;
          after?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          actor_id?: string | null;
          action?: string;
          entity?: string;
          entity_id?: string | null;
          before?: Json | null;
          after?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      next_account_uid: {
        Args: { p_org_id: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
