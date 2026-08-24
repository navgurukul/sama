-- Draft PostgreSQL schema generated from current sheet structure.
-- Review with business rules before production use.

create table if not exists donors (
    donor_id bigserial primary key,
    donor_name text not null unique,
    created_at timestamptz not null default now()
);

create table if not exists ngos (
    ngo_id text primary key,
    donor_id bigint references donors (donor_id),
    ngo_name text,
    created_at timestamptz not null default now()
);

create table if not exists users (
    user_id bigint primary key,
    ngo_id text references ngos (ngo_id),
    donor_id bigint references donors (donor_id),
    name text,
    email text,
    contact_number text,
    address text,
    address_state text,
    id_proof_type text,
    id_proof_number text,
    qualification text,
    occupation text,
    date_of_birth date,
    use_case text,
    family_members_count integer,
    guardian_occupation text,
    family_annual_income numeric(14, 2),
    user_status text,
    laptop_assigned_flag boolean,
    id_link text,
    income_certificate_link text,
    created_at timestamptz,
    updated_at timestamptz not null default now()
);

create table if not exists laptops (
    laptop_id text primary key,
    date_committed timestamptz,
    donor_id bigint references donors (donor_id),
    ram text,
    rom text,
    manufacturer_model text,
    processor text,
    manufacturing_date date,
    condition_status text,
    minor_issues text,
    major_issues text,
    other_issues text,
    inventory_location text,
    laptop_weight text,
    mac_address text unique,
    status text,
    working text,
    battery_capacity numeric(5, 2),
    allocated_to_user_id bigint references users (user_id),
    last_updated_on timestamptz,
    last_updated_by text,
    assigned_to text,
    issue_comment text,
    inspection_files text,
    activitywatch_pdf text,
    activity_date timestamptz,
    afk_time text,
    usage_hours numeric(8, 2),
    off_times integer,
    last_delivery_date timestamptz,
    refurbishment_date timestamptz,
    batch text,
    updated_at timestamptz not null default now()
);

create table if not exists laptop_audit (
    audit_id bigserial primary key,
    laptop_id text not null references laptops (laptop_id),
    field_name text not null,
    from_value text,
    to_value text,
    updated_by text,
    updated_on timestamptz not null,
    created_at timestamptz not null default now()
);

create table if not exists pickup_requests (
    pickup_id text primary key,
    donor_id bigint references donors (donor_id),
    donor_company_raw text,
    poc_name text,
    poc_contact text,
    poc_email text,
    number_of_laptops integer,
    pickup_location text,
    pickup_by text,
    current_datetime timestamptz,
    status text,
    confirm_pickup_date timestamptz,
    updated_on timestamptz,
    updated_by text
);

create table if not exists laptop_user_map (
    map_id bigserial primary key,
    laptop_id text not null references laptops (laptop_id),
    user_id bigint not null references users (user_id),
    issued_date date,
    created_at timestamptz not null default now()
);

create table if not exists preliminary_reports (
    prelim_id bigint primary key,
    ngo_id text references ngos (ngo_id),
    donor_id bigint references donors (donor_id),
    number_of_school integer,
    number_of_teacher integer,
    number_of_student integer,
    number_of_female_student integer,
    states text,
    unit text,
    courses text,
    submitted_at timestamptz
);

create table if not exists monthly_reports (
    report_id bigint primary key,
    ngo_id text references ngos (ngo_id),
    teachers_trained integer,
    school_visits integer,
    sessions_conducted integer,
    modules_completed integer,
    students_intent_rating numeric(5, 2),
    submitted_at timestamptz not null default now()
);

create table if not exists metrics_base (
    metric_id bigserial primary key,
    metric_key text not null,
    metric_value text,
    source_date timestamptz,
    created_at timestamptz not null default now()
);

create index if not exists idx_laptops_status on laptops (status);

create index if not exists idx_laptops_working on laptops (working);

create index if not exists idx_laptops_allocated_to_user_id on laptops (allocated_to_user_id);

create index if not exists idx_laptop_audit_laptop_id_updated_on on laptop_audit (laptop_id, updated_on desc);

create index if not exists idx_users_ngo_id on users (ngo_id);

create index if not exists idx_pickup_requests_status on pickup_requests (status);

create index if not exists idx_monthly_reports_ngo_id on monthly_reports (ngo_id);

create index if not exists idx_preliminary_reports_ngo_id on preliminary_reports (ngo_id);