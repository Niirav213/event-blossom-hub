-- Drop old tables if needed
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE tickets CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP TABLE pending_events CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP TABLE events CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP TABLE users CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP TABLE refresh_tokens CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP TABLE password_reset_tokens CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP TABLE email_verification_tokens CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP SEQUENCE users_seq';
  EXECUTE IMMEDIATE 'DROP SEQUENCE refresh_tokens_seq';
  EXECUTE IMMEDIATE 'DROP SEQUENCE password_reset_tokens_seq';
  EXECUTE IMMEDIATE 'DROP SEQUENCE email_verif_seq';
  EXECUTE IMMEDIATE 'DROP SEQUENCE events_seq';
  EXECUTE IMMEDIATE 'DROP SEQUENCE pending_events_seq';
  EXECUTE IMMEDIATE 'DROP SEQUENCE tickets_seq';
EXCEPTION
  WHEN OTHERS THEN NULL;
END;
/

-- USERS Table
CREATE TABLE users (
  id NUMBER PRIMARY KEY,
  name VARCHAR2(100),
  email VARCHAR2(100) UNIQUE NOT NULL,
  password VARCHAR2(100) NOT NULL,
  role VARCHAR2(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  email_verified NUMBER(1) DEFAULT 0,
  profile_image_url VARCHAR2(255),
  phone VARCHAR2(20),
  department VARCHAR2(100),
  bio CLOB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE users_seq START WITH 2 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER trg_users_bi
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  :NEW.id := users_seq.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER trg_users_bu
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

INSERT INTO users (id, name, email, password, role, email_verified)
VALUES (1, 'Alice Johnson', 'alice@example.com', 'securepassword', 'admin', 1);

-- REFRESH_TOKENS Table
CREATE TABLE refresh_tokens (
  id NUMBER PRIMARY KEY,
  user_id NUMBER NOT NULL,
  token VARCHAR2(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE SEQUENCE refresh_tokens_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER trg_refresh_bi
BEFORE INSERT ON refresh_tokens
FOR EACH ROW
BEGIN
  :NEW.id := refresh_tokens_seq.NEXTVAL;
END;
/

-- PASSWORD_RESET_TOKENS Table
CREATE TABLE password_reset_tokens (
  id NUMBER PRIMARY KEY,
  user_id NUMBER NOT NULL,
  token VARCHAR2(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reset_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE SEQUENCE password_reset_tokens_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER trg_prt_bi
BEFORE INSERT ON password_reset_tokens
FOR EACH ROW
BEGIN
  :NEW.id := password_reset_tokens_seq.NEXTVAL;
END;
/

-- EMAIL_VERIFICATION_TOKENS Table
CREATE TABLE email_verification_tokens (
  id NUMBER PRIMARY KEY,
  user_id NUMBER NOT NULL,
  token VARCHAR2(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_verif_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE SEQUENCE email_verif_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER trg_evtok_bi
BEFORE INSERT ON email_verification_tokens
FOR EACH ROW
BEGIN
  :NEW.id := email_verif_seq.NEXTVAL;
END;
/

-- EVENTS Table
CREATE TABLE events (
  id NUMBER PRIMARY KEY,
  title VARCHAR2(255) NOT NULL,
  description CLOB,
  image_url VARCHAR2(255),
  event_date DATE NOT NULL,
  time_start TIMESTAMP NOT NULL,
  time_end TIMESTAMP NOT NULL,
  location VARCHAR2(255) NOT NULL,
  category VARCHAR2(50),
  price NUMBER(10,2) DEFAULT 0,
  total_tickets NUMBER DEFAULT 0,
  created_by NUMBER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_event_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE SEQUENCE events_seq START WITH 2 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER trg_events_bi
BEFORE INSERT ON events
FOR EACH ROW
BEGIN
  :NEW.id := events_seq.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER trg_events_bu
BEFORE UPDATE ON events
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

INSERT INTO events (id, title, description, image_url, event_date, time_start, time_end, location, category, price, total_tickets, created_by)
VALUES (
  1,
  'Tech Fest 2025',
  'Annual college tech festival with competitions, workshops, and fun events.',
  'https://example.com/images/techfest.jpg',
  TO_DATE('2025-05-15', 'YYYY-MM-DD'),
  TO_TIMESTAMP('2025-05-15 10:00:00', 'YYYY-MM-DD HH24:MI:SS'),
  TO_TIMESTAMP('2025-05-15 18:00:00', 'YYYY-MM-DD HH24:MI:SS'),
  'Main Auditorium',
  'Technology',
  100,
  300,
  1
);

-- PENDING_EVENTS Table
CREATE TABLE pending_events (
  id NUMBER PRIMARY KEY,
  title VARCHAR2(255) NOT NULL,
  description CLOB,
  image_url VARCHAR2(255),
  event_date DATE NOT NULL,
  time_start TIMESTAMP NOT NULL,
  time_end TIMESTAMP NOT NULL,
  location VARCHAR2(255) NOT NULL,
  category VARCHAR2(50),
  price NUMBER(10,2) DEFAULT 0,
  total_tickets NUMBER DEFAULT 0,
  requester_id NUMBER NOT NULL,
  status VARCHAR2(10) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes CLOB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pending_requester FOREIGN KEY (requester_id) REFERENCES users(id)
);

CREATE SEQUENCE pending_events_seq START WITH 2 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER trg_pevents_bi
BEFORE INSERT ON pending_events
FOR EACH ROW
BEGIN
  :NEW.id := pending_events_seq.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER trg_pevents_bu
BEFORE UPDATE ON pending_events
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

INSERT INTO pending_events (id, title, description, image_url, event_date, time_start, time_end, location, category, price, total_tickets, requester_id, status)
VALUES (
  1,
  'Art Expo 2025',
  'Student-led art exhibition with live painting and sculptures.',
  'https://example.com/images/artexpo.jpg',
  TO_DATE('2025-06-20', 'YYYY-MM-DD'),
  TO_TIMESTAMP('2025-06-20 12:00:00', 'YYYY-MM-DD HH24:MI:SS'),
  TO_TIMESTAMP('2025-06-20 17:00:00', 'YYYY-MM-DD HH24:MI:SS'),
  'Gallery Hall',
  'Arts',
  50,
  100,
  1,
  'pending'
);

-- TICKETS Table
CREATE TABLE tickets (
  id NUMBER PRIMARY KEY,
  event_id NUMBER NOT NULL,
  user_id NUMBER NOT NULL,
  quantity NUMBER DEFAULT 1,
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR2(10) DEFAULT 'booked' CHECK (status IN ('booked', 'cancelled')),
  CONSTRAINT fk_ticket_event FOREIGN KEY (event_id) REFERENCES events(id),
  CONSTRAINT fk_ticket_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE SEQUENCE tickets_seq START WITH 2 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER trg_tickets_bi
BEFORE INSERT ON tickets
FOR EACH ROW
BEGIN
  :NEW.id := tickets_seq.NEXTVAL;
END;
/

INSERT INTO tickets (id, event_id, user_id, quantity, status)
VALUES (1, 1, 1, 2, 'booked');
