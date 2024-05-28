import axios from "axios";
import crypto from "crypto";

function getNonce(length) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
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

const getLeadChannelAmmount = async (body) => {
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
    const base_url = `https://` + authentication_code + `.restlets.api.netsuite.com/app/site/hosting/restlet.nl`;

    const concatenatedString = `deploy=${authentication.deployId}&oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}&script=${authentication.scriptId}`;

    // const concatenatedString = `oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}`;
    const baseString = `${authentication.http_method}&${encodeURIComponent(base_url)}&${encodeURIComponent(
      concatenatedString
    )}`;
    const keys = `${authentication.consumerSecret}&${authentication.tokenSecret}`;
    const signature = crypto.createHmac("sha256", keys).update(baseString).digest("base64");
    const oAuth_String = `OAuth realm="${authentication.account}", oauth_consumer_key="${
      authentication.consumerKey
    }", oauth_token="${authentication.tokenId}", oauth_nonce="${authentication.nonce}", oauth_timestamp="${
      authentication.timestamp
    }", oauth_signature_method="HMAC-SHA256", oauth_version="1.0", oauth_signature="${encodeURIComponent(signature)}"`;

    const url = `https://${authentication_code}.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=1020&deploy=1`;

    // const data = {
    //   body,
    // };

    const payload = JSON.stringify(body);
    // console.log("Lead data is:", payload);

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

    // console.log("response is:", response.data);
    return response.data;
  } catch (error) {
    console.log("postCreateLeadRestletScriptDeploymentId error =>", error);
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
    const base_url = `https://` + authentication_code + `.restlets.api.netsuite.com/app/site/hosting/restlet.nl`;

    const concatenatedString = `deploy=${authentication.deployId}&oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}&script=${authentication.scriptId}`;

    // const concatenatedString = `oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}`;
    const baseString = `${authentication.http_method}&${encodeURIComponent(base_url)}&${encodeURIComponent(
      concatenatedString
    )}`;
    const keys = `${authentication.consumerSecret}&${authentication.tokenSecret}`;
    const signature = crypto.createHmac("sha256", keys).update(baseString).digest("base64");
    const oAuth_String = `OAuth realm="${authentication.account}", oauth_consumer_key="${
      authentication.consumerKey
    }", oauth_token="${authentication.tokenId}", oauth_nonce="${authentication.nonce}", oauth_timestamp="${
      authentication.timestamp
    }", oauth_signature_method="HMAC-SHA256", oauth_version="1.0", oauth_signature="${encodeURIComponent(signature)}"`;

    const url = `https://${authentication_code}.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=1020&deploy=1`;

    // const data = {
    //   body,
    // };

    const payload = JSON.stringify(body);
    // console.log("Lead data is:", payload);

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

    // console.log("response is:", response.data);
    return response.data;
  } catch (error) {
    console.log("postCreateLeadRestletScriptDeploymentId error =>", error);
    return {
      success: false,
      message: "Error while fetching restlet script deployment.",
    };
  }
};

const getLeadByIdRestletScriptDeploymentId = async (id, body) => {
  try {
    // const body = {
    //   resttype: "Record",
    //   recordtype: "lead",
    //   recordid: id,
    //   bodyfields: [
    //     customform,
    //     custentity_lms_channel_lead,
    //     custentity_lms_leadsource,
    //     entityid,
    //     altname,
    //     custentity_lms_date_of_visit,
    //     custentity_lms_time_of_visit,
    //     custentity_lms_visit_update,
    //     custentity_lms_name_of_the_portal_dd,
    //     custentity_lms_name_of_the_platform_dd,
    //     custentity_lms_campaign_name,
    //     custentity_lms_createdby,
    //     subsidiary,
    //     custentity_lms_name,
    //     custentity_lms_enquiryby,
    //     custentity_lms_personal_email,
    //     custentity_lms_personal_phonenumber,
    //     custentity_lms_noteother,
    //     companyname,
    //     defaultaddress,
    //     phone,
    //     email,
    //     custentity_lms_cr_no,
    //     custentity3,
    //     custentity_lms_client_type,
    //     custentity_market_segment,
    //     custentity_lms_primary_action,
    //     custentity_lms_lastactivitydate,
    //     custentity_lms_lastactivitydate,
    //     taxrounding,
    //     custentity_lms_lead_value,
    //     entitystatus,
    //     custentity_lms_lead_unqualified,
    //     custentity_lms_prospect_nurturing,
    //   ],
    //   linefields: [
    //     {
    //       recmachcustrecord_lms_requirement_details: [
    //         id,
    //         custrecord_lms_division,
    //         custrecord_lms_requirement,
    //         custrecord_lms_project_name,
    //         custrecord_lms_duration,
    //         custrecord_lms_unit_of_measure,
    //         custrecord_lms_value,
    //         custrecord_lms_expected_delivery_date,
    //         custrecord_lms_note,
    //       ],
    //       recmachcustrecord_parent_record: [
    //         id,
    //         custrecordlms_location,
    //         custrecord_lms_contactperson_name,
    //         custrecord_lms_phonenumber,
    //         custrecord_location_email,
    //         custrecord_lms_designation,
    //       ],
    //       recmachcustrecord_lms_lead_assigning: [
    //         id,
    //         custrecord_lms_region,
    //         custrecord_lms_sales_team_name,
    //       ],
    //       addressbook: [
    //         id,
    //         label,
    //         defaultbilling,
    //         defaultshipping,
    //         addr1_initialvalue,
    //         addr2_initialvalue,
    //         phone_initialvalue,
    //         city_initialvalue,
    //         state_initialvalue,
    //         zip_initialvalue,
    //         country_initialvalue,
    //         addressbookaddress,
    //       ],
    //     },
    //   ],
    // };

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

    const base_url = `https://` + authentication_code + `.restlets.api.netsuite.com/app/site/hosting/restlet.nl/${id}`;

    const concatenatedString = `deploy=${authentication.deployId}&oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}&script=${authentication.scriptId}`;

    const baseString = `${authentication.http_method}&${encodeURIComponent(base_url)}&${encodeURIComponent(
      concatenatedString
    )}`;
    const keys = `${authentication.consumerSecret}&${authentication.tokenSecret}`;
    const signature = crypto.createHmac("sha256", keys).update(baseString).digest("base64");
    const oAuth_String = `OAuth realm="${authentication.account}", oauth_consumer_key="${
      authentication.consumerKey
    }", oauth_token="${authentication.tokenId}", oauth_nonce="${authentication.nonce}", oauth_timestamp="${
      authentication.timestamp
    }", oauth_signature_method="HMAC-SHA256", oauth_version="1.0", oauth_signature="${encodeURIComponent(signature)}"`;

    const url = `https://${authentication_code}.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=1020&deploy=1/${id}`;

    // const url =
    //   `https://` +
    //   authentication_code +
    //   `.suitetalk.api.netsuite.com/services/rest/record/v1/customer/${id}`;

    const data = {
      q: body,
    };

    const payload = JSON.stringify(body);
    // console.log("**payload is:**", payload);

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
    const base_url = `https://` + authentication_code + `.restlets.api.netsuite.com/app/site/hosting/restlet.nl`;

    const concatenatedString = `deploy=${authentication.deployId}&oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}&script=${authentication.scriptId}`;

    // const concatenatedString = `oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}`;
    const baseString = `${authentication.http_method}&${encodeURIComponent(base_url)}&${encodeURIComponent(
      concatenatedString
    )}`;
    const keys = `${authentication.consumerSecret}&${authentication.tokenSecret}`;
    const signature = crypto.createHmac("sha256", keys).update(baseString).digest("base64");
    const oAuth_String = `OAuth realm="${authentication.account}", oauth_consumer_key="${
      authentication.consumerKey
    }", oauth_token="${authentication.tokenId}", oauth_nonce="${authentication.nonce}", oauth_timestamp="${
      authentication.timestamp
    }", oauth_signature_method="HMAC-SHA256", oauth_version="1.0", oauth_signature="${encodeURIComponent(signature)}"`;

    const url = `https://${authentication_code}.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=1020&deploy=1`;

    const data = {
      q: body,
    };

    const payload = JSON.stringify(body);
    console.log("Lead Edit  data is:", payload);

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
    const base_url = `https://` + authentication_code + `.restlets.api.netsuite.com/app/site/hosting/restlet.nl`;

    const concatenatedString = `deploy=${authentication.deployId}&oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}&script=${authentication.scriptId}`;

    // const concatenatedString = `oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}`;
    const baseString = `${authentication.http_method}&${encodeURIComponent(base_url)}&${encodeURIComponent(
      concatenatedString
    )}`;
    const keys = `${authentication.consumerSecret}&${authentication.tokenSecret}`;
    const signature = crypto.createHmac("sha256", keys).update(baseString).digest("base64");
    const oAuth_String = `OAuth realm="${authentication.account}", oauth_consumer_key="${
      authentication.consumerKey
    }", oauth_token="${authentication.tokenId}", oauth_nonce="${authentication.nonce}", oauth_timestamp="${
      authentication.timestamp
    }", oauth_signature_method="HMAC-SHA256", oauth_version="1.0", oauth_signature="${encodeURIComponent(signature)}"`;

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

export {
  getLeadChannelAmmount,
  postCreateLeadRestletScriptDeploymentId,
  getLeadByIdRestletScriptDeploymentId,
  updateLeadDataRestletScriptDeploymentId,
  deleteLeadByIdRestletScriptDeploymentId,
};
