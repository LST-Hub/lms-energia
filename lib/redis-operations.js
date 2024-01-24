import { Redis } from "ioredis";

//TODO: uncomment after setting up redis in production

// const client = new Redis({
//   host: process.env.REDIS_HOST,
//   port: Number(process.env.REDIS_PORT),
//   username: process.env.REDIS_USERNAME,
//   password: process.env.REDIS_PASSWORD,
//   // used  maxRetriesPerRequest options as if suppose redis is not availabel or down, then we fallabck to databse to get data insted of cache
//   // but ioredis by default retry to connect to redis if connection is not established, it retries fo 20 times and hold the request till it retiries for 20 times
//   // if failed after 20 times then it actually releasaes the request and throws error that cannot connect,
//   // so IU have made retry option to 1, so it releases the request as soon not able to connect to redis
//   maxRetriesPerRequest: 1, // made it 1, as the default is 20 which is much high.
//   // kept this retryStrategy function, as ioredis was trying to reconnect redis much frequently, and don't return a number, so it dosent tries to retry
//   retryStrategy(times) {
//     // const delay = Math.min(times * 50, 2000);
//     // return 1000 * 60;
//   },
// });

//TODO: report to error reporting service woth very high priority
// client.on("error", (err) => console.log("Redis Client Error", err)); 

// IMP: Read this before continuing to read the code below
// we have not exported client from this file, completely used here for completness,
// so that if we ever want ot make chnages to redis, completly will be done here
// just maintain the structue of data that is returned by redis like, if returning a object then check if it has all the key values pairs in it

// and we have not used consistent data types for storing, it's all strings,
// but sometimes objects are stored as strings with JSON.stringify and JSON.parse
// sometimes it's just a plain string, sometimes it's a number
// so bear in mind that

/**
 *
 * @param {*} roleId roleId for the role
 * @param {*} workspaceId workspaceId in which this role is there
 * @param {*} data role data to be cached, data should be an object with keys permissions, restrictionId, isAdmin, active, workspaceId
 * @returns void
 */
const redisSetRole = async (roleId, workspaceId, data) => {
  return null;
  try {
    if (process.env.NODE_ENV !== "production") {
      if (!data) throw new Error("role data is not defined");
      if (!workspaceId) throw new Error("workspaceId is not defined");
      if (!roleId) throw new Error("roleId is not defined");
      if (typeof data !== "object") throw new Error("role data is not object");
      if (typeof data.permissions !== "object") throw new Error("role data.permissions is not object");
      if (data.restrictionId === undefined || data.isAdmin === undefined || data.active === undefined)
        throw new Error("role active, isAdmin or restrictionId is not defined");
      if (!data.id) throw new Error("data.id is not defined");
      if (!data.workspaceId) throw new Error("data.workspaceId is not defined");
      // createdbyID will b e null for system generated roles
      // if (data.createdById === undefined) throw new Error("createdById is not defined");
    }
    await client.set(`${workspaceId}:role:${roleId}`, JSON.stringify(data));
  } catch (err) {
    //TODO: report to error reporting service woth very high priority
    console.log("Redis Error while quering role cache", err);
    // delete the cache, if unable to set(update) the cacahe with new data, it will again upadted with new data when api will be callled
    await client
      .del(`${workspaceId}:role:${roleId}`, (error) => {
        //TODO: report to error reporting service woth very high priority
        if (error) console.log("Redis Error while deleting role", error);
      })
      .catch((error) => {
        console.log("Redis Error while deleting role", error);
      });
  }
};

/**
 *
 * @param {*} roleId roleId of the role
 * @param {*} workspaceId workspaceId in which this role is there
 * @returns cached data for role or null if not exist
 */
const redisGetRole = async (roleId, workspaceId) => {
  return null;
  try {
    const cachedValue = await client.get(`${workspaceId}:role:${roleId}`);
    if (cachedValue) {
      return JSON.parse(cachedValue);
    }
    return null;
  } catch (err) {
    //TODO: report to error reporting service woth very high priority
    console.log("Redis Error while quering role cache", err);
    return null;
  }
};

/**
 *
 * @param {*} roleId roleId of the role to be deleted
 * @param {*} workspaceId workspaceId in which this role is there
 * @returns 1 if deleted, 0 if not deleted
 */
const redisDelRole = async (roleId, workspaceId) => {
  return null;
  try {
    const del = await client.del(`${workspaceId}:role:${roleId}`);
    return del;
  } catch (err) {
    //TODO: report to error reporting service woth very high priority
    console.log("Redis Error while quering role cache", err);
    return 0;
  }
};

/**
 *
 * @param {*} userId userid of the user
 * @param {*} workspaceId workspaceId in which this user is there
 * @param {*} data data to be cached, data is object and must contain active, workspaceId, canBePM, canBeSupervisor, roleId
 * @returns void
 */
const redisSetUser = async (userId, workspaceId, data) => {
  return null;
  try {
    if (process.env.NODE_ENV !== "production") {
      if (!data) throw new Error("user data is not defined");
      if (!workspaceId) throw new Error("workspaceId is not defined");
      if (!userId) throw new Error("userId is not defined");
      if (typeof data !== "object") throw new Error("user data is not object");
      if (!data.id) throw new Error("data.id is not defined");
      // not checking for workspaceId as while admin signup, workspaceId is not there, as user not created workspace
      // but workaspaceId in there in user cache
      // role is aslo not therefor that user
      if (!data.workspaceId || !data.roleId) return;
      if (
        data.active === undefined || // this is boolean
        data.canBePM === undefined || // this is boolean
        data.canBeSupervisor === undefined // this is boolean
        // data.createdById === undefined // will be null if user credted the workspace, becuase no one crfedted him
      )
        throw new Error("user active or canBePM or canBeSupervisor is not defined");
    }
    await client.set(`${workspaceId}:user:${userId}`, JSON.stringify(data));
  } catch (err) {
    //TODO: report to error reporting service woth very high priority
    console.log("Redis Error while quering user cache ", err);
    // delete the cache, if unable to set(update) the cacahe with new data, it will again upadted with new data when api will be callled
    await client
      .del(`${workspaceId}:user:${userId}`, (error) => {
        //TODO: report to error reporting service woth very high priority
        if (error) console.log("Redis Error while deleting user", error);
      })
      .catch((error) => {
        console.log("Redis Error while deleting user", error);
      });
  }
};

/**
 *
 * @param {*} userId userid of the user
 * @param {*} workspaceId workspaceId in which this user is there
 * @returns cached data for user or null if not exist
 */
const redisGetUser = async (userId, workspaceId) => {
  return null;
  try {
    const cachedValue = await client.get(`${workspaceId}:user:${userId}`);
    if (cachedValue) {
      return JSON.parse(cachedValue);
    }
    return null;
  } catch (err) {
    //TODO: report to error reporting service woth very high priority
    console.log("Redis Error while quering user cache", err);
    return null;
  }
};

/**
 *
 * @param {*} userId userid of the user, to delete
 * @param {*} workspaceId workspaceId in which this user is there
 * @returns Number, 1 if deleted successfully, 0 if not
 */
const redisDelUser = async (userId, workspaceId) => {
  return null;
  try {
    const del = await client.del(`${workspaceId}:user:${userId}`);
    return del;
  } catch (err) {
    //TODO: report to error reporting service woth very high priority
    console.log("Redis Error while quering user cache", err);
    return 0;
  }
};

// not adding workspace Id's to below cache's as it may not be need in cache becuase we need workspace id to get the cache then why to store here, you already have it
// adddign ids to cache thoughe we need id to access cache, which means we also have id to while accessing cache, so storing id's are also no importnat, but kept it for ease as Id is used after getting cache in some functions
const redisSetProject = async (projectId, workspaceId, data) => {
  return null;
  try {
    if (process.env.NODE_ENV !== "production") {
      if (!data) throw new Error("project data is not defined");
      if (!workspaceId) throw new Error("workspaceId is not defined");
      if (!projectId) throw new Error("projectId is not defined");
      if (typeof data !== "object") throw new Error("project data is not object");
      // if (!data.createdById && data.createdById !== null) throw new Error("data.createdById is not defined"); // not checked for null, as in future it may happen that we give systemGeneratwed project for test or expamle, the createdByid field will be null
      if (!data.pmId && data.pmId !== null) throw new Error("data.pmId is not defined"); // not checked for null, as in future it may happen that we give systemGeneratwed project for test or expamle, the createdByid field will be null
      if (!data.id) throw new Error("data.id is not defined");
    }
    await client.set(`${workspaceId}:project:${projectId}`, JSON.stringify(data));
  } catch (err) {
    //TODO: report to error reporting service woth very high priority
    console.log("Redis Error while quering project cache ", err);
    // delete the cache, if unable to set(update) the cacahe with new data, it will again upadted with new data when api will be callled
    await client
      .del(`${workspaceId}:project:${projectId}`, (error) => {
        //TODO: report to error reporting service woth very high priority
        if (error) console.log("Redis Error while deleting project", error);
      })
      .catch((error) => {
        console.log("Redis Error while deleting project", error);
      });
  }
};

const redisGetProject = async (projectId, workspaceId) => {
  return null;
  try {
    const cachedValue = await client.get(`${workspaceId}:project:${projectId}`);
    if (cachedValue) {
      return JSON.parse(cachedValue);
    }
    return null;
  } catch (err) {
    //TODO: report to error reporting service woth very high priority
    console.log("Redis Error while quering project cache", err);
    return null;
  }
};

const redisDelProject = async (projectId, workspaceId) => {
  return null;
  try {
    const del = await client.del(`${workspaceId}:project:${projectId}`);
    return del;
  } catch (err) {
    //TODO: report to error reporting service woth very high priority
    console.log("Redis Error while quering project cache", err);
    return 0;
  }
};

const redisSetTask = async (taskId, workspaceId, data) => {
  return null;
  try {
    if (process.env.NODE_ENV !== "production") {
      if (!data) throw new Error("task data is not defined");
      if (!workspaceId) throw new Error("workspaceId is not defined");
      if (!taskId) throw new Error("taskId is not defined");
      if (typeof data !== "object") throw new Error("task data is not object");
      if (!data.projectId) throw new Error("data.projectId is not defined");
      // if (!data.createdById && data.createdById !== null) throw new Error("data.createdById is not defined"); // not checked for null, as in future it may happen that we give systemGeneratwed task for test or expamle, the createdByid field will be null
      if (!data.id) throw new Error("data.id is not defined");
    }
    await client.set(`${workspaceId}:task:${taskId}`, JSON.stringify(data));
  } catch (err) {
    //TODO: report to error reporting service woth very high priority
    console.log("Redis Error while quering task cache ", err);
    // delete the cache, if unable to set(update) the cacahe with new data, it will again upadted with new data when api will be callled
    await client
      .del(`${workspaceId}:task:${taskId}`, (error) => {
        //TODO: report to error reporting service woth very high priority
        if (error) console.log("Redis Error while deleting task", error);
      })
      .catch((error) => {
        console.log("Redis Error while deleting task", error);
      });
  }
};

const redisGetTask = async (taskId, workspaceId) => {
  return null;

  try {
    const cachedValue = await client.get(`${workspaceId}:task:${taskId}`);
    if (cachedValue) {
      return JSON.parse(cachedValue);
    }
    return null;
  } catch (err) {
    //TODO: report to error reporting service woth very high priority
    console.log("Redis Error while quering task cache", err);
    return null;
  }
};

const redisDelTask = async (taskId, workspaceId) => {
  return null;
  try {
    const del = await client.del(`${workspaceId}:task:${taskId}`);
    return del;
  } catch (err) {
    //TODO: report to error reporting service woth very high priority
    console.log("Redis Error while quering task cache", err);
    return 0;
  }
};

const redisSetClient = async (clientId, workspaceId, data) => {
  return null;

  try {
    if (process.env.NODE_ENV !== "production") {
      if (!data) throw new Error("client data is not defined");
      if (!workspaceId) throw new Error("workspaceId is not defined");
      if (!clientId) throw new Error("clientId is not defined");
      if (typeof data !== "object") throw new Error("client data is not object");
      // if (!data.createdById && data.createdById !== null) throw new Error("data.createdById is not defined"); // not checked for null, as in future it may happen that we give systemGeneratwed client for test or expamle, the createdByid field will be null
      if (!data.id) throw new Error("data.id is not defined");
    }
    await client.set(`${workspaceId}:client:${clientId}`, JSON.stringify(data));
  } catch (err) {
    //TODO: report to error reporting service woth very high priority
    console.log("Redis Error while quering client cache ", err);
    // delete the cache, if unable to set(update) the cacahe with new data, it will again upadted with new data when api will be callled
    await client
      .del(`${workspaceId}:client:${clientId}`, (error) => {
        //TODO: report to error reporting service woth very high priority
        if (error) console.log("Redis Error while deleting client", error);
      })
      .catch((error) => {
        console.log("Redis Error while deleting client", error);
      });
  }
};

const redisGetClient = async (clientId, workspaceId) => {
  return null;

  try {
    const cachedValue = await client.get(`${workspaceId}:client:${clientId}`);
    if (cachedValue) {
      return JSON.parse(cachedValue);
    }
    return null;
  } catch (err) {
    //TODO: report to error reporting service woth very high priority
    console.log("Redis Error while quering client cache", err);
    return null;
  }
};

const redisDelClient = async (clientId, workspaceId) => {
  return null;
  try {
    const del = await client.del(`${workspaceId}:client:${clientId}`);
    return del;
  } catch (err) {
    //TODO: report to error reporting service woth very high priority
    console.log("Redis Error while quering client cache", err);
    return 0;
  }
};

export {
  redisSetRole,
  redisGetRole,
  redisDelRole,
  redisSetUser,
  redisGetUser,
  redisDelUser,
  redisSetProject,
  redisGetProject,
  redisDelProject,
  redisSetTask,
  redisGetTask,
  redisDelTask,
  redisSetClient,
  redisGetClient,
  redisDelClient,
};
