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

// const getAllLeadRestletScriptDeploymentId = async (role) => {
//   try {
//     const body = {
//       resttype: "Search",
//       recordtype: "lead",
//       access: {
//         user: {
//           value: "6899",
//           text: "EMP-1213 Netsuite Livestrong",
//         },
//         role: {
//           value: role
//         },
//       },
//       filters: [
//         ["stage", "anyof", "LEAD"],
//         "AND",
//         ["datecreated", "onorafter", ["01/05/2024 12:00 am"]],
//       ],
//       columns: [
//         "internalid",
//         "entityid",
//         "custentity_lms_channel_lead",
//         "custentity_lms_leadsource",
//         "altname",
//         "firstname",
//         "middlename",
//         "lastname",
//         "entitystatus",
//         "custentity_lms_enquiryby",
//         "custentity_lms_client_type",
//         "custentity_lms_date_of_visit",
//         "custentity_lms_time_of_visit",
//         "custentity_lms_visit_update",
//         "custentity_lms_name_of_the_portal_dd",
//         "custentity_lms_name_of_the_platform_dd",
//         "custentity_lms_campaign_name",
//         "custentity_lms_createdby",
//         "datecreated",
//         "subsidiary",
//         "custentity_lms_name",
//         "custentity_lms_personal_email",
//         "custentity_lms_personal_phonenumber",
//         "custentity_lms_noteother",
//         "companyname",
//         "address",
//         "phone",
//         "email",
//         "custentity_lms_cr_no",
//         "custentity3",
//         "custentity_market_segment",
//         "custentity_lms_primary_action",
//         "custentity_lms_lastactivitydate",
//         "custentity_lms_lead_value",
//         "entitystatus",
//         "custentity_lms_lead_unqualified",
//         "custentity_lms_prospect_nurturing",
//         "CUSTRECORD_LMS_REQUIREMENT_DETAILS.internalid",
//         "CUSTRECORD_LMS_REQUIREMENT_DETAILS.custrecord_lms_division",
//         "CUSTRECORD_LMS_REQUIREMENT_DETAILS.custrecord_lms_requirement",
//         "CUSTRECORD_LMS_REQUIREMENT_DETAILS.custrecord_lms_project_name",
//         "CUSTRECORD_LMS_REQUIREMENT_DETAILS.custrecord_lms_duration",
//         "CUSTRECORD_LMS_REQUIREMENT_DETAILS.custrecord_lms_unit_of_measure",
//         "CUSTRECORD_LMS_REQUIREMENT_DETAILS.custrecord_lms_value",
//         "CUSTRECORD_LMS_REQUIREMENT_DETAILS.custrecord_lms_expected_delivery_date",
//         "CUSTRECORD_LMS_REQUIREMENT_DETAILS.custrecord_lms_note",
//         "CUSTRECORD_PARENT_RECORD.internalid",
//         "CUSTRECORD_PARENT_RECORD.custrecordlms_location",
//         "CUSTRECORD_PARENT_RECORD.custrecord_lms_contactperson_name",
//         "CUSTRECORD_PARENT_RECORD.custrecord_lms_phonenumber",
//         "CUSTRECORD_PARENT_RECORD.custrecord_location_email",
//         "CUSTRECORD_PARENT_RECORD.custrecord_lms_designation",
//         "CUSTRECORD_LMS_LEAD_ASSIGNING.internalid",
//         "CUSTRECORD_LMS_LEAD_ASSIGNING.custrecord_lms_region",
//         "CUSTRECORD_LMS_LEAD_ASSIGNING.custrecord_lms_sales_team_name",
//         "CUSTRECORD_LMS_LEADNURT.internalid",
//         "CUSTRECORD_LMS_LEADNURT.custrecord_lms_primary_action",
//         "CUSTRECORD_LMS_LEADNURT.custrecord_lms_datetime",
//         "CUSTRECORD_LMS_LEADNURT.custrecord_lms_lead_value",
//         "CUSTRECORD_LMS_LEADNURT.custrecord_lms_statusoflead",
//         "CUSTRECORD_LMS_LEADNURT.custrecord_lms_lead_unqualifie",
//         "CUSTRECORD_LMS_LEADNURT.custrecord_lms_prospect_nurtur",
//       ],
//     };
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
//       scriptId: "1020",
//       deployId: "1",
//     };
//     const base_url =
//       `https://` +
//       authentication_code +
//       `.restlets.api.netsuite.com/app/site/hosting/restlet.nl`;

//     const concatenatedString = `deploy=${authentication.deployId}&oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}&script=${authentication.scriptId}`;

//     // const concatenatedString = `oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}`;
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

//     const url = `https://${authentication_code}.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=1020&deploy=1`;

//     const payload = JSON.stringify(body);

//     const headers = {
//       // Prefer: "transient",
//       "Content-Type": "application/json",
//       // "Access-Control-Allow-Origin": "*",
//       Authorization: oAuth_String,
//     };

//     const response = await axios({
//       method: "POST",
//       url: url,
//       headers: headers,
//       data: payload,
//     });

//     return response.data;
//   } catch (error) {
//     console.log("getAllLeadRestletScriptDeploymentId error =>", error);
//     return {
//       success: false,
//       message: "Error while fetching restlet script deployment.",
//     };
//   }
// };

const getRequirementStatusRestletScriptDeployment = async () => {
  try {
    const body = {
      resttype: "Search",
      recordtype: "item",
      filters: [["isinactive", "is", "F"]],
      columns: [
        "internalid",
        "itemid",
        "displayname",
        "salesdescription",
        "type",
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
    console.log("payload", payload)

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

const postCreateLeadRestletScriptDeploymentId = async (req) => {
  try {
    const body = req.body;

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
    console.log("postCreateLeadRestletScriptDeploymentId error =>", error);
    return {
      success: false,
      message: "Error while fetching restlet script deployment.",
    };
  }
};

const getLeadByIdRestletScriptDeploymentId = async (body) => {
  try {
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

    // var base_url = 'https://4667350-sb1.restlets.api.netsuite.com/app/site/hosting/restlet.nl/${id}';

    const base_url =
      `https://` +
      authentication_code +
      `.restlets.api.netsuite.com/app/site/hosting/restlet.nl`;

    const concatenatedString = `deploy=${authentication.deployId}&oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}&script=${authentication.scriptId}`;

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

    // const url = `https://${authentication_code}.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=1020&deploy=1}`;

    const data = {
      body,
    };

    const payload = JSON.stringify(body);

    const headers = {
      "Content-Type": "application/json",
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
    console.log("getLeadByIdRestletScriptDeploymentId error =>", error);
    return {
      success: false,
      message: "Error while fetching restlet script deployment.",
    };
  }
};

const updateLeadDataRestletScriptDeploymentId = async (body) => {
  try {
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

    const data = {
      q: body,
    };

    const payload = JSON.stringify(body);

    const headers = {
      "Content-Type": "application/json",
      Authorization: oAuth_String,
    };

    const response = await axios({
      method: "POST",
      url: url,
      headers: headers,
      data: payload,
    });

    // console.log("response is:", response.data);
  } catch (error) {
    console.log("updateLeadDataRestletScriptDeploymentId error =>", error);
    return {
      success: false,
      message: "Error while fetching restlet script deployment.",
    };
  }
};

const deleteLeadByIdRestletScriptDeploymentId = async (body) => {
  try {
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

    const data = {
      q: body,
    };

    const payload = JSON.stringify(body);

    const headers = {
      "Content-Type": "application/json",
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
    console.log("deleteLeadByIdRestletScriptDeploymentId error =>", error);
    return {
      success: false,
      message: "Error while fetching restlet script deployment.",
    };
  }
};

export {
  // getAllLeadRestletScriptDeploymentId,
  getRequirementStatusRestletScriptDeployment,
  postCreateLeadRestletScriptDeploymentId,
  getLeadByIdRestletScriptDeploymentId,
  updateLeadDataRestletScriptDeploymentId,
  deleteLeadByIdRestletScriptDeploymentId,
};
