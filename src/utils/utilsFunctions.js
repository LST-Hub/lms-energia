import {
  backendDebounceTime,
  maxDataLengthForUISearch,
  UIDebounceTime,
  minSearchLength,
  projectUserFieldname,
  taskUserFieldname,
} from "./Constants";
import { formatDateForAPI } from "./date";

function isSearchonUI(data) {
  if (!Array.isArray(data)) return false;
  // if the length of data received from backend is more than 99, then we will not search on UI, we will search on backend
  if (data.length > maxDataLengthForUISearch) return false;
  else return true;
}

/**
 *
 * @param data data should be an array of objects [{}, {}, {}]
 * @param {*} searchQuery query should be a string
 * @param {*} parametersToSearch parametersToSearch should be an array of keys in objects, on which we have to perform search operations
 * @returns filetred data based on query and parametersToSearch
 */
function searchData(data, searchQuery, parametersToSearch) {
  if (!Array.isArray(data)) return data;
  if (!searchQuery) return data;
  if (typeof searchQuery !== "string") return data;

  // only search if searchQuery is altleast 3 characters
  if (searchQuery.length < minSearchLength) return data;

  if (!Array.isArray(parametersToSearch) || parametersToSearch.length === 0) {
    return data.filter((item) => {
      const values = Object.values(item);
      const p = values.find((value) => String(value).toLowerCase().startsWith(searchQuery.toLowerCase()));
      return Boolean(p);
    });
  } else {
    return data.filter((item) => {
      const p = parametersToSearch.find((param) =>
        String(item[param]).toLowerCase().startsWith(searchQuery.toLowerCase())
      );
      return Boolean(p);
    });
  }
}

const filterDateRange = (data, startDate, endDate) => {
  if (!Array.isArray(data)) return data;
  if (!startDate || !endDate) return data;

  return data.filter((item) => {
    /**use formatDateForAPI to format date into yyyy-mm-dd format and to remove time
     * for avoiding any timezone issues
     */
    const itemDate = formatDateForAPI(item.date);
    return itemDate >= formatDateForAPI(startDate) && itemDate <= formatDateForAPI(endDate);
  });
};

/**
 * A custom debounce function, that has a pramter for searchonUI for wait time before searching
 * as we using this debounce in search fields only
 * @param  callback function to be called after wait time
 * @param  wait wait for debounce , default is backendDebounceTime from Constants
 * @returns a function which will be called after wait time
 */
const searchDebounce = (callback, searchOnUI, wait) => {
  const waitTime = wait || searchOnUI ? UIDebounceTime : backendDebounceTime;
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback.apply(null, args);
    }, waitTime);
  };
};

// This fuction in only used for search in project and task index page
const searchProjectTask = (data, searchQuery, parametersToSearch) => {
  if (!Array.isArray(data)) return data;
  if (!searchQuery) return data;
  if (typeof searchQuery !== "string") return data;

  // only search if searchQuery is altleast 3 characters
  if (searchQuery.length < minSearchLength) return data;

  if (!Array.isArray(parametersToSearch) || parametersToSearch.length === 0) {
    return data.filter((item) => {
      const values = Object.values(item);
      const p = values.find((value) => String(value).toLowerCase().startsWith(searchQuery.toLowerCase()));
      return Boolean(p);
    });
  } else {
    return data.filter((item) => {
      const p = parametersToSearch.find((param) => {
        /** we are matching parma for projectUsers and  taskUsers because the structure of data is specific
         * for search in these two parameters
         */
        if (param === projectUserFieldname || param === taskUserFieldname) {
          return item[param].find((item) => String(item.user.name).toLowerCase().startsWith(searchQuery.toLowerCase()));
        } else {
          return String(item[param]).toLowerCase().startsWith(searchQuery.toLowerCase());
        }
      });
      return Boolean(p);
    });
  }
};

/**
 *
 * @param data data should be an array of objects [{}, {}, {}]
 * @param {*} filters object of key value pairs, on which we have to perform filter operations, {keyTofilter: valueToFilter},
 * this function don't filter null and undefined and empty string values, and filter all other values even 0, false and others.
 *  supports only first level filetring for object not nested objects,
 *  like  {key11: {key21: value21}}, key12: value12}, here you cannot filetr on key21 or value21, but can do on key12 and value12
 * @returns filtered data based on filetrs
 */
function filterData(data, filters) {
  if (!Array.isArray(data)) return data;
  if (!filters) return data;

  if (typeof filters === "object" && filters !== null && filters.constructor === Object) {
    // filters is a JSON object

    const newFilters = {};
    // remove all null and undefined values from filters
    for (let key in filters) {
      if (filters[key] === null || filters[key] === undefined || filters[key] === "") continue;
      newFilters[key] = filters[key];
    }

    const filterKeys = Object.keys(newFilters);
    return data.filter((item) => filterKeys.every((key) => item[key] === newFilters[key]));
  } else {
    // filters is not a JSON object
    return data;
  }
}

/**
 * This function perform filter and serach on data from provided parameters and returnes the final data after serach and filter operations
 * @param {*} data data should be an array of objects [{}, {}, {}]
 * @param {*} searchQuery query should be a string
 * @param {*} parametersToSearch parametersToSearch should be an array of keys in objects, on which we have to perform search operations
 * @param {*} filters object of key value pairs, on which we have to perform filter operations, {keyTofilter: valueToFilter},
 * this function don't filter null and undefined values, supports only first level filetring for object not nested objects,
 *  like  {key11: {key21: value21}}, key12: value12}, here you cannot filetr on key21 or value21, but can do on key12 and value12
 * @returns returnes the filtered data after serach and filter operations
 */
function searchAndFilterData(data, searchQuery, parametersToSearch, filters) {
  const filteredData = filterData(data, filters);
  const searchedData = searchData(filteredData, searchQuery, parametersToSearch);
  return searchedData;
}

/**
 * This function perform filter, serach and date range filteration on data from provided parameters and returnes the final data after serach and filter operations
 * @param {*} data data should be an array of objects [{}, {}, {}]
 * @param {*} searchQuery query should be a string
 * @param {*} parametersToSearch parametersToSearch should be an array of keys in objects, on which we have to perform search operations
 * @param {*} filters object of key value pairs, on which we have to perform filter operations, {keyTofilter: valueToFilter},
 * provide null or "" if you dont want to search and only want to filter
 * this function don't filter null and undefined values, supports only first level filetring for object not nested objects,
 *  like  {key11: {key21: value21}}, key12: value12}, here you cannot filetr on key21 or value21, but can do on key12 and value12
 * @returns returnes the filtered data after serach and filter operations
 */

function searchFilterDateRangeData(data, searchQuery, parametersToSearch, filters) {
  const filteredByDate = filterDateRange(data, filters.startDate, filters.endDate);
  const newfilters = { ...filters };
  if (newfilters.startDate) delete newfilters.startDate;
  if (newfilters.endDate) delete newfilters.endDate;
  const filteredData = filterData(filteredByDate, newfilters);
  const searchedData = searchData(filteredData, searchQuery, parametersToSearch);
  return searchedData;
}

/**
 * This function perform filter and serach on data from provided parameters and returnes the final data after serach and filter operations
 * @param {*} data data to serach and filter, data should be an array of objects [{}, {}, {}]
 * @param {*} searchQuery query should be a string
 * @param {*} parametersToSearch parametersToSearch should be an array of keys in objects, on which we have to perform search operations
 * @param {*} filters object of key value pairs, on which we have to perform filter operations, {keyTofilter: valueToFilter},
 * @returns returnes the filtered data after serach and filter operations
 */
function searchAndFilterProjectTask(data, searchQuery, parametersToSearch, filters) {
  const filteredData = filterData(data, filters);
  const searchedData = searchProjectTask(filteredData, searchQuery, parametersToSearch);
  return searchedData;
}

/**
 * @param {*} params object of key value pairs
 * @returns string containing a query string suitable for use in a URL. Does not include the question mark.
 * ```js
 * ```
 * returned query string dosent include null, undefined and empty string values,
 * if want to include null and undefined values in query string, then pass them as string
 * @example
 * convertToURLParamsString({a: 1, b: "name", c: 3}) // returns "a=1&b=name&c=3"
 * convertToURLParamsString({a: 1, c: 3, d: ""}) // returns "a=1&c=3"
 * convertToURLParamsString({a: 1, b: 2, d: false}) // returns "a=1&b=2&d=false"
 * convertToURLParamsString({a: 1, b: 2, c: undefined, d: null}) // 'a=1&b=2'
 * convertToURLParamsString({a: 1, b: "null", d: "undefined"}) // return 'a=1&b=null&d=undefined'
 */
function convertToURLParamsString(params) {
  const urlParams = new URLSearchParams();
  for (let key in params) {
    if (params[key] === null || params[key] === undefined || params[key] === "") continue;
    urlParams.append(key, params[key]);
  }
  return urlParams.toString();
}

export {
  isSearchonUI,
  searchData,
  searchDebounce,
  searchProjectTask,
  filterData,
  searchAndFilterData,
  searchFilterDateRangeData,
  searchAndFilterProjectTask,
  convertToURLParamsString,
};
