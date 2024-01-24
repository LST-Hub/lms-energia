import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { presignedUrlExpSec } from "../../../../lib/constants";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import response from "../../../../lib/response";
const crypto = require("crypto");

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const S3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_ACCESS_KEY_SECRET },
    });
    if (req.method === "POST") {
      const { keys, files } = req.body;
      if (!Array.isArray(keys) && !Array.isArray(files)) {
        response({
          res,
          success: false,
          status_code: 400,
          message: "keys or files is required and it must be an array",
        });
        return;
      }
      if (Array.isArray(keys)) {
        let getUrls = [];
        for (const keyInfo of keys) {
          const config = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: keyInfo.key,
          };
          if (keyInfo.name) {
            config.ResponseContentDisposition = 'attachment; filename ="' + keyInfo.name + '"';
          }
          const command = new GetObjectCommand(config);
          //TODO: see hoe to give error if key is not valid
          const signedUrl = await getSignedUrl(S3, command, {
            expiresIn: presignedUrlExpSec,
          });
          getUrls.push({
            key: keyInfo.key,
            name: keyInfo?.name,
            url: signedUrl,
          });
        }
        response({
          res,
          success: true,
          status_code: 200,
          data: getUrls,
        });
        return;
      }

      if (Array.isArray(files)) {
        let putUrls = [];
        for (const file of files) {
          const token = crypto.randomBytes(32).toString("hex");
          const key = token + "_" + file.name;
          const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ContentType: file.type,
          });
          const signedUrl = await getSignedUrl(S3, command, {
            expiresIn: presignedUrlExpSec,
          });
          putUrls.push({
            key,
            name: file.name,
            type: file.type,
            url: signedUrl,
          });
        }
        response({
          res,
          success: true,
          status_code: 200,
          data: putUrls,
        });
        return;
      }
    } else {
      response({
        res,
        success: false,
        status_code: 400,
        message: "Method not allowed",
      });
      return;
    }
  } catch (err) {
    console.log("error occured in presigned urls file ", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occurred. Please try again later",
    });
  }
}
