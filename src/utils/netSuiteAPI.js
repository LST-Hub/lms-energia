import axios from "axios";
import crypto from "crypto";
import CryptoJS from "crypto-js";

const NetSuiteAPI = () => {

const authentication = {
    authentication_code: authentication_code,
    account: accountId,
    consumerKey: consumerKey,
    consumerSecret: consumerSecretKey,
    tokenId: accessToken,
    tokenSecret: accessSecretToken,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    //   http_method: "POST",
    version: "1.0",
    signatureMethod: "HMAC-SHA256",
    // scriptId: "1020",
    // deployId: "1",
  };
  const deployId = "1";
  const scriptId = "1020";
  const signatureMethod = "HMAC-SHA256";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const version = "1.0";
  const http_method = "POST";
  var nonce = CryptoJS.lib.WordArray.random(10).toString();

  const base_url =
    `https://` +
    authentication_code +
    `.restlets.api.netsuite.com/app/site/hosting/restlet.nl`;

  var concatenatedString =
    "deploy=" +
    deployId +
    "&oauth_consumer_key=" +
    consumerKey +
    "&oauth_nonce=" +
    nonce +
    "&oauth_signature_method=" +
    signatureMethod +
    "&oauth_timestamp=" +
    timestamp +
    "&oauth_token=" +
    tokenId +
    "&oauth_version=" +
    version +
    "&script=" +
    scriptId;

  var baseString =
    http_method +
    "&" +
    encodeURIComponent(base_url) +
    "&" +
    encodeURIComponent(concatenatedString);

  var keys = consumerSecretKey + "&" + accessSecretToken;

  var signature = CryptoJS.HmacSHA256(baseString, keys).toString(
    CryptoJS.enc.Base64
  );
  signature = encodeURIComponent(signature);

  const url = `https://${authentication_code}.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=1020&deploy=1`;
};

export default NetSuiteAPI;

