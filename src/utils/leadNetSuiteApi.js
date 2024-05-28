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


export { getAllEmployeeRestletScriptDeploymentId };
