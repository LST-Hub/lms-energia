-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `provider_account_id` VARCHAR(191) NOT NULL,
    `refresh_token` VARCHAR(191) NULL,
    `access_token` VARCHAR(191) NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` VARCHAR(191) NULL,
    `session_state` VARCHAR(191) NULL,
    `oauth_token_secret` VARCHAR(191) NULL,
    `oauth_token` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_user_id_key`(`user_id`),
    UNIQUE INDEX `Account_provider_provider_account_id_key`(`provider`, `provider_account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `session_token` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_session_token_key`(`session_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `globalId` VARCHAR(191) NOT NULL,
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `email_verified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `hashedPassword` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `designation` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `supervisorId` INTEGER NULL,
    `type` ENUM('Contractor', 'Employee') NULL,
    `roleId` INTEGER NULL,
    `zipCode` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `gender` ENUM('Male', 'Female', 'Other') NULL,
    `notes` VARCHAR(2000) NULL,
    `canBePM` BOOLEAN NULL,
    `canBeSupervisor` BOOLEAN NULL,
    `invited` BOOLEAN NULL,
    `acceptedinvite` BOOLEAN NULL DEFAULT false,
    `departmentId` INTEGER NULL,
    `workspaceId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `workCalendarId` INTEGER NULL,
    `createdById` INTEGER NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_workspaceId_email_key`(`workspaceId`, `email`),
    UNIQUE INDEX `User_workspaceId_id_key`(`workspaceId`, `id`),
    PRIMARY KEY (`globalId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Workspace` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdByGlobalId` VARCHAR(191) NOT NULL,
    `workspaceTypeId` INTEGER NULL,
    `companySize` VARCHAR(191) NULL,
    `estimatedUsers` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkspaceType` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `globalId` INTEGER NOT NULL AUTO_INCREMENT,
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `workspaceId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Department_workspaceId_id_key`(`workspaceId`, `id`),
    PRIMARY KEY (`globalId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roleRestriction` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permission` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissionAccess` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `globalId` INTEGER NOT NULL AUTO_INCREMENT,
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(2000) NOT NULL,
    `restrictionId` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `systemGenerated` BOOLEAN NOT NULL DEFAULT false,
    `workspaceId` INTEGER NOT NULL,

    UNIQUE INDEX `Role_workspaceId_id_key`(`workspaceId`, `id`),
    PRIMARY KEY (`globalId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RolePermissions` (
    `roleId` INTEGER NOT NULL,
    `permissionId` INTEGER NOT NULL,
    `accessLevel` INTEGER NOT NULL,
    `workspaceId` INTEGER NOT NULL,

    PRIMARY KEY (`workspaceId`, `roleId`, `permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuestionsAfterSignup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `answer` VARCHAR(191) NOT NULL,
    `questionId` INTEGER NOT NULL,
    `workspaceId` INTEGER NOT NULL,

    UNIQUE INDEX `QuestionsAfterSignup_questionId_workspaceId_key`(`questionId`, `workspaceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkCalendar` (
    `globalId` INTEGER NOT NULL AUTO_INCREMENT,
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(2000) NULL,
    `startTime` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `systemGenerated` BOOLEAN NOT NULL DEFAULT false,
    `workspaceId` INTEGER NOT NULL,

    UNIQUE INDEX `WorkCalendar_workspaceId_id_key`(`workspaceId`, `id`),
    PRIMARY KEY (`globalId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NonWorkingDays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `description` VARCHAR(2000) NULL,
    `workCalendarId` INTEGER NOT NULL,
    `workspaceId` INTEGER NOT NULL,

    INDEX `NonWorkingDays_workCalendarId_idx`(`workCalendarId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeeklyWorkingDays` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `time` INTEGER NOT NULL,
    `day` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    `workCalendarId` INTEGER NOT NULL,
    `workspaceId` INTEGER NOT NULL,

    INDEX `WeeklyWorkingDays_workCalendarId_idx`(`workCalendarId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CurrencyLists` (
    `id` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `CurrencyLists_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Currency` (
    `globalId` INTEGER NOT NULL AUTO_INCREMENT,
    `id` INTEGER NOT NULL,
    `currencyId` INTEGER NOT NULL,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `systemGenerated` BOOLEAN NOT NULL DEFAULT false,
    `workspaceId` INTEGER NOT NULL,

    UNIQUE INDEX `Currency_workspaceId_id_key`(`workspaceId`, `id`),
    UNIQUE INDEX `Currency_workspaceId_currencyId_key`(`workspaceId`, `currencyId`),
    PRIMARY KEY (`globalId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `globalId` INTEGER NOT NULL AUTO_INCREMENT,
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `notes` VARCHAR(2000) NULL,
    `createdById` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `workspaceId` INTEGER NOT NULL,

    UNIQUE INDEX `Client_workspaceId_id_key`(`workspaceId`, `id`),
    PRIMARY KEY (`globalId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Status` (
    `globalId` INTEGER NOT NULL AUTO_INCREMENT,
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `systemGenerated` BOOLEAN NOT NULL DEFAULT false,
    `workspaceId` INTEGER NOT NULL,

    UNIQUE INDEX `Status_workspaceId_id_key`(`workspaceId`, `id`),
    PRIMARY KEY (`globalId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Priority` (
    `globalId` INTEGER NOT NULL AUTO_INCREMENT,
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `systemGenerated` BOOLEAN NOT NULL DEFAULT false,
    `workspaceId` INTEGER NOT NULL,

    UNIQUE INDEX `Priority_workspaceId_id_key`(`workspaceId`, `id`),
    PRIMARY KEY (`globalId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attachment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `sizeInKb` INTEGER NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `createdById` INTEGER NOT NULL,
    `expenseId` INTEGER NULL,
    `workspaceId` INTEGER NOT NULL,

    UNIQUE INDEX `Attachment_key_key`(`key`),
    UNIQUE INDEX `Attachment_workspaceId_id_key`(`workspaceId`, `id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `globalId` INTEGER NOT NULL AUTO_INCREMENT,
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(2000) NULL,
    `clientId` INTEGER NOT NULL,
    `pmId` INTEGER NOT NULL,
    `statusId` INTEGER NULL,
    `priorityId` INTEGER NULL,
    `startDate` DATE NULL,
    `estimatedTime` INTEGER NULL,
    `estimatedEndDate` DATE NULL,
    `actualEndDate` DATE NULL,
    `canSupervisorApproveTime` BOOLEAN NOT NULL DEFAULT false,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `workspaceId` INTEGER NOT NULL,

    UNIQUE INDEX `Project_workspaceId_id_key`(`workspaceId`, `id`),
    PRIMARY KEY (`globalId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectUser` (
    `projectId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `workspaceId` INTEGER NOT NULL,

    PRIMARY KEY (`workspaceId`, `projectId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task` (
    `globalId` INTEGER NOT NULL AUTO_INCREMENT,
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(2000) NULL,
    `projectId` INTEGER NOT NULL,
    `statusId` INTEGER NULL,
    `priorityId` INTEGER NULL,
    `startDate` DATE NULL,
    `estimatedTime` INTEGER NULL,
    `estimatedEndDate` DATE NULL,
    `actualEndDate` DATE NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `billable` BOOLEAN NULL DEFAULT false,
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `workspaceId` INTEGER NOT NULL,

    UNIQUE INDEX `Task_workspaceId_id_key`(`workspaceId`, `id`),
    PRIMARY KEY (`globalId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaskUser` (
    `taskId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `workspaceId` INTEGER NOT NULL,

    PRIMARY KEY (`workspaceId`, `taskId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Timesheet` (
    `globalId` INTEGER NOT NULL AUTO_INCREMENT,
    `id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `duration` INTEGER NOT NULL,
    `description` VARCHAR(2000) NULL,
    `taskId` INTEGER NOT NULL,
    `projectId` INTEGER NOT NULL,
    `createdById` INTEGER NOT NULL,
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `approvedById` INTEGER NULL,
    `approvedAt` DATETIME(3) NULL,
    `rejected` BOOLEAN NOT NULL DEFAULT false,
    `rejectedById` INTEGER NULL,
    `rejectedAt` DATETIME(3) NULL,
    `rejectionNote` VARCHAR(2000) NULL,
    `submittedForApproval` BOOLEAN NULL,
    `status` ENUM('Draft', 'Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `workspaceId` INTEGER NOT NULL,

    UNIQUE INDEX `Timesheet_workspaceId_id_key`(`workspaceId`, `id`),
    PRIMARY KEY (`globalId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TodaysTask` (
    `globalId` INTEGER NOT NULL AUTO_INCREMENT,
    `id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `duration` INTEGER NOT NULL,
    `description` VARCHAR(2000) NULL,
    `taskId` INTEGER NOT NULL,
    `projectId` INTEGER NOT NULL,
    `createdById` INTEGER NOT NULL,
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `approvedById` INTEGER NULL,
    `approvedAt` DATETIME(3) NULL,
    `rejected` BOOLEAN NOT NULL DEFAULT false,
    `rejectedById` INTEGER NULL,
    `rejectedAt` DATETIME(3) NULL,
    `rejectionNote` VARCHAR(2000) NULL,
    `submittedForApproval` BOOLEAN NULL,
    `status` ENUM('Draft', 'Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Draft',
    `convertedToTimesheet` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `workspaceId` INTEGER NOT NULL,

    UNIQUE INDEX `TodaysTask_workspaceId_id_key`(`workspaceId`, `id`),
    PRIMARY KEY (`globalId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExpenseCategory` (
    `globalId` INTEGER NOT NULL AUTO_INCREMENT,
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(2000) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `systemGenerated` BOOLEAN NOT NULL DEFAULT false,
    `workspaceId` INTEGER NOT NULL,

    UNIQUE INDEX `ExpenseCategory_workspaceId_id_key`(`workspaceId`, `id`),
    PRIMARY KEY (`globalId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Expense` (
    `globalId` INTEGER NOT NULL AUTO_INCREMENT,
    `id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `currencyId` INTEGER NOT NULL,
    `expenseCategoryId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `projectId` INTEGER NOT NULL,
    `memo` VARCHAR(191) NULL,
    `createdById` INTEGER NOT NULL,
    `approved` BOOLEAN NULL DEFAULT false,
    `approvedById` INTEGER NULL,
    `approvedAt` DATETIME(3) NULL,
    `rejected` BOOLEAN NULL DEFAULT false,
    `rejectedById` INTEGER NULL,
    `rejectedAt` DATETIME(3) NULL,
    `rejectionNote` VARCHAR(2000) NULL,
    `submittedForApproval` BOOLEAN NULL,
    `status` ENUM('Draft', 'Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Draft',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `workspaceId` INTEGER NOT NULL,

    UNIQUE INDEX `Expense_workspaceId_id_key`(`workspaceId`, `id`),
    PRIMARY KEY (`globalId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResourceAllocation` (
    `globalId` INTEGER NOT NULL AUTO_INCREMENT,
    `id` INTEGER NOT NULL,
    `repeatId` VARCHAR(191) NULL,
    `projectId` INTEGER NOT NULL,
    `taskId` INTEGER NOT NULL,
    `allocatedUserId` INTEGER NOT NULL,
    `date` DATE NULL,
    `duration` INTEGER NOT NULL,
    `startDate` DATE NULL,
    `endDate` DATE NULL,
    `repetationType` ENUM('DontRepeat', 'Daily', 'Weekly', 'Monthly') NOT NULL DEFAULT 'DontRepeat',
    `createdById` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `workspaceId` INTEGER NOT NULL,
    `userGlobalId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ResourceAllocation_workspaceId_id_key`(`workspaceId`, `id`),
    PRIMARY KEY (`globalId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TodaysTaskSettings` (
    `workspaceId` INTEGER NOT NULL,
    `approvalEnabled` BOOLEAN NOT NULL DEFAULT false,
    `sendMailForApproval` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`workspaceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TimesheetSettings` (
    `workspaceId` INTEGER NOT NULL,
    `approvalEnabled` BOOLEAN NOT NULL DEFAULT true,
    `sendMailForApproval` BOOLEAN NOT NULL DEFAULT false,
    `addPendingInActualTime` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`workspaceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkspaceSettings` (
    `workspaceId` INTEGER NOT NULL,
    `todaysTaskEnabled` BOOLEAN NOT NULL DEFAULT false,
    `defaultWorkCalId` INTEGER NULL,

    UNIQUE INDEX `WorkspaceSettings_workspaceId_defaultWorkCalId_key`(`workspaceId`, `defaultWorkCalId`),
    PRIMARY KEY (`workspaceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecordCounts` (
    `workspaceId` INTEGER NOT NULL,
    `user` INTEGER NOT NULL DEFAULT 0,
    `project` INTEGER NOT NULL DEFAULT 0,
    `task` INTEGER NOT NULL DEFAULT 0,
    `client` INTEGER NOT NULL DEFAULT 0,
    `role` INTEGER NOT NULL DEFAULT 0,
    `department` INTEGER NOT NULL DEFAULT 0,
    `workCalendar` INTEGER NOT NULL DEFAULT 0,
    `timesheet` INTEGER NOT NULL DEFAULT 0,
    `todaysTask` INTEGER NOT NULL DEFAULT 0,
    `expense` INTEGER NOT NULL DEFAULT 0,
    `expenseCategory` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 0,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `currency` INTEGER NOT NULL DEFAULT 0,
    `resourceAllocation` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`workspaceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AttachmentToProject` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_AttachmentToProject_AB_unique`(`A`, `B`),
    INDEX `_AttachmentToProject_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AttachmentToTask` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_AttachmentToTask_AB_unique`(`A`, `B`),
    INDEX `_AttachmentToTask_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AttachmentToExpense` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_AttachmentToExpense_AB_unique`(`A`, `B`),
    INDEX `_AttachmentToExpense_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`globalId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`globalId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_workspaceId_supervisorId_fkey` FOREIGN KEY (`workspaceId`, `supervisorId`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_workspaceId_roleId_fkey` FOREIGN KEY (`workspaceId`, `roleId`) REFERENCES `Role`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_workspaceId_departmentId_fkey` FOREIGN KEY (`workspaceId`, `departmentId`) REFERENCES `Department`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_workspaceId_workCalendarId_fkey` FOREIGN KEY (`workspaceId`, `workCalendarId`) REFERENCES `WorkCalendar`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_workspaceId_createdById_fkey` FOREIGN KEY (`workspaceId`, `createdById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Workspace` ADD CONSTRAINT `Workspace_createdByGlobalId_fkey` FOREIGN KEY (`createdByGlobalId`) REFERENCES `User`(`globalId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Workspace` ADD CONSTRAINT `Workspace_workspaceTypeId_fkey` FOREIGN KEY (`workspaceTypeId`) REFERENCES `WorkspaceType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Department` ADD CONSTRAINT `Department_workspaceId_createdById_fkey` FOREIGN KEY (`workspaceId`, `createdById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_restrictionId_fkey` FOREIGN KEY (`restrictionId`) REFERENCES `roleRestriction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_workspaceId_createdById_fkey` FOREIGN KEY (`workspaceId`, `createdById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Role` ADD CONSTRAINT `Role_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermissions` ADD CONSTRAINT `RolePermissions_accessLevel_fkey` FOREIGN KEY (`accessLevel`) REFERENCES `permissionAccess`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermissions` ADD CONSTRAINT `RolePermissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermissions` ADD CONSTRAINT `RolePermissions_workspaceId_roleId_fkey` FOREIGN KEY (`workspaceId`, `roleId`) REFERENCES `Role`(`workspaceId`, `id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermissions` ADD CONSTRAINT `RolePermissions_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuestionsAfterSignup` ADD CONSTRAINT `QuestionsAfterSignup_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkCalendar` ADD CONSTRAINT `WorkCalendar_workspaceId_createdById_fkey` FOREIGN KEY (`workspaceId`, `createdById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkCalendar` ADD CONSTRAINT `WorkCalendar_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NonWorkingDays` ADD CONSTRAINT `NonWorkingDays_workspaceId_workCalendarId_fkey` FOREIGN KEY (`workspaceId`, `workCalendarId`) REFERENCES `WorkCalendar`(`workspaceId`, `id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NonWorkingDays` ADD CONSTRAINT `NonWorkingDays_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeeklyWorkingDays` ADD CONSTRAINT `WeeklyWorkingDays_workspaceId_workCalendarId_fkey` FOREIGN KEY (`workspaceId`, `workCalendarId`) REFERENCES `WorkCalendar`(`workspaceId`, `id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeeklyWorkingDays` ADD CONSTRAINT `WeeklyWorkingDays_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Currency` ADD CONSTRAINT `Currency_currencyId_fkey` FOREIGN KEY (`currencyId`) REFERENCES `CurrencyLists`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Currency` ADD CONSTRAINT `Currency_workspaceId_createdById_fkey` FOREIGN KEY (`workspaceId`, `createdById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Currency` ADD CONSTRAINT `Currency_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_workspaceId_createdById_fkey` FOREIGN KEY (`workspaceId`, `createdById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Status` ADD CONSTRAINT `Status_workspaceId_createdById_fkey` FOREIGN KEY (`workspaceId`, `createdById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Status` ADD CONSTRAINT `Status_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Priority` ADD CONSTRAINT `Priority_workspaceId_createdById_fkey` FOREIGN KEY (`workspaceId`, `createdById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Priority` ADD CONSTRAINT `Priority_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attachment` ADD CONSTRAINT `Attachment_workspaceId_createdById_fkey` FOREIGN KEY (`workspaceId`, `createdById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attachment` ADD CONSTRAINT `Attachment_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_workspaceId_clientId_fkey` FOREIGN KEY (`workspaceId`, `clientId`) REFERENCES `Client`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_workspaceId_pmId_fkey` FOREIGN KEY (`workspaceId`, `pmId`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_workspaceId_statusId_fkey` FOREIGN KEY (`workspaceId`, `statusId`) REFERENCES `Status`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_workspaceId_priorityId_fkey` FOREIGN KEY (`workspaceId`, `priorityId`) REFERENCES `Priority`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_workspaceId_createdById_fkey` FOREIGN KEY (`workspaceId`, `createdById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectUser` ADD CONSTRAINT `ProjectUser_workspaceId_userId_fkey` FOREIGN KEY (`workspaceId`, `userId`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectUser` ADD CONSTRAINT `ProjectUser_workspaceId_projectId_fkey` FOREIGN KEY (`workspaceId`, `projectId`) REFERENCES `Project`(`workspaceId`, `id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectUser` ADD CONSTRAINT `ProjectUser_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_workspaceId_projectId_fkey` FOREIGN KEY (`workspaceId`, `projectId`) REFERENCES `Project`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_workspaceId_statusId_fkey` FOREIGN KEY (`workspaceId`, `statusId`) REFERENCES `Status`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_workspaceId_priorityId_fkey` FOREIGN KEY (`workspaceId`, `priorityId`) REFERENCES `Priority`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_workspaceId_createdById_fkey` FOREIGN KEY (`workspaceId`, `createdById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskUser` ADD CONSTRAINT `TaskUser_workspaceId_userId_fkey` FOREIGN KEY (`workspaceId`, `userId`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskUser` ADD CONSTRAINT `TaskUser_workspaceId_taskId_fkey` FOREIGN KEY (`workspaceId`, `taskId`) REFERENCES `Task`(`workspaceId`, `id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TaskUser` ADD CONSTRAINT `TaskUser_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Timesheet` ADD CONSTRAINT `Timesheet_workspaceId_taskId_fkey` FOREIGN KEY (`workspaceId`, `taskId`) REFERENCES `Task`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Timesheet` ADD CONSTRAINT `Timesheet_workspaceId_projectId_fkey` FOREIGN KEY (`workspaceId`, `projectId`) REFERENCES `Project`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Timesheet` ADD CONSTRAINT `Timesheet_workspaceId_createdById_fkey` FOREIGN KEY (`workspaceId`, `createdById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Timesheet` ADD CONSTRAINT `Timesheet_workspaceId_approvedById_fkey` FOREIGN KEY (`workspaceId`, `approvedById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Timesheet` ADD CONSTRAINT `Timesheet_workspaceId_rejectedById_fkey` FOREIGN KEY (`workspaceId`, `rejectedById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Timesheet` ADD CONSTRAINT `Timesheet_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TodaysTask` ADD CONSTRAINT `TodaysTask_workspaceId_taskId_fkey` FOREIGN KEY (`workspaceId`, `taskId`) REFERENCES `Task`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TodaysTask` ADD CONSTRAINT `TodaysTask_workspaceId_projectId_fkey` FOREIGN KEY (`workspaceId`, `projectId`) REFERENCES `Project`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TodaysTask` ADD CONSTRAINT `TodaysTask_workspaceId_createdById_fkey` FOREIGN KEY (`workspaceId`, `createdById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TodaysTask` ADD CONSTRAINT `TodaysTask_workspaceId_approvedById_fkey` FOREIGN KEY (`workspaceId`, `approvedById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TodaysTask` ADD CONSTRAINT `TodaysTask_workspaceId_rejectedById_fkey` FOREIGN KEY (`workspaceId`, `rejectedById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TodaysTask` ADD CONSTRAINT `TodaysTask_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExpenseCategory` ADD CONSTRAINT `ExpenseCategory_workspaceId_createdById_fkey` FOREIGN KEY (`workspaceId`, `createdById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExpenseCategory` ADD CONSTRAINT `ExpenseCategory_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_workspaceId_currencyId_fkey` FOREIGN KEY (`workspaceId`, `currencyId`) REFERENCES `Currency`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_workspaceId_expenseCategoryId_fkey` FOREIGN KEY (`workspaceId`, `expenseCategoryId`) REFERENCES `ExpenseCategory`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_workspaceId_projectId_fkey` FOREIGN KEY (`workspaceId`, `projectId`) REFERENCES `Project`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_workspaceId_createdById_fkey` FOREIGN KEY (`workspaceId`, `createdById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_workspaceId_approvedById_fkey` FOREIGN KEY (`workspaceId`, `approvedById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_workspaceId_rejectedById_fkey` FOREIGN KEY (`workspaceId`, `rejectedById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResourceAllocation` ADD CONSTRAINT `ResourceAllocation_workspaceId_projectId_fkey` FOREIGN KEY (`workspaceId`, `projectId`) REFERENCES `Project`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResourceAllocation` ADD CONSTRAINT `ResourceAllocation_workspaceId_taskId_fkey` FOREIGN KEY (`workspaceId`, `taskId`) REFERENCES `Task`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResourceAllocation` ADD CONSTRAINT `ResourceAllocation_workspaceId_allocatedUserId_fkey` FOREIGN KEY (`workspaceId`, `allocatedUserId`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResourceAllocation` ADD CONSTRAINT `ResourceAllocation_workspaceId_createdById_fkey` FOREIGN KEY (`workspaceId`, `createdById`) REFERENCES `User`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResourceAllocation` ADD CONSTRAINT `ResourceAllocation_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TodaysTaskSettings` ADD CONSTRAINT `TodaysTaskSettings_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimesheetSettings` ADD CONSTRAINT `TimesheetSettings_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkspaceSettings` ADD CONSTRAINT `WorkspaceSettings_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkspaceSettings` ADD CONSTRAINT `WorkspaceSettings_workspaceId_defaultWorkCalId_fkey` FOREIGN KEY (`workspaceId`, `defaultWorkCalId`) REFERENCES `WorkCalendar`(`workspaceId`, `id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecordCounts` ADD CONSTRAINT `RecordCounts_workspaceId_fkey` FOREIGN KEY (`workspaceId`) REFERENCES `Workspace`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttachmentToProject` ADD CONSTRAINT `_AttachmentToProject_A_fkey` FOREIGN KEY (`A`) REFERENCES `Attachment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttachmentToProject` ADD CONSTRAINT `_AttachmentToProject_B_fkey` FOREIGN KEY (`B`) REFERENCES `Project`(`globalId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttachmentToTask` ADD CONSTRAINT `_AttachmentToTask_A_fkey` FOREIGN KEY (`A`) REFERENCES `Attachment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttachmentToTask` ADD CONSTRAINT `_AttachmentToTask_B_fkey` FOREIGN KEY (`B`) REFERENCES `Task`(`globalId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttachmentToExpense` ADD CONSTRAINT `_AttachmentToExpense_A_fkey` FOREIGN KEY (`A`) REFERENCES `Attachment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AttachmentToExpense` ADD CONSTRAINT `_AttachmentToExpense_B_fkey` FOREIGN KEY (`B`) REFERENCES `Expense`(`globalId`) ON DELETE CASCADE ON UPDATE CASCADE;
