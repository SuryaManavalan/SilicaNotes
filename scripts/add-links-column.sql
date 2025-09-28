-- Migration script to add links column to existing Note table
-- Run this if you have an existing database with notes

ALTER TABLE `Note` ADD COLUMN `links` JSON DEFAULT NULL;