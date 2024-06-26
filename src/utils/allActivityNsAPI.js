import axios from "axios";
import crypto from "crypto";

function getNonce(length) {
  const alphabet =
    "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from(crypto.randomFillSync(new Uint8Array(length)))
    .map((x) => alphabet[x % alphabet.length])
    .join("");
}
const authentication_code = process.env.AUTHENTICATION_CODE;
const accountId = process.env.ACCOUNTID;
const consumerKey = process.env.CONSUMERKEY;
const consumerSecretKey = process.env.CONSUMERSECRETKEY;
const accessToken = process.env.ACCESSTOKEN;
const accessSecretToken = process.env.ACCESSTOKENSECRETTOKEN;
const getPhoneCallDataActivityRestletScriptDeploymentId = async (lid) => {
  try {
    const body = {
      resttype: "Search",
      recordtype: "phonecall",
      filters: [
        [
            "company", "anyof", [lid]
        ]
      ],
      columns: [
        "internalid",
        "title",
        "status",
        "startdate",
        "enddate",
        "starttime",
        "phone",
        "assigned",
        "company",
        "custevent_lms_status",
        "custevent_lms_lead_name",
        "message"
      ]
    }
    const authentication = {
      authentication_code: authentication_code,
      account: accountId,
      consumerKey: consumerKey,
      consumerSecret: consumerSecretKey,
      tokenId: accessToken,
      tokenSecret: accessSecretToken,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      nonce: getNonce(10),
      http_method: "POST",
      version: "1.0",
      signatureMethod: "HMAC-SHA256",
      scriptId: "1020",
      deployId: "1",
    };
    const base_url =
      `https://` +
      authentication_code +
      `.restlets.api.netsuite.com/app/site/hosting/restlet.nl`;

    const concatenatedString = `deploy=${authentication.deployId}&oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}&script=${authentication.scriptId}`;

    // const concatenatedString = `oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}`;
    const baseString = `${authentication.http_method}&${encodeURIComponent(
      base_url
    )}&${encodeURIComponent(concatenatedString)}`;
    const keys = `${authentication.consumerSecret}&${authentication.tokenSecret}`;
    const signature = crypto
      .createHmac("sha256", keys)
      .update(baseString)
      .digest("base64");
    const oAuth_String = `OAuth realm="${
      authentication.account
    }", oauth_consumer_key="${authentication.consumerKey}", oauth_token="${
      authentication.tokenId
    }", oauth_nonce="${authentication.nonce}", oauth_timestamp="${
      authentication.timestamp
    }", oauth_signature_method="HMAC-SHA256", oauth_version="1.0", oauth_signature="${encodeURIComponent(
      signature
    )}"`;

    const url = `https://${authentication_code}.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=1020&deploy=1`;

    const payload = JSON.stringify(body);
    console.log("payload", payload);

    const headers = {
      // Prefer: "transient",
      "Content-Type": "application/json",
      // "Access-Control-Allow-Origin": "*",
      Authorization: oAuth_String,
    };

    const response = await axios({
      method: "POST",
      url: url,
      headers: headers,
      data: payload,
    });
    return response.data;
    // const data = JSON.parse(response.data);
    // console.log("Response data:", data);
    // return data;
  } catch (error) {
    console.log(
      "getPhoneCallDataActivityRestletScriptDeploymentId error =>",
      error
    );
    return {
      success: false,
      message: "Error while fetching restlet script deployment.",
    };
  }
};

const getTaskDataActivityRestletScriptDeploymentId = async (lid) => {
  try {
    const body = {
      resttype: "Search",
      recordtype: "task",
      filters: [
        [
            "company", "anyof", [lid]
        ]
      ],
      columns: [
        "internalid",
        "order",
        "title",
        "priority",
        "status",
        "startdate",
        "duedate",
        "accesslevel",
        "assigned",
        "company",
        "message"
      ]
    }
    const authentication = {
      authentication_code: authentication_code,
      account: accountId,
      consumerKey: consumerKey,
      consumerSecret: consumerSecretKey,
      tokenId: accessToken,
      tokenSecret: accessSecretToken,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      nonce: getNonce(10),
      http_method: "POST",
      version: "1.0",
      signatureMethod: "HMAC-SHA256",
      scriptId: "1020",
      deployId: "1",
    };
    const base_url =
      `https://` +
      authentication_code +
      `.restlets.api.netsuite.com/app/site/hosting/restlet.nl`;

    const concatenatedString = `deploy=${authentication.deployId}&oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}&script=${authentication.scriptId}`;

    // const concatenatedString = `oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}`;
    const baseString = `${authentication.http_method}&${encodeURIComponent(
      base_url
    )}&${encodeURIComponent(concatenatedString)}`;
    const keys = `${authentication.consumerSecret}&${authentication.tokenSecret}`;
    const signature = crypto
      .createHmac("sha256", keys)
      .update(baseString)
      .digest("base64");
    const oAuth_String = `OAuth realm="${
      authentication.account
    }", oauth_consumer_key="${authentication.consumerKey}", oauth_token="${
      authentication.tokenId
    }", oauth_nonce="${authentication.nonce}", oauth_timestamp="${
      authentication.timestamp
    }", oauth_signature_method="HMAC-SHA256", oauth_version="1.0", oauth_signature="${encodeURIComponent(
      signature
    )}"`;

    const url = `https://${authentication_code}.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=1020&deploy=1`;

    const payload = JSON.stringify(body);

    const headers = {
      // Prefer: "transient",
      "Content-Type": "application/json",
      // "Access-Control-Allow-Origin": "*",
      Authorization: oAuth_String,
    };

    const response = await axios({
      method: "POST",
      url: url,
      headers: headers,
      data: payload,
    });
    return response.data;
    // const data = JSON.parse(response.data);
    // console.log("Response data:", data);
    // return data;
  } catch (error) {
    console.log("getTaskDataActivityRestletScriptDeploymentId error =>", error);
    return {
      success: false,
      message: "Error while fetching restlet script deployment.",
    };
  }
};

const getEventDataActivityRestletScriptDeploymentId = async (lid) => {
  try {
    const body = {
      resttype: "Search",
      recordtype: "calendarevent",
      filters: [
        [
            "internalid", "anyof", String(lid)
        ]
      ],
      columns: [
        "internalid",
        "title",
        "startdate",
        "starttime",
        "endtime",
        "owner",
        "status",
        // "markdone",
        "company",
        "message"
      ]
    }
    console.log("body", body)
    const authentication = {
      authentication_code: authentication_code,
      account: accountId,
      consumerKey: consumerKey,
      consumerSecret: consumerSecretKey,
      tokenId: accessToken,
      tokenSecret: accessSecretToken,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      nonce: getNonce(10),
      http_method: "POST",
      version: "1.0",
      signatureMethod: "HMAC-SHA256",
      scriptId: "1020",
      deployId: "1",
    };
    const base_url =
      `https://` +
      authentication_code +
      `.restlets.api.netsuite.com/app/site/hosting/restlet.nl`;

    const concatenatedString = `deploy=${authentication.deployId}&oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}&script=${authentication.scriptId}`;

    // const concatenatedString = `oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}`;
    const baseString = `${authentication.http_method}&${encodeURIComponent(
      base_url
    )}&${encodeURIComponent(concatenatedString)}`;
    const keys = `${authentication.consumerSecret}&${authentication.tokenSecret}`;
    const signature = crypto
      .createHmac("sha256", keys)
      .update(baseString)
      .digest("base64");
    const oAuth_String = `OAuth realm="${
      authentication.account
    }", oauth_consumer_key="${authentication.consumerKey}", oauth_token="${
      authentication.tokenId
    }", oauth_nonce="${authentication.nonce}", oauth_timestamp="${
      authentication.timestamp
    }", oauth_signature_method="HMAC-SHA256", oauth_version="1.0", oauth_signature="${encodeURIComponent(
      signature
    )}"`;

    const url = `https://${authentication_code}.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=1020&deploy=1`;

    const payload = JSON.stringify(body);

    const headers = {
      // Prefer: "transient",
      "Content-Type": "application/json",
      // "Access-Control-Allow-Origin": "*",
      Authorization: oAuth_String,
    };

    const response = await axios({
      method: "POST",
      url: url,
      headers: headers,
      data: payload,
    });
    return response.data;
    // const data = JSON.parse(response.data);
    // console.log("Response data:", data);
    // return data;
  } catch (error) {
    console.log(
      "getEventDataActivityRestletScriptDeploymentId error =>",
      error
    );
    return {
      success: false,
      message: "Error while fetching restlet script deployment.",
    };
  }
};
export {
  getPhoneCallDataActivityRestletScriptDeploymentId,
  getTaskDataActivityRestletScriptDeploymentId,
  getEventDataActivityRestletScriptDeploymentId,
};
