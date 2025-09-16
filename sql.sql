-- Work Permit Management System Database Schema

-- Table for work permit applications
CREATE TABLE work_permits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    permit_number VARCHAR(50) UNIQUE,
    work_type VARCHAR(100) NOT NULL,
    
    -- Basic Information
    start_date DATE NOT NULL,
    start_time TIME NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    training_certificate_url TEXT,
    
    -- Company Information
    contractor_company VARCHAR(255),
    supervisor_name VARCHAR(255),
    project_manager VARCHAR(255),
    
    -- Work Location
    work_location TEXT,
    worker_count INTEGER,
    worker_names TEXT,
    
    -- Work Details (JSON for multiple selections)
    work_details JSONB DEFAULT '{}', -- grinding, welding, drilling, etc.
    tools_equipment TEXT,
    
    -- Special Work Permits
    special_work_type JSONB DEFAULT '{}', -- confined space, height work, etc.
    related_documents JSONB DEFAULT '{}', -- JSA, safety measures, SDS, etc.
    
    -- Safety Compliance Checklist
    safety_compliance JSONB DEFAULT '{}',
    
    -- PPE Requirements
    ppe_requirements JSONB DEFAULT '{}',
    
    -- Fire Extinguisher
    fire_extinguisher_needed BOOLEAN DEFAULT false,
    fire_extinguisher_reason TEXT,
    fire_extinguisher_count INTEGER DEFAULT 0,
    fire_extinguisher_types JSONB DEFAULT '{}',
    
    -- Atmosphere Monitoring
    atmosphere_monitoring JSONB DEFAULT '{}',
    
    -- Daily Inspection
    daily_inspections JSONB DEFAULT '[]',
    
    -- Application Request
    application_statement TEXT,
    applicant_signature VARCHAR(255),
    application_date TIMESTAMP,
    
    -- Approval Section
    approval_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    approval_complete BOOLEAN DEFAULT false,
    approval_incomplete_reason TEXT,
    approver_signature VARCHAR(255),
    approval_date TIMESTAMP,
    
    -- Extension Request
    extension_requests JSONB DEFAULT '[]',
    
    -- Closure Request
    closure_statement TEXT,
    closure_signature VARCHAR(255),
    closure_date TIMESTAMP,
    
    -- Final Closure Approval
    final_closure_status VARCHAR(20) DEFAULT 'pending', -- completed_safe, not_complete_risk
    final_closure_reason TEXT,
    final_approver_signature VARCHAR(255),
    final_approval_date TIMESTAMP,
    
    -- System fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for file uploads
CREATE TABLE permit_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    permit_id UUID REFERENCES work_permits(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for system users/roles (simplified without auth)
CREATE TABLE user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- applicant, supervisor, safety_officer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_work_permits_status ON work_permits(approval_status);
CREATE INDEX idx_work_permits_created_at ON work_permits(created_at);
CREATE INDEX idx_work_permits_permit_number ON work_permits(permit_number);

-- Create function to auto-generate permit number
CREATE OR REPLACE FUNCTION generate_permit_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.permit_number IS NULL THEN
        NEW.permit_number := 'WP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('permit_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for permit numbers
CREATE SEQUENCE permit_number_seq START 1;

-- Create trigger for auto-generating permit numbers
CREATE TRIGGER set_permit_number
    BEFORE INSERT ON work_permits
    FOR EACH ROW
    EXECUTE FUNCTION generate_permit_number();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
CREATE TRIGGER update_work_permits_updated_at
    BEFORE UPDATE ON work_permits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample user roles
INSERT INTO user_roles (user_name, role) VALUES
('Safety Officer', 'safety_officer'),
('Supervisor', 'supervisor'),
('Worker', 'applicant');

-- Disable Row Level Security for public access (no authentication required)
ALTER TABLE work_permits DISABLE ROW LEVEL SECURITY;
ALTER TABLE permit_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for anonymous users
-- (Run these if you prefer to keep RLS enabled but allow public access)

-- Enable RLS but allow public access
-- ALTER TABLE work_permits ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE permit_files ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all operations
-- CREATE POLICY "Allow all operations on work_permits" ON work_permits FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations on permit_files" ON permit_files FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations on user_roles" ON user_roles FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for file uploads (run this in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('work-permit-files', 'work-permit-files', true);




ALTER TABLE work_permits DISABLE ROW LEVEL SECURITY;
ALTER TABLE permit_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

GRANT ALL ON work_permits TO anon;
GRANT ALL ON permit_files TO anon;
GRANT ALL ON user_roles TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;