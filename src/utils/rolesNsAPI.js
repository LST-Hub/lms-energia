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

const getSalesManagerRoleRestletScriptDeploymentId = async (userId, roleId) => {
  try {
    const body = {
      resttype: "Search",
      recordtype: "lead",
      filters: [
        ["stage", "anyof", "LEAD"],
        "AND",
        [
          ["custentity_lms_createdby", "anyof", userId],
          "OR",
          ["custentity_lms_createdby.custentity_lms_roles", "anyof", '3'],
        ],
      ],
      columns: [
        "internalid",
        "entityid",
        "custentity_lms_channel_lead",
        "custentity_lms_leadsource",
        "custentity_lms_createdby",
        "altname",
        "firstname",
        "middlename",
        "lastname",
        "entitystatus",
        "custentity_lms_enquiryby",
        "custentity_lms_client_type",
        "custentity_lms_date_of_visit",
        "custentity_lms_time_of_visit",
        "custentity_lms_visit_update",
        "custentity_lms_name_of_the_portal_dd",
        "custentity_lms_name_of_the_platform_dd",
        "custentity_lms_campaign_name",
        "custentity_lms_createdby",
        "datecreated",
        "subsidiary",
        "custentity_lms_name",
        "custentity_lms_personal_email",
        "custentity_lms_personal_phonenumber",
        "custentity_lms_noteother",
        "companyname",
        "address",
        "phone",
        "email",
        "custentity_lms_cr_no",
        "custentity3",
        "custentity_market_segment",
        "custentity_lms_primary_action",
        "custentity_lms_lastactivitydate",
        "custentity_lms_lead_value",
        "entitystatus",
        "custentity_lms_lead_unqualified",
        "custentity_lms_prospect_nurturing",
      ],
    };
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
  } catch (error) {
    console.log("getAllLeadRestletScriptDeploymentId error =>", error);
    return {
      success: false,
      message: "Error while fetching restlet script deployment.",
    };
  }
};

// const getSalesManagerRoleRestletScriptDeploymentId = async (query) => {
//   try {
//     const authentication = {
//       authentication_code: authentication_code,
//       account: accountId,
//       consumerKey: consumerKey,
//       consumerSecret: consumerSecretKey,
//       tokenId: accessToken,
//       tokenSecret: accessSecretToken,
//       timestamp: Math.floor(Date.now() / 1000).toString(),
//       nonce: getNonce(10),
//       http_method: "POST",
//       version: "1.0",
//       signatureMethod: "HMAC-SHA256",
//     };
//     const base_url =
//       `https://` +
//       authentication_code +
//       `.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql`;

//     const concatenatedString = `oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}`;
//     const baseString = `${authentication.http_method}&${encodeURIComponent(
//       base_url
//     )}&${encodeURIComponent(concatenatedString)}`;
//     const keys = `${authentication.consumerSecret}&${authentication.tokenSecret}`;
//     const signature = crypto
//       .createHmac("sha256", keys)
//       .update(baseString)
//       .digest("base64");
//     const oAuth_String = `OAuth realm="${
//       authentication.account
//     }", oauth_consumer_key="${authentication.consumerKey}", oauth_token="${
//       authentication.tokenId
//     }", oauth_nonce="${authentication.nonce}", oauth_timestamp="${
//       authentication.timestamp
//     }", oauth_signature_method="HMAC-SHA256", oauth_version="1.0", oauth_signature="${encodeURIComponent(
//       signature
//     )}"`;

//     const url = `https://${authentication_code}.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql`;

//     const data = {
//       q: query,
//     };

//     const payload = JSON.stringify(data);

//     const headers = {
//       Prefer: "transient",
//       "Content-Type": "application/json",
//       "Access-Control-Allow-Origin": "*",
//       Authorization: oAuth_String,
//     };

//     const response = await axios({
//       method: "POST",
//       url: url,
//       headers: headers,
//       data: payload,
//     });

//     // console.log(" *** data is : ***", response.data);
//     return response.data;
//   } catch (error) {
//     console.log(
//       "getSalesManagerRoleRestletScriptDeploymentId error =>",
//       error
//     );
//     return {
//       success: false,
//       message: "Error while fetching restlet script deployment.",
//     };
//   }
// };

const getSalesSupportRoleRestletScriptDeploymentId = async (userId) => {
  try {
    const body = {
      resttype: "Search",
      recordtype: "lead",
      filters: [
        ["stage", "anyof", "LEAD"],
        "AND",
        ["custentity_lms_createdby", "anyof", userId],
      ],
      columns: [
        "internalid",
        "entityid",
        "custentity_lms_channel_lead",
        "custentity_lms_leadsource",
        "altname",
        "firstname",
        "middlename",
        "lastname",
        "entitystatus",
        "custentity_lms_enquiryby",
        "custentity_lms_client_type",
        "custentity_lms_date_of_visit",
        "custentity_lms_time_of_visit",
        "custentity_lms_visit_update",
        "custentity_lms_name_of_the_portal_dd",
        "custentity_lms_name_of_the_platform_dd",
        "custentity_lms_campaign_name",
        "custentity_lms_createdby",
        "datecreated",
        "subsidiary",
        "custentity_lms_name",
        "custentity_lms_personal_email",
        "custentity_lms_personal_phonenumber",
        "custentity_lms_noteother",
        "companyname",
        "address",
        "phone",
        "email",
        "custentity_lms_cr_no",
        "custentity3",
        "custentity_market_segment",
        "custentity_lms_primary_action",
        "custentity_lms_lastactivitydate",
        "custentity_lms_lead_value",
        "entitystatus",
        "custentity_lms_lead_unqualified",
        "custentity_lms_prospect_nurturing",
      ],
    };
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
  } catch (error) {
    console.log("getAllLeadRestletScriptDeploymentId error =>", error);
    return {
      success: false,
      message: "Error while fetching restlet script deployment.",
    };
  }
};
// const getSalesSupportRoleRestletScriptDeploymentId = async (query) => {
//   try {
//     const authentication = {
//       authentication_code: authentication_code,
//       account: accountId,
//       consumerKey: consumerKey,
//       consumerSecret: consumerSecretKey,
//       tokenId: accessToken,
//       tokenSecret: accessSecretToken,
//       timestamp: Math.floor(Date.now() / 1000).toString(),
//       nonce: getNonce(10),
//       http_method: "POST",
//       version: "1.0",
//       signatureMethod: "HMAC-SHA256",
//     };
//     const base_url =
//       `https://` +
//       authentication_code +
//       `.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql`;

//     const concatenatedString = `oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}`;
//     const baseString = `${authentication.http_method}&${encodeURIComponent(
//       base_url
//     )}&${encodeURIComponent(concatenatedString)}`;
//     const keys = `${authentication.consumerSecret}&${authentication.tokenSecret}`;
//     const signature = crypto
//       .createHmac("sha256", keys)
//       .update(baseString)
//       .digest("base64");
//     const oAuth_String = `OAuth realm="${
//       authentication.account
//     }", oauth_consumer_key="${authentication.consumerKey}", oauth_token="${
//       authentication.tokenId
//     }", oauth_nonce="${authentication.nonce}", oauth_timestamp="${
//       authentication.timestamp
//     }", oauth_signature_method="HMAC-SHA256", oauth_version="1.0", oauth_signature="${encodeURIComponent(
//       signature
//     )}"`;

//     const url = `https://${authentication_code}.suitetalk.api.netsuite.com/services/rest/query/v1/suiteql`;

//     const data = {
//       q: query,
//     };

//     const payload = JSON.stringify(data);

//     const headers = {
//       Prefer: "transient",
//       "Content-Type": "application/json",
//       "Access-Control-Allow-Origin": "*",
//       Authorization: oAuth_String,
//     };

//     const response = await axios({
//       method: "POST",
//       url: url,
//       headers: headers,
//       data: payload,
//     });

//     // console.log(" *** data is : ***", response.data);
//     return response.data;
//   } catch (error) {
//     console.log("getSalesSupportRoleRestletScriptDeploymentId error =>", error);
//     return {
//       success: false,
//       message: "Error while fetching restlet script deployment.",
//     };
//   }
// };

const getSalesSuppRoleRestletScriptDeploymentId = async (userId) => {
  try {
    const body = {
      resttype: "Search",
      recordtype: "lead",
      filters: [
        ["stage", "anyof", "LEAD"],
        "AND",
        ["custentity_lms_createdby", "anyof", userId],
      ],
      columns: [
        "internalid",
        "entityid",
        "custentity_lms_channel_lead",
        "custentity_lms_leadsource",
        "altname",
        "firstname",
        "middlename",
        "lastname",
        "entitystatus",
        "custentity_lms_enquiryby",
        "custentity_lms_client_type",
        "custentity_lms_date_of_visit",
        "custentity_lms_time_of_visit",
        "custentity_lms_visit_update",
        "custentity_lms_name_of_the_portal_dd",
        "custentity_lms_name_of_the_platform_dd",
        "custentity_lms_campaign_name",
        "custentity_lms_createdby",
        "datecreated",
        "subsidiary",
        "custentity_lms_name",
        "custentity_lms_personal_email",
        "custentity_lms_personal_phonenumber",
        "custentity_lms_noteother",
        "companyname",
        "address",
        "phone",
        "email",
        "custentity_lms_cr_no",
        "custentity3",
        "custentity_market_segment",
        "custentity_lms_primary_action",
        "custentity_lms_lastactivitydate",
        "custentity_lms_lead_value",
        "entitystatus",
        "custentity_lms_lead_unqualified",
        "custentity_lms_prospect_nurturing",
      ],
    };
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
  } catch (error) {
    console.log("getSalesSuppRoleRestletScriptDeploymentId error =>", error);
    return {
      success: false,
      message: "Error while fetching restlet script deployment.",
    };
  }
};

export {
  getSalesManagerRoleRestletScriptDeploymentId,
  getSalesSupportRoleRestletScriptDeploymentId,
  getSalesSuppRoleRestletScriptDeploymentId,
};
