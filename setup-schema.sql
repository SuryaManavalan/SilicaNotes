-- Create auth tables to match the current Prisma schema exactly

CREATE TABLE IF NOT EXISTS `User` (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  emailVerified DATETIME(6),
  image TEXT,
  createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

CREATE TABLE IF NOT EXISTS `Account` (
  id VARCHAR(191) PRIMARY KEY,
  userId VARCHAR(191) NOT NULL,
  type VARCHAR(191) NOT NULL,
  provider VARCHAR(191) NOT NULL,
  providerAccountId VARCHAR(191) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INT,
  token_type VARCHAR(191),
  scope VARCHAR(191),
  id_token TEXT,
  session_state VARCHAR(191)
);

CREATE TABLE IF NOT EXISTS `Session` (
  id VARCHAR(191) PRIMARY KEY,
  sessionToken VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  expires DATETIME(6) NOT NULL
);

CREATE TABLE IF NOT EXISTS `VerificationToken` (
  id VARCHAR(191) PRIMARY KEY,
  identifier VARCHAR(191) NOT NULL,
  token VARCHAR(191) NOT NULL,
  expires DATETIME(6) NOT NULL
);

-- Update Note table to match schema (INT id, not BigInt)
DROP TABLE IF EXISTS `Note`;
CREATE TABLE `Note` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  userId VARCHAR(191),
  links JSON DEFAULT NULL,
  createdAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  updatedAt DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);