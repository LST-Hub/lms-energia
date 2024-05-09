function convertSecToTime(sec) {
  const seconds = Number(sec);

  if (!seconds) {
    return "00:00";
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function convertTimeToSec(time) {
  const timeRegex = /^\d+(:[0-5][0-9]){0,2}$/;
  if (!timeRegex.test(time)) return 0;

  const [hours, min, sec] = String(time).split(":");
  let totalSec = Number(hours) * 3600;
  if (Number(min)) totalSec += Number(min) * 60;
  if (Number(sec)) totalSec += Number(sec);
  return totalSec;
}

function convertToDayTime(timeStr) {
  if (!timeStr) return "0:00";
  let str = String(timeStr).trim();
  const times = String(str).split(":");
  if (times.length > 2) {
    str = times[0] + ":" + times[1];
  }
  const timeRegex = /^(0*[0-1]?[0-9]|0*2[0-3])((:[0-5][0-9])|(:[0-9]))$/;
  if (timeRegex.test(str)) {
    if (String(str).includes(":")) {
      const nums = String(str).split(":");
      if (nums[1].length === 1) {
        const n = Number(nums[1]);
        if (n < 6) {
          return nums[0] + ":" + nums[1] + "0";
        }
        return nums[0] + ":" + "0" + nums[1];
      }
    }
    return str;
  }
  // this string contains : but not in the right format, thren return 0:00
  if (times.length > 1) return "0:00";
  const numRegex = /^(0*[0-1]?[0-9]|0*2[0-3])(\.[0-9]?[0-9]){0,1}$/;
  if (!numRegex.test(String(str))) {
    return "0:00";
  }
  let time = Number(str);
  // Separate the int from the decimal part
  let hour = Math.floor(time);
  let decpart = time - hour;

  let min = 1 / 60;
  // Round to nearest minute
  decpart = min * Math.round(decpart / min);

  let minute = Math.floor(decpart * 60) + "";

  // Add padding if need
  if (minute.length < 2) {
    minute = "0" + minute;
  }

  // Concate hours and minutes
  time = hour + ":" + minute;

  return String(time);
}

function convertToTime(timeStr) {
  if (!timeStr) return "0:00";
  if (timeStr && timeStr.startsWith(":")) {
    timeStr = "0" + timeStr;
  }
  let str = String(timeStr).trim();
  const times = String(str).split(":");
  if (times.length > 2) {
    str = times[0] + ":" + times[1];
  }
  const timeRegex = /^(([0-9]){0,5}|100000)((:[0-5][0-9])|(:[0-9]))$/;
  if (timeRegex.test(str)) {
    if (String(str).includes(":")) {
      const nums = String(str).split(":");
      if (nums[1].length === 1) {
        const n = Number(nums[1]);
        if (n < 6) {
          return nums[0] + ":" + nums[1] + "0";
        }
        return nums[0] + ":" + "0" + nums[1];
      }
    }
    return str;
  }
  // this string contains : but not in the right format, thren return 0:00
  if (times.length > 1) return str;
  const numRegex = /^(([0-9]){0,5}|100000)(\.[0-9]?[0-9]){0,1}$/;
  if (!numRegex.test(String(str))) {
    return str;
  }
  let time = Number(str);
  // Separate the int from the decimal part
  let hour = Math.floor(time);
  let decpart = time - hour;

  let min = 1 / 60;
  // Round to nearest minute
  decpart = min * Math.round(decpart / min);

  let minute = Math.floor(decpart * 60) + "";

  // Add padding if need
  if (minute.length < 2) {
    minute = "0" + minute;
  }

  // Concate hours and minutes
  time = hour + ":" + minute;

  return String(time);
}

// function convertToTimeFotTimeSheet(timeStr) {
//   if (!timeStr) return "0:00";
//   let str = String(timeStr).trim();
//   const times = String(str).split(":");
//   if (times.length > 2) {
//     str = times[0] + ":" + times[1];
//   }
//   const timeRegex = /^(([0-9]){0,5}|100000)((:[0-5][0-9])|(:[0-9]))$/;
//   if (timeRegex.test(str)) {
//     if (String(str).includes(":")) {
//       const nums = String(str).split(":");
//       if (nums[1].length === 1) {
//         const n = Number(nums[1]);
//         if (n < 6) {
//           return nums[0] + ":" + nums[1] + "0";
//         }
//         return nums[0] + ":" + "0" + nums[1];
//       }
//     }
//     return str;
//   }
//   // this string contains : but not in the right format, thren return 0:00
//   if (times.length > 1) return "0:00";
//   const numRegex = /^(([0-9]){0,5}|100000)(\.[0-9]?[0-9]){0,1}$/;
//   if (!numRegex.test(String(str))) {
//     return "0:00";
//   }
//   let time = Number(str);
//   // Separate the int from the decimal part
//   let hour = Math.floor(time);
//   let decpart = time - hour;

//   let min = 1 / 60;
//   // Round to nearest minute
//   decpart = min * Math.round(decpart / min);

//   let minute = Math.floor(decpart * 60) + "";

//   // Add padding if need
//   if (minute.length < 2) {
//     minute = "0" + minute;
//   }

//   // Concate hours and minutes
//   time = hour + ":" + minute;

//   return String(time);
// }

function convertToTimeFotTimeSheet(timeStr) {
  if (!timeStr) return "0:00";
  // check if timeStr contains charaters
  // const regex = /^(([0-9]){0,5}|100000)((:[0-5][0-9])|(:[0-9]))$/;
  if (timeStr && !/^[0-9]*([.:][0-9]+)?$/.test(timeStr)) {
    return timeStr;
  }

  if (timeStr && timeStr.startsWith(":")) {
    timeStr = "0" + timeStr;
  }

  let str = String(timeStr).trim();
  const times = String(str).split(":");
  if (times.length > 2) {
    str = times[0] + ":" + times[1];
  }
  const timeRegex = /^(([0-9]){0,5}|100000)((:[0-5][0-9])|(:[0-9]))$/;
  if (timeRegex.test(str)) {
    if (String(str).includes(":")) {
      const nums = String(str).split(":");
      if (nums[1].length === 1) {
        const n = Number(nums[1]);
        if (n < 6) {
          return nums[0] + ":" + nums[1] + "0";
        }
        return nums[0] + ":" + "0" + nums[1];
      }
    }
    // Check if hours are less than 24
    const hours = parseInt(times[0]);
    if (hours > 24) {
      return str;
    }
    return str;
  }
  // this string contains : but not in the right format, thren return 0:00
  if (times.length > 1) return "0:00";
  const numRegex = /^(([0-9]){0,5}|100000)(\.[0-9]?[0-9]){0,1}$/;
  if (!numRegex.test(String(str))) {
    return "0:00";
  }
  let time = Number(str);
  // Separate the int from the decimal part
  let hour = Math.floor(time);
  let decpart = time - hour;

  let min = 1 / 60;
  // Round to nearest minute
  decpart = min * Math.round(decpart / min);

  let minute = Math.floor(decpart * 60) + "";

  // Add padding if need
  if (minute.length < 2) {
    minute = "0" + minute;
  }

  // Check if hours are less than 24
  if (hour > 24) {
    return str;
  }

  // Concate hours and minutes
  time = hour + ":" + minute;

  return String(time);
}


function timeWithMaridian(timeStr) {
  if (!timeStr) return "0:00 AM";

  // Check if timeStr contains characters
  if (timeStr && !/^\d*(\.\d+)?$/.test(timeStr)) {
    return timeStr;
  }

  if (timeStr && timeStr.startsWith(":")) {
    timeStr = "0" + timeStr;
  }

  let str = String(timeStr).trim();
  const times = String(str).split(":");

  if (times.length > 2) {
    str = times[0] + ":" + times[1];
  }

  const timeRegex = /^(\d{1,5}|100000)((:\d{1,2})|(:\d{1,2})?)$/;

  if (timeRegex.test(str)) {
    if (String(str).includes(":")) {
      const nums = String(str).split(":");
      if (nums[1].length === 1) {
        const n = Number(nums[1]);
        if (n < 6) {
          return `${nums[0]}:${nums[1]}0 AM`;
        }
        return `${nums[0]}:0${nums[1]} AM`;
      }
    }

    // Check if hours are less than 24
    const hours = parseInt(times[0]);
    if (hours > 24) {
      return str;
    }

    let ampm = "AM";
    let formattedHours = hours;
    if (hours >= 12) {
      ampm = "PM";
      formattedHours = hours === 12 ? 12 : hours - 12;
    } else if (hours === 0) {
      formattedHours = 12;
    }

    const minute = times[1] || "00";
    return `${formattedHours}:${minute} ${ampm}`;
  }

  // This string contains ':' but not in the right format, then return '0:00 AM'
  if (times.length > 1) return "0:00 AM";

  const numRegex = /^(\d{1,5}|100000)(\.\d{1,2})?$/;
  if (!numRegex.test(String(str))) {
    return "0:00 AM";
  }

  let time = Number(str);

  // Separate the integer from the decimal part
  let hour = Math.floor(time);
  let decpart = time - hour;
  let min = 1 / 60;

  // Round to nearest minute
  decpart = min * Math.round(decpart / min);
  let minute = Math.floor(decpart * 60) + "";

  // Add padding if needed
  if (minute.length < 2) {
    minute = "0" + minute;
  }

  // Check if hours are less than 24
  if (hour > 24) {
    return str;
  }

  let ampm = "AM";
  if (hour >= 12) {
    ampm = "PM";
    hour = hour === 12 ? 12 : hour - 12;
  } else if (hour === 0) {
    hour = 12;
  }

  // Concatenate hours and minutes with AM/PM
  return `${hour}:${minute} ${ampm}`;
}
export { convertSecToTime, convertTimeToSec, convertToDayTime, convertToTime, convertToTimeFotTimeSheet,timeWithMaridian };
