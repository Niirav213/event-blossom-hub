-- Drop old tables if needed
BEGIN
  EXECUTE IMMEDIATE 'DROP TABLE tickets CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP TABLE pending_events CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP TABLE events CASCADE CONSTRAINTS';
  EXECUTE IMMEDIATE 'DROP TABLE users CASCADE CONSTRAINTS';
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END;
/

-- USERS Table
CREATE TABLE users (
  id NUMBER PRIMARY KEY,
  name VARCHAR2(100),
  email VARCHAR2(100) UNIQUE NOT NULL,
  password VARCHAR2(100) NOT NULL,
  role VARCHAR2(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE users_seq START WITH 2 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER users_before_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  :NEW.id := users_seq.NEXTVAL;
END;
/

-- Insert one user
INSERT INTO users (id, name, email, password, role)
VALUES (1, 'Alice Johnson', 'alice@example.com', 'securepassword', 'admin');

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

CREATE OR REPLACE TRIGGER events_before_insert
BEFORE INSERT ON events
FOR EACH ROW
BEGIN
  :NEW.id := events_seq.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER events_before_update
BEFORE UPDATE ON events
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Insert one event
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

CREATE OR REPLACE TRIGGER pending_events_before_insert
BEFORE INSERT ON pending_events
FOR EACH ROW
BEGIN
  :NEW.id := pending_events_seq.NEXTVAL;
END;
/

CREATE OR REPLACE TRIGGER pending_events_before_update
BEFORE UPDATE ON pending_events
FOR EACH ROW
BEGIN
  :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Insert one pending event
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

CREATE OR REPLACE TRIGGER tickets_before_insert
BEFORE INSERT ON tickets
FOR EACH ROW
BEGIN
  :NEW.id := tickets_seq.NEXTVAL;
END;
/

-- Insert one ticket
INSERT INTO tickets (id, event_id, user_id, quantity, status)
VALUES (1, 1, 1, 2, 'booked');
