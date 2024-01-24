import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { authAndGetUserToken } from "../../../../lib/getSessionData";
import response from "../../../../lib/response";

export default async function handler(req, res) {
  try {
    const userToken = await authAndGetUserToken(req);
    const S3 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_ACCESS_KEY_SECRET },
    });
    if (req.method === "PUT") {
      // console.log("req.body", req.body);
      const { keys } = req.body;
      if (!Array.isArray(keys)) {
        response({
          res,
          success: false,
          status_code: 400,
          message: "keys is required and it must be an array",
        });
        return;
      }
      let result = null;
      for (const keyInfo of keys) {
        const command = new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: keyInfo.key,
        });
        //result will return status code 204 even if key is not valid or file is not present in bucket
        result = await S3.send(command);
        //get status code from result
      }
      if (result.$metadata.httpStatusCode === 204) {
        // console.log("result", result.$metadata.httpStatusCode);
        response({
          res,
          success: true,
          status_code: 200,
          message: "Files deleted successfully",
        });
        return;
      } else {
        response({
          res,
          success: false,
          status_code: 400,
          message: "Some error occured while deleting files",
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
    console.log("error occured in delete-file.js file ", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occurred. Please try again later",
    });
  }
}
