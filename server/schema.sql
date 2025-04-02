
-- Drop database if exists and create a new one
DROP DATABASE IF EXISTS college_events;
CREATE DATABASE college_events;
USE college_events;

-- Create Users table
CREATE TABLE users (
  id NUMBER  PRIMARY KEY,
  name VARCHAR2(100) NOT NULL,
  email VARCHAR2(100) NOT NULL UNIQUE,
  password VARCHAR2(255) NOT NULL,
  role VARCHAR2(10) DEFAULT 'student' CHECK (role IN ('admin', 'student', 'faculty')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--trigger for user
CREATE SEQUENCE users_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER users_before_insert
BEFORE INSERT ON users
FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
  SELECT users_seq.NEXTVAL INTO :NEW.id FROM DUAL;
END;
/

-- Create Events table
CREATE TABLE events (
  id NUMBER  PRIMARY KEY,
  title VARCHAR2(255) NOT NULL,
  description CLOB,
  image_url VARCHAR2(255),
  event_date DATE NOT NULL,
  time_start TIMESTAMP NOT NULL,
  time_end TIMESTAMP NOT NULL,
  location VARCHAR2(255) NOT NULL,
  category VARCHAR2(50) NOT NULL,
  price NUMBER(10,2) DEFAULT 0,
  total_tickets NUMBER DEFAULT 0,
  available_tickets NUMBER DEFAULT 0,
  organizer_id NUMBER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_organizer FOREIGN KEY (organizer_id) REFERENCES users(id)
);

--trigger for events table
CREATE OR REPLACE TRIGGER events_before_update
BEFORE UPDATE ON events
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;

-- Create Pending Events table (for event requests from regular users)
CREATE TABLE pending_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  date DATE NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  total_tickets INT DEFAULT 0,
  requester_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES users(id)
);

-- Create Tickets table
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  ticket_code VARCHAR(50) NOT NULL UNIQUE,
  status ENUM('purchased', 'used', 'cancelled') DEFAULT 'purchased',
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

--triggers and sequence for tickets
CREATE SEQUENCE tickets_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER tickets_before_insert
BEFORE INSERT ON tickets
FOR EACH ROW
WHEN (NEW.id IS NULL)
BEGIN
  SELECT tickets_seq.NEXTVAL INTO :NEW.id FROM DUAL;
END;

-- Create sample data for testing
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@college.edu', '$2a$10$XdKa.mTsA/C6GRhGRK3TXeEG30VmBKz9Fd1UIUjGZO7MRCQg.rjCq', 'admin'), -- password: admin123
('John Student', 'john@student.edu', '$2a$10$YY8I.CGxlJ1SgAO7g1g5cOQmCAoOjcjYHqVG4JZ8Nf/679.xbXkxK', 'student'), -- password: student123
('Jane Faculty', 'jane@faculty.edu', '$2a$10$il8yw1aQFAoZ1MHPGkeCheKXvw2qJz40qz6nZ0oKYQeN.C.G3.FmK', 'faculty'); -- password: faculty123

-- Sample events
INSERT INTO events (title, description, image_url, date, time_start, time_end, location, category, price, total_tickets, available_tickets, organizer_id) VALUES
('Summer Music Festival', 'Annual college music festival featuring student bands and performers', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3', '2024-07-15', '16:00:00', '23:00:00', 'College Amphitheater', 'cultural', 10.00, 200, 200, 1),
('Tech Innovation Summit', 'Showcase of student tech projects and innovations', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87', '2024-08-05', '09:00:00', '17:00:00', 'Engineering Building', 'academic', 0.00, 100, 100, 1),
('Basketball Tournament', 'Inter-department basketball championship', 'https://images.unsplash.com/photo-1546519638-68e109acd618', '2024-07-22', '13:00:00', '18:00:00', 'College Stadium', 'sports', 5.00, 300, 300, 1);
