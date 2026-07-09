-- ==========================================
-- People Complaint Portal - PostgreSQL Schema DDL
-- Compatible with Java 21 & Spring Boot 3 / Hibernate
-- ==========================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    department VARCHAR(255),
    district VARCHAR(255),
    state VARCHAR(255),
    avatar TEXT
);

-- 2. Citizens Table
CREATE TABLE IF NOT EXISTS citizen (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    state VARCHAR(255),
    district VARCHAR(255),
    avatar TEXT
);

-- 3. Authorities Table
CREATE TABLE IF NOT EXISTS authority (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    pin_code VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- 4. Admins Table
CREATE TABLE IF NOT EXISTS admin (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- 5. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    video VARCHAR(255),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    landmark VARCHAR(255),
    state VARCHAR(255) NOT NULL,
    district VARCHAR(255) NOT NULL,
    pin_code VARCHAR(50) NOT NULL,
    anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    citizen_id VARCHAR(255) NOT NULL,
    citizen_name VARCHAR(255),
    submission_time VARCHAR(255) NOT NULL,
    assigned_department VARCHAR(255),
    authority_remarks TEXT,
    resolution_image TEXT,
    seen_by_authority BOOLEAN NOT NULL DEFAULT FALSE,
    seen_time VARCHAR(255),
    estimated_resolution_time VARCHAR(255),
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    completion_date VARCHAR(255)
);

-- Safe migration of new columns if complaints already exists
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS seen_by_authority BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS seen_time VARCHAR(255);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS estimated_resolution_time VARCHAR(255);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS completion_date VARCHAR(255);

-- 6. Complaint Images Table (Collection element table)
CREATE TABLE IF NOT EXISTS complaint_images (
    complaint_id VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    CONSTRAINT fk_complaint_images_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 7. Complaint History (Timeline Events) Table
CREATE TABLE IF NOT EXISTS complaint_history (
    id VARCHAR(255) PRIMARY KEY,
    status VARCHAR(50) NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    remarks TEXT NOT NULL,
    timestamp VARCHAR(255) NOT NULL,
    complaint_id VARCHAR(255),
    CONSTRAINT fk_history_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 8. Complaint Progress Table (Daily updates log)
CREATE TABLE IF NOT EXISTS complaint_progress (
    id VARCHAR(255) PRIMARY KEY,
    complaint_id VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    time VARCHAR(50) NOT NULL,
    officer_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    CONSTRAINT fk_progress_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 9. Archive Complaint Table
CREATE TABLE IF NOT EXISTS archive_complaint (
    id VARCHAR(255) PRIMARY KEY,
    complaint_json TEXT NOT NULL,
    completion_date VARCHAR(255),
    authority_name VARCHAR(255),
    citizen_name VARCHAR(255),
    pin_code VARCHAR(50)
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL, -- 'admin', 'all', or specific user id
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp VARCHAR(255) NOT NULL
);

-- 11. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(255) PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    timestamp VARCHAR(255) NOT NULL
);

-- ==========================================
-- Optimization Indexes
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_state_district ON complaints(state, district);
CREATE INDEX IF NOT EXISTS idx_history_complaint ON complaint_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_progress_complaint ON complaint_progress(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
