import CryptoJS from "crypto-js";
import axios from "axios";
import crypto from "crypto";

const authentication_code = process.env.AUTHENTICATION_CODE;
const accountId = process.env.ACCOUNTID;
const consumerKey = process.env.CONSUMERKEY;
const consumerSecretKey = process.env.CONSUMERSECRETKEY;
const accessToken = process.env.ACCESSTOKEN;
const accessSecretToken = process.env.ACCESSTOKENSECRETTOKEN;

function getNonce(length) {
  const alphabet =
    "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from(crypto.randomFillSync(new Uint8Array(length)))
    .map((x) => alphabet[x % alphabet.length])
    .join("");
}

const getAllEmployeeRestletScriptDeploymentId = async (req, body) => {
  try {
    const authentication = {
      authentication_code: authentication_code,
      account: accountId,
      consumerKey: consumerKey,
      consumerSecret: consumerSecretKey,
      tokenId: accessToken,
      tokenSecret: accessSecretToken,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      http_method: "POST",
      nonce: getNonce(10),
      version: "1.0",
      signatureMethod: "HMAC-SHA256",
      scriptId: "1020",
      deployId: "1",
    };
    const http_method = "POST";

    const base_url =
      `https://` +
      authentication_code +
      `.restlets.api.netsuite.com/app/site/hosting/restlet.nl`;

    const concatenatedString = `deploy=${authentication.deployId}&oauth_consumer_key=${authentication.consumerKey}&oauth_nonce=${authentication.nonce}&oauth_signature_method=${authentication.signatureMethod}&oauth_timestamp=${authentication.timestamp}&oauth_token=${authentication.tokenId}&oauth_version=${authentication.version}&script=${authentication.scriptId}`;

    var baseString =
      http_method +
      "&" +
      encodeURIComponent(base_url) +
      "&" +
      encodeURIComponent(concatenatedString);

    const keys = consumerSecretKey + "&" + accessSecretToken;
    const signature = CryptoJS.HmacSHA256(baseString, keys).toString(
      CryptoJS.enc.Base64
    );

    const oAuth_String = `OAuth realm="${
      authentication.account
    }", oauth_consumer_key="${authentication.consumerKey}", oauth_token="${
      authentication.tokenId
    }", oauth_nonce="${authentication.nonce}", oauth_timestamp="${
      authentication.timestamp
    }", oauth_signature_method="${
      authentication.signatureMethod
    }", oauth_version="${
      authentication.signatureMethod
    }", oauth_signature="${encodeURIComponent(signature)}"`;

    const url = `https://${authentication_code}.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=1020&deploy=1`;

    const data = {
      q: body,
    };

    const payload = JSON.stringify(data);
    console.log("payLoad is:", payload);

    const headers = {
      Authorization: oAuth_String,
    };

    const response = await axios({
      method: "POST",
      url: url,
      headers: headers,
      data: payload,
    });

    return response.data;
  } catch (err) {
    console.error("error in getAllEmployeeRestletScriptDeploymentId", err);
  }
};

const getRestletScriptDeploymentId = async (query) => {
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

    //   const data = {
    //     resttype: "Add",
    //     recordtype: "lead",
    //     filters:  [],
    //     columns: [
    //       "internalid",
    //       "entityid",
    //       "altname",
    //       "firstname",
    //       "middlename",
    //       "lastname",
    //       "email",
    //       "title",
    //       "phone",
    //       "supervisor",
    //       "department",
    //       "employeetype",
    //       "role"
    //     ]
    //   };

    const data = {
      resttype: "Add",
      recordtype: "lead",
      bodyfields: {
        customform: {
          value: "135",
          text: "LMS CRM FORM",
        },
        custentity_lms_channel_lead: {
          value: "1",
          text: "DIRECT CALL",
        },
        custentity_lms_leadsource: {
          value: "1",
          text: "REFFERAL",
        },
        custentity_lms_date_of_visit: "2024-04-23",
        custentity_lms_time_of_visit: "9:00 am",
        custentity_lms_name_of_the_portal_dd: {
          value: "1",
          text: "Amazon",
        },
        custentity_lms_name_of_the_platform_dd: {
          value: "1",
          text: "Wordpress",
        },
        custentity_lms_campaign_name: {
          value: "-16",
          text: "Banner Ads",
        },
        custentity_lms_enquiryby: {
          value: "3",
          text: "Other",
        },
        isPerson: true,
        firstName: "TEST",
        lastName: "ABC",
        custentity_lms_personal_email: "test.abc@gmail.com",
        custentity_lms_personal_phonenumber: "9653247563",
        custentity_lms_noteother:
          "WHEN USER SELECT OTHER THEN THIS NOTE COLUMN BECOME MANDITORY",
        companyname: "TEST ABC Company",
        subsidiary: {
          value: "1",
          text: "ENERGIA",
        },
        phone: "09834657787",
        email: "test.abc@livestrongtechnologies.com",
        custentity_lms_cr_no: "ASD25870BNM",
        custentity3: "ZXCASD3210",
        custentity_lms_client_type: {
          value: "2",
          text: "Semi-Goverment",
        },
        custentity_market_segment: {
          value: "37",
          text: "COMMERCIAL",
        },
        custentity_lms_primary_action: {
          value: "1",
          text: "Replied",
        },
        custentity_lms_lastactivitydate: "2024-04-23T18:00:00Z",
        custentity_lms_lead_value: 1200,
        entitystatus: {
          value: "7",
          text: "LEAD-Qualified",
        },
        custentity_lms_lead_unqualified:
          "THIS BOX SHOULD BECOME MANDITORY WHEN USER SELECT LEAD IS UNQUALIFIED",
        custentity_lms_prospect_nurturing: {
          value: "1",
          text: "Quotation Issued",
        },
      },
      linefields: {
        addressbook: [
          {
            subrecord: {
              addressbookaddress: {
                addr1:
                  "CONSOLDATE ENERGIA,P O Box 30305 Al Jubail - 31951 Al Jubail Saudi Arabia",
                addr2: "P O Box 30305",
                addressee: "TEST ABC Company",
                addrPhone: "9856423314",
                city: "Al Jubail",
                country: {
                  value: "SA",
                  text: "Saudi Arabia",
                },
                zip: "31951",
              },
            },
            defaultbilling: true,
            defaultshipping: true,
            label:
              "CONSOLDATE ENERGIA,P O Box 30305 Al Jubail - 31951 Al Jubail Saudi Arabia",
          },
        ],
        recmachcustrecord_lms_requirement_details: [
          {
            custrecord_lms_division: {
              value: "27",
              text: "COOLING",
            },
            custrecord_lms_requirement: "ABC",
            custrecord_lms_project_name: "ABC",
            custrecord_lms_duration: 12,
            custrecord_lms_unit_of_measure: {
              value: "1",
              text: "Day",
            },
            custrecord_lms_note: "NOTES WILL DEPEND ON USER",
          },
        ],
        recmachcustrecord_parent_record: [
          {
            custrecordlms_location: "JUBAIL",
            custrecord_lms_contactperson_name: "TEST",
            custrecord_lms_phonenumber: "9165480245",
            custrecord_location_email: "test.12@gmail.com",
          },
        ],
        recmachcustrecord_lms_lead_assigning: [
          {
            custrecord_lms_region: {
              value: "16",
              text: "9H TAMANI",
            },
          },
        ],
      },
    };
    const payload = JSON.stringify(data);

    const headers = {
      Prefer: "transient",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
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
    console.log("getRestletScriptDeploymentId error =>", error);
    return {
      success: false,
      message: "Error while fetching restlet script deployment.",
    };
  }
};
export { getAllEmployeeRestletScriptDeploymentId };
