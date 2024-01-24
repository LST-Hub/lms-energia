-- AlterTable
ALTER TABLE `timesheetsettings` ADD COLUMN `emailReminderEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `emailRreminderTime` DATETIME(3) NULL;
