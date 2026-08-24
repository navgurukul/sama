-- Add new fields to the ngo_requests table to support the AFE Laptop Inventory Tracker
ALTER TABLE sama_ops.ngo_requests 
ADD COLUMN IF NOT EXISTS partner_type VARCHAR(50) DEFAULT 'External Partner',
ADD COLUMN IF NOT EXISTS date_received DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS attached_email_link TEXT,
ADD COLUMN IF NOT EXISTS approver_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS approved_quantity INT,
ADD COLUMN IF NOT EXISTS dispatch_location VARCHAR(100),
ADD COLUMN IF NOT EXISTS expected_delivery_days INT,
ADD COLUMN IF NOT EXISTS dispatch_date DATE,
ADD COLUMN IF NOT EXISTS delivery_date DATE,
ADD COLUMN IF NOT EXISTS last_impact_report_date DATE;
