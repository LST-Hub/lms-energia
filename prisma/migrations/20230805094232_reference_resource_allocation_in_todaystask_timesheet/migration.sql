-- AlterTable
ALTER TABLE `timesheet` ADD COLUMN `resourceAllocationId` INTEGER NULL;

-- AlterTable
ALTER TABLE `todaystask` ADD COLUMN `resourceAllocationId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Timesheet` ADD CONSTRAINT `Timesheet_workspaceId_resourceAllocationId_fkey` FOREIGN KEY (`workspaceId`, `resourceAllocationId`) REFERENCES `ResourceAllocation`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TodaysTask` ADD CONSTRAINT `TodaysTask_workspaceId_resourceAllocationId_fkey` FOREIGN KEY (`workspaceId`, `resourceAllocationId`) REFERENCES `ResourceAllocation`(`workspaceId`, `id`) ON DELETE RESTRICT ON UPDATE CASCADE;
