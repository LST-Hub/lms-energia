// import { getLeadByIdRestletScriptDeploymentId } from "../../../../src/utils/NsAPIcal";
import response from "../../../../lib/response";
import { id } from "date-fns/locale";
import {
  getLeadByIdRestletScriptDeploymentId,
  deleteLeadByIdRestletScriptDeploymentId,
  updateLeadDataRestletScriptDeploymentId,
} from "../../../../src/utils/createNsAPIcal";

export default async function handler(req, res) {
  try {
    const lid = Number(req.query.lid);
    if (req.method === "GET") {
      const body = {
        resttype: "Record",
        recordtype: "lead",
        recordid: lid, // Assuming `id` is a variable containing the record ID
        bodyfields: [
          "customform",
          "custentity_lms_channel_lead",
          "custentity_lms_leadsource",
          "custentity_lms_createdby",
          "entityid",
          "altname",
          "custentity_lms_date_of_visit",
          "custentity_lms_time_of_visit",
          "custentity_lms_visit_update",
          "custentity_lms_name_of_the_portal_dd",
          "custentity_lms_name_of_the_platform_dd",
          "custentity_lms_campaign_name",
          "custentity_lms_createdby",
          "subsidiary",
          "custentity_lms_name",
          "custentity_lms_enquiryby",
          "custentity_lms_personal_email",
          "custentity_lms_personal_phonenumber",
          "custentity_lms_noteother",
          "companyname",
          "phone",
          "email",
          "custentity_lms_cr_no",
          "custentity3",
          "custentity_lms_client_type",
          "custentity_market_segment",
          "addr1",
          "addr2",
          "city",
          "state",
          "zip",
          "country",
          "custentity_lms_address",
          "custentity_lms_primary_action",
          "custentity_lms_lastactivitydate",
          "custentity_lms_lastactivitydate",
          "taxrounding",
          "custentity_lms_lead_value",
          "entitystatus",
          "custentity_lms_lead_unqualified",
          "custentity_lms_prospect_nurturing",
        ],
        linefields: [
          {
            recmachcustrecord_lms_requirement_details: [
              "id",
              "custrecord_lms_division",
              "custrecord_lms_requirement",
              "custrecord_lms_project_name",
              "custrecord_lms_duration",
              "custrecord_lms_unit_of_measure",
              "custrecord_lms_value",
              "custrecord_lms_expected_delivery_date",
              "custrecord_lms_note",
            ],
            recmachcustrecord_parent_record: [
              "id",
              "custrecordlms_location",
              "custrecord_lms_contactperson_name",
              "custrecord_lms_phonenumber",
              "custrecord_location_email",
              "custrecord_lms_designation",
            ],
            recmachcustrecord_lms_lead_assigning: [
              "id",
              "custrecord_lms_region",
              "custrecord_lms_sales_team_name",
            ],
            recmachcustrecord_lms_leadnurt: [
              "id",
              "custrecord_lms_primary_action",
              "custrecord_lms_datetime",
              "custrecord_lms_lead_value",
              "custrecord_lms_statusoflead",
              "custrecord_lms_lead_unqualifie",
              "custrecord_lms_prospect_nurtur",
            ],
            // addressbook: [
            //   "id",
            //   "label",
            //   "defaultbilling",
            //   "defaultshipping",
            //   "addr1_initialvalue",
            //   "addr2_initialvalue",
            //   "phone_initialvalue",
            //   "city_initialvalue",
            //   "state_initialvalue",
            //   "zip_initialvalue",
            //   "country_initialvalue",
            //   "addressbookaddress",
            // ],
            calls: [
              "id",
              "title",
              "phone",
              "status",
              "endtime",
              "status",
              "startdate",
            ],
            tasks: [
              "id",
              "title",
              "priority",
              "duedate",
            ],
            events: [
              "id",
              "title",
              "location",
              "starttime",
              "endtime",
            ]
          }
        ],
      };

      const allLeadData = await getLeadByIdRestletScriptDeploymentId(body);
      response({
        res,
        success: true,
        status_code: 200,
        data: [allLeadData],
        message: "All Lead Fetched successfully",
      });
    } else if (req.method === "PATCH") {
      const body = req.body;

      const leadUpdatedData = await updateLeadDataRestletScriptDeploymentId(
        body
      );

      response({
        res,
        success: true,
        status_code: 200,
        data: [leadUpdatedData],
        message: "Lead Updated successfully",
      });
    } else if (req.method === "DELETE") {
      const body = {
        resttype: "Delete",
        recordtype: "lead",
        filters: {
          bodyfilters: [["internalid", "anyof", lid]],
        },
      };
      const deleteLeadData = await deleteLeadByIdRestletScriptDeploymentId(
        body
      );
      response({
        res,
        success: true,
        status_code: 200,
        data: [deleteLeadData],
        message: "Lead Deleted successfully",
      });
    } else {
      response({
        res,
        success: false,
        status_code: 405,
        message: "Method Not Allowed",
      });
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
