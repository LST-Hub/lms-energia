import { getToken } from "next-auth/jwt";
import { getUserCache } from "./backendUtils";

//TODO: move this function check in middleware.js as this is required for every route and return response from here if unable to authhenticate user
/**
 * Authenticate users that he is logged in, and return his token if he is authenticated.
 * If the user is inactive then it thorws error insted of returning token, though he is authenticated
 *
 * @param {*} req the incoming request that we get from HTTP request
 * @returns user token or throws error if not authenticated
 */
export async function authAndGetUserToken(req) {
  const token = await getToken({ req });
  if (!token) {
    throw new Error("Unable to authenticate user");
  }
  // if (token.userId && token.workspaceId) {
  //   const userInfo = await getUserCache(token.userId, token.workspaceId);
  //   // if user is inactive then throw error
  //   if (!userInfo.active) throw new Error("User is not active.");
  // }
  return token;
}
