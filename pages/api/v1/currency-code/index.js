import prisma from "../../../../lib/prisma";
import response from "../../../../lib/response";
import { countryCodeSelectAll } from "../../../../lib/constants";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const currency = await prisma.currencyLists.findMany({
        select: countryCodeSelectAll,
      });
      response({ res, success: true, status_code: 200, data: currency, message: "Currency fetched successfully" });
      return;
    } else {
      response({ res, success: false, status_code: 405, message: "Method Not Allowed" });
    }
  } catch (err) {
    console.error("error in project index file", err);
    response({
      res,
      success: false,
      status_code: 500,
      message: "Some Internal Error Occured. Please try again later",
    });
  }
}
