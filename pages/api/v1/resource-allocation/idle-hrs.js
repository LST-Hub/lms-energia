import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
// import { formatDateForAPI } from "../../../../src/utils/date";
// import { addDays, format } from "date-fns";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    if (req.method === "POST") {
      const { resourcesName, date } = req.body;

      const resourceAllocation = await prisma.resourceAllocation.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          allocatedUserId: {
            in: resourcesName,
          },
          date: {
            gte: new Date(date[0]),
            lte: new Date(new Date(date[1]).getTime() + 86400000),
          },
        },

        select: {
          id: true,
          allocatedUserId: true,
          allocatedUser: {
            select: {
              name: true,
            },
          },
          duration: true,
        },
      });

      const workCalender = await prisma.workCalendar.findMany({
        where: {
          workspaceId: userToken.workspaceId,
          users: {
            some: {
              id: {
                in: resourcesName,
              },
            },
          },
        },
        select: {
          users: {
            select: {
              id: true,
              name: true,
            },
          },
          weeklyWorkingDays: true,
        },
      });

      // BELOW FUNCTION IS WORKING FINE FOR 1 WEEK DATE FILTER

      const calculateHoursForUser = (resourceId, resourceAllocations, workCalendar) => {
        const userAllocations = resourceAllocations.filter((allocation) => allocation.allocatedUserId === resourceId);
        const userCalendar = workCalendar.find((calendar) => calendar.users.some((user) => user.id === resourceId));

        const resourceName = userCalendar ? userCalendar.users.find((user) => user.id === resourceId)?.name : "Unknown";

        const allocatedHrs = userAllocations.reduce((total, allocation) => total + allocation.duration, 0);
        const totalWorkableHrs = userCalendar
          ? userCalendar.weeklyWorkingDays.reduce((total, day) => total + day.time, 0)
          : 0;

        const idleHrs = totalWorkableHrs - allocatedHrs;

        return {
          resourceId,
          resourceName,
          allocatedHours: allocatedHrs,
          idleHours: idleHrs,
          date: `${date[0]} - ${date[1]}`,
        };
      };

      const resultArray = resourcesName.map((resourceId) => {
        return calculateHoursForUser(resourceId, resourceAllocation, workCalender, date);
      });

      // BELOW FUNCTION IS FOR TRYING TO GET THE DATA FOR MULTIPLE WEEKS

      // const calculateHoursForUser = (resourceId, resourceAllocations, workCalendar, startDate, endDate) => {
      //   const userAllocations = resourceAllocations.filter((allocation) => allocation.allocatedUserId === resourceId);
      //   const userCalendar = workCalendar.find((calendar) => calendar.users.some((user) => user.id === resourceId));
      //   const resourceName = userCalendar ? userCalendar.users.find((user) => user.id === resourceId)?.name : "Unknown";

      //   const startDateTime = new Date(formatDateForAPI(startDate));
      //   const endDateTime = new Date(formatDateForAPI(endDate));
      //   const totalDaysInRange = Math.ceil((endDateTime - startDateTime) / (24 * 60 * 60 * 1000)) + 1;

      //   // Filter weekly working days within the specified date range
      //   const filteredWeeklyWorkingDays = userCalendar
      //     ? Array.from({ length: totalDaysInRange }).map((_, index) => {
      //         const currentDate = addDays(startDateTime, index);
      //         return userCalendar.weeklyWorkingDays.find((day) => day.id === currentDate.getDay()); // id is 1-indexed
      //       })
      //     : [];

      //   const totalWorkableHrs = filteredWeeklyWorkingDays.reduce((total, day) => total + (day ? day.time : 0), 0);

      //   const allocatedHrs = userAllocations.reduce((total, allocation) => total + allocation.duration, 0);
      //   const idleHrs = totalWorkableHrs - allocatedHrs;

      //   return {
      //     resourceId,
      //     resourceName,
      //     allocatedHours: allocatedHrs,
      //     idleHours: idleHrs,
      //     date: `${startDate} - ${endDate}`,
      //   };
      // };

      // const resultArray = resourcesName.map((resourceId) => {
      //   return calculateHoursForUser(resourceId, resourceAllocation, workCalender, date[0], date[1]);
      // });

      response({
        res,
        success: true,
        status_code: 200,
        data: resultArray,
      });
    }
  } catch (error) {
    console.log("error while getting idle hrs", error);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
