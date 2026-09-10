CREATE DATABASE IF NOT EXISTS newsdb;
USE newsdb;

CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL
);

INSERT INTO posts(title, description)
VALUES
('NodeJS', 'Lập trình backend với Node.js thuần'),
('Web động', 'Server trả về nội dung tương ứng với request'),
('React', 'Lập trình giao diện frontend với React');