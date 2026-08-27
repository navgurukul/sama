-- phase1_020_audit_trigger.sql
-- Implements live DB-level audit logging for sama_ops.laptop_labeling, replacing the legacy Google Sheet sync.

-- 1) Create the trigger function
CREATE OR REPLACE FUNCTION sama_ops.audit_laptop_labeling_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log updates (not inserts), though you can adjust if needed
    IF TG_OP = 'UPDATE' THEN
        
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            INSERT INTO sama_ops.audit_for_laptops (id, field, from_value, to_value, updated_by, updated_on)
            VALUES (NEW.id, 'Status', OLD.status, NEW.status, COALESCE(NEW.last_updated_by, 'system'), now());
        END IF;

        IF NEW.condition_status IS DISTINCT FROM OLD.condition_status THEN
            INSERT INTO sama_ops.audit_for_laptops (id, field, from_value, to_value, updated_by, updated_on)
            VALUES (NEW.id, 'Condition Status', OLD.condition_status, NEW.condition_status, COALESCE(NEW.last_updated_by, 'system'), now());
        END IF;

        IF NEW.processor IS DISTINCT FROM OLD.processor THEN
            INSERT INTO sama_ops.audit_for_laptops (id, field, from_value, to_value, updated_by, updated_on)
            VALUES (NEW.id, 'Processor', OLD.processor, NEW.processor, COALESCE(NEW.last_updated_by, 'system'), now());
        END IF;

        IF NEW.manufacturing_date IS DISTINCT FROM OLD.manufacturing_date THEN
            INSERT INTO sama_ops.audit_for_laptops (id, field, from_value, to_value, updated_by, updated_on)
            VALUES (NEW.id, 'Manufacturing Date', OLD.manufacturing_date::text, NEW.manufacturing_date::text, COALESCE(NEW.last_updated_by, 'system'), now());
        END IF;

        IF NEW.ram IS DISTINCT FROM OLD.ram THEN
            INSERT INTO sama_ops.audit_for_laptops (id, field, from_value, to_value, updated_by, updated_on)
            VALUES (NEW.id, 'RAM', OLD.ram, NEW.ram, COALESCE(NEW.last_updated_by, 'system'), now());
        END IF;

        IF NEW.rom IS DISTINCT FROM OLD.rom THEN
            INSERT INTO sama_ops.audit_for_laptops (id, field, from_value, to_value, updated_by, updated_on)
            VALUES (NEW.id, 'ROM', OLD.rom, NEW.rom, COALESCE(NEW.last_updated_by, 'system'), now());
        END IF;

        IF NEW.battery_capacity IS DISTINCT FROM OLD.battery_capacity THEN
            INSERT INTO sama_ops.audit_for_laptops (id, field, from_value, to_value, updated_by, updated_on)
            VALUES (NEW.id, 'Battery Capacity', OLD.battery_capacity, NEW.battery_capacity, COALESCE(NEW.last_updated_by, 'system'), now());
        END IF;

        IF NEW.batch IS DISTINCT FROM OLD.batch THEN
            INSERT INTO sama_ops.audit_for_laptops (id, field, from_value, to_value, updated_by, updated_on)
            VALUES (NEW.id, 'Batch', OLD.batch, NEW.batch, COALESCE(NEW.last_updated_by, 'system'), now());
        END IF;

        IF NEW.allocated_to IS DISTINCT FROM OLD.allocated_to THEN
            INSERT INTO sama_ops.audit_for_laptops (id, field, from_value, to_value, updated_by, updated_on)
            VALUES (NEW.id, 'Allocated To', OLD.allocated_to, NEW.allocated_to, COALESCE(NEW.last_updated_by, 'system'), now());
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2) Attach the trigger to the table
DROP TRIGGER IF EXISTS trg_audit_laptop_labeling ON sama_ops.laptop_labeling;
CREATE TRIGGER trg_audit_laptop_labeling
AFTER UPDATE ON sama_ops.laptop_labeling
FOR EACH ROW
EXECUTE FUNCTION sama_ops.audit_laptop_labeling_changes();
