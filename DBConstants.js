import { WeeklyDays } from "@prisma/client";

const permissionTypeIds = {
  projAndTask: 1,
  clients: 2,
  users: 3,
  roles: 4,
  // teams: 6,
  reports: 5,
  approvals: 6,
  resourceAllocation: 7,
};

const appPermissions = [
  {
    id: permissionTypeIds.projAndTask,
    name: "Leads",
  },
  {
    id: permissionTypeIds.clients,
    name: "Activity",
  },
  {
    id: permissionTypeIds.users,
    name: "Users",
  },
  {
    id: permissionTypeIds.roles,
    name: "Roles",
  },
  // {
  //   id: permissionTypeIds.teams,
  //   name: "Teams",
  // },
  {
    id: permissionTypeIds.reports,
    name: "Settings",
  },
  // {
  //   id: permissionTypeIds.approvals,
  //   name: "Approvals",
  // },
  // {
  //   id: permissionTypeIds.resourceAllocation,
  //   name: "Resource Allocation",
  // },
];

const workspaceTypes = [
  {
    id: 1,
    name: "Software Consulting",
  },
  {
    id: 2,
    name: "Construction",
  },
  {
    id: 3,
    name: "Manufacturing",
  },
];

const roleRestrictionIds = {
  own: 1,
  subordinates: 2,
  none: 3,
};

const appPermissionRestrictions = [
  {
    id: roleRestrictionIds.own,
    name: "own",
  },
  {
    id: roleRestrictionIds.subordinates,
    name: "subordinates",
  },
  {
    id: roleRestrictionIds.none,
    name: "none",
  },
];

const perAccessIds = {
  view: 1,
  create: 2,
  edit: 3,
  all: 4,
};

const appPermissionAccess = [
  {
    id: perAccessIds.view,
    name: "view",
  },
  {
    id: perAccessIds.create,
    name: "create",
  },
  {
    id: perAccessIds.edit,
    name: "edit",
  },
  {
    id: perAccessIds.all,
    name: "all",
  },
];

const workspaceCreaterId = -1; // the workspace creater have different ID, to sepprate a dn find who has created workspace, done this after internal discussion
const preDefinedWorkCalId = 1; // directly defined in the API route where we create new workspace
const perDefinedAdminRoleID = 1; // same variables are added in src/utils/Constants.js of the id is changed then change there also
const perDefinedEmployeeRoleID = 2; // same variables are added in src/utils/Constants.js of the id is changed then change there also
const perDefinedProjectAdminRoleID = 3; // same variables are added in src/utils/Constants.js of the id is changed then change there also
const perDefinedProjectManagerRoleID = 4; // same variables are added in src/utils/Constants.js of the id is changed then change there also

const preDefinedRoles = [
  {
    id: perDefinedAdminRoleID, // id for predefined Admin role
    name: "System Admin",
    description: "System Admin can create, edit, delete, and manage all the things in the workspace.",
    systemGenerated: true,
    isAdmin: true, // make admin
    restrictionId: roleRestrictionIds.none, // give no restriction
    permissions: {
      // give him all the permissions
      create: Object.keys(permissionTypeIds).map((key) => ({
        permissionId: permissionTypeIds[key],
        accessLevel: perAccessIds.all, // give all the access
      })),
    },
  },
  {
    id: perDefinedEmployeeRoleID,
    name: "Employee",
    description: "Employee has access to only the records he has created.",
    systemGenerated: true,
    isAdmin: false,
    restrictionId: roleRestrictionIds.own, // give own restriction
    permissions: {
      create: [
        {
          permissionId: permissionTypeIds.resourceAllocation,
          accessLevel: perAccessIds.view,
        },
      ],
    },
  },
  {
    id: perDefinedProjectAdminRoleID,
    name: "Project Admin",
    description:
      "Project Admin can create, edit, delete and manage all projects, tasks, user, client, reports and can Approve Expenses, Timesheets and Today's tasks ",
    systemGenerated: true,
    isAdmin: false,
    restrictionId: roleRestrictionIds.none, // give no restriction
    permissions: {
      create: [
        {
          permissionId: permissionTypeIds.projAndTask,
          accessLevel: perAccessIds.all,
        },
        {
          permissionId: permissionTypeIds.clients,
          accessLevel: perAccessIds.all,
        },
        {
          permissionId: permissionTypeIds.users,
          accessLevel: perAccessIds.all,
        },
        {
          permissionId: permissionTypeIds.reports,
          accessLevel: perAccessIds.all,
        },
        {
          permissionId: permissionTypeIds.approvals,
          accessLevel: perAccessIds.all,
        },
        {
          permissionId: permissionTypeIds.resourceAllocation,
          accessLevel: perAccessIds.all,
        },
      ],
    },
  },
  {
    id: perDefinedProjectManagerRoleID,
    name: "Project Manager",
    description:
      "Project Manager can create, edit, delete and manage all projects, tasks and can approve timesheets, expenses and today's task of the project user is assigned to.",
    systemGenerated: true,
    isAdmin: false,
    restrictionId: roleRestrictionIds.subordinates, // give subordinates restriction
    permissions: {
      create: [
        {
          permissionId: permissionTypeIds.projAndTask,
          accessLevel: perAccessIds.all,
        },
        {
          permissionId: permissionTypeIds.approvals,
          accessLevel: perAccessIds.all,
        },
        {
          permissionId: permissionTypeIds.reports,
          accessLevel: perAccessIds.all,
        },
        {
          permissionId: permissionTypeIds.resourceAllocation,
          accessLevel: perAccessIds.all,
        },
      ],
    },
  },
];

const preDefinedWorkCal = [
  {
    id: preDefinedWorkCalId,
    name: "Default Work Calendar",
    description: "Default Work Calendar",
    systemGenerated: true,
    startTime: 32400, // "09:00" AM, we store time in seconds, so 9*60*60 = 32400, 24 hour format
    weeklyWorkingDays: {
      create: [
        {
          time: 28800, // 8 hours
          day: WeeklyDays.Monday,
        },
        {
          time: 28800,
          day: WeeklyDays.Tuesday,
        },
        {
          time: 28800,
          day: WeeklyDays.Wednesday,
        },
        {
          time: 28800,
          day: WeeklyDays.Thursday,
        },
        {
          time: 28800,
          day: WeeklyDays.Friday,
        },
      ],
    },
  },
];

const preDefinedStatus = [
  { id: 1, name: "Open", systemGenerated: true },
  { id: 2, name: "Not Started", systemGenerated: true },
  { id: 3, name: "Inprogress", systemGenerated: true },
  { id: 4, name: "Completed", systemGenerated: true },
  { id: 5, name: "Halted", systemGenerated: true },
  { id: 6, name: "Closed", systemGenerated: true },
  { id: 7, name: "Cancelled", systemGenerated: true },
];
const preDefinedPriorities = [
  { id: 1, name: "High", systemGenerated: true },
  { id: 2, name: "Medium", systemGenerated: true },
  { id: 3, name: "Low", systemGenerated: true },
  { id: 4, name: "Urgent", systemGenerated: true },
];
const preDefinedExpenseCategories = [
  { id: 1, name: "Per diem", systemGenerated: true },
  { id: 2, name: "Travel", systemGenerated: true },
  { id: 3, name: "Food", systemGenerated: true },
];

const usdCurrency = {
  countryName: "US Dollar",
  countryCode: "USD",
  id: 1,
};
const preDefinedCurrency = [{ currencyId: usdCurrency.id, id: 1, systemGenerated: true }];

const currencyList = [
  usdCurrency,
  {
    countryName: "European Euro",
    countryCode: "EUR",
    id: 2,
  },
  {
    countryName: "British Pound Sterling",
    countryCode: "GBP",
    id: 3,
  },
  {
    countryName: "Japanese Yen",
    countryCode: "JPY",
    id: 4,
  },
  {
    countryName: "Canadian Dollar",
    countryCode: "CAD",
    id: 5,
  },
  {
    countryName: "Australian Dollar",
    countryCode: "AUD",
    id: 6,
  },
  {
    countryName: "Swiss Franc",
    countryCode: "CHF",
    id: 7,
  },
  {
    countryName: "Emirati Dirham",
    countryCode: "AED",
    id: 8,
  },
  {
    countryName: "Afghan Afghani",
    countryCode: "AFN",
    id: 9,
  },
  {
    countryName: "Albanian Lek",
    countryCode: "ALL",
    id: 10,
  },
  {
    countryName: "Armenian Dram",
    countryCode: "AMD",
    id: 11,
  },
  {
    countryName: "Dutch Guilder",
    countryCode: "ANG",
    id: 12,
  },
  {
    countryName: "Angolan Kwanza",
    countryCode: "AOA",
    id: 13,
  },
  {
    countryName: "Argentine Peso",
    countryCode: "ARS",
    id: 14,
  },
  {
    countryName: "Aruban or Dutch Guilder",
    countryCode: "AWG",
    id: 15,
  },
  {
    countryName: "Azerbaijan Manat",
    countryCode: "AZN",
    id: 16,
  },
  {
    countryName: "Bosnian Convertible Marka",
    countryCode: "BAM",
    id: 17,
  },
  {
    countryName: "Barbadian or Bajan Dollar",
    countryCode: "BBD",
    id: 18,
  },
  {
    countryName: "Bangladeshi Taka",
    countryCode: "BDT",
    id: 19,
  },
  {
    countryName: "Bulgarian Lev",
    countryCode: "BGN",
    id: 20,
  },
  {
    countryName: "Bahraini Dinar",
    countryCode: "BHD",
    id: 21,
  },
  {
    countryName: "Burundian Franc",
    countryCode: "BIF",
    id: 22,
  },
  {
    countryName: "Bermudian Dollar",
    countryCode: "BMD",
    id: 23,
  },
  {
    countryName: "Bruneian Dollar",
    countryCode: "BND",
    id: 24,
  },
  {
    countryName: "Bolivian Bolíviano",
    countryCode: "BOB",
    id: 25,
  },
  {
    countryName: "Brazilian Real",
    countryCode: "BRL",
    id: 26,
  },
  {
    countryName: "Bahamian Dollar",
    countryCode: "BSD",
    id: 27,
  },
  {
    countryName: "Bhutanese Ngultrum",
    countryCode: "BTN",
    id: 28,
  },
  {
    countryName: "Botswana Pula",
    countryCode: "BWP",
    id: 29,
  },
  {
    countryName: "Belarusian Ruble",
    countryCode: "BYN",
    id: 30,
  },
  {
    countryName: "Belizean Dollar",
    countryCode: "BZD",
    id: 31,
  },
  {
    countryName: "Congolese Franc",
    countryCode: "CDF",
    id: 32,
  },
  {
    countryName: "Chilean Peso",
    countryCode: "CLP",
    id: 33,
  },
  {
    countryName: "Chinese Yuan Renminbi",
    countryCode: "CNY",
    id: 34,
  },
  {
    countryName: "Colombian Peso",
    countryCode: "COP",
    id: 35,
  },
  {
    countryName: "Costa Rican Colon",
    countryCode: "CRC",
    id: 36,
  },
  {
    countryName: "Cuban Convertible Peso",
    countryCode: "CUC",
    id: 37,
  },
  {
    countryName: "Cuban Peso",
    countryCode: "CUP",
    id: 38,
  },
  {
    countryName: "Cape Verdean Escudo",
    countryCode: "CVE",
    id: 39,
  },
  {
    countryName: "Czech Koruna",
    countryCode: "CZK",
    id: 40,
  },
  {
    countryName: "Djiboutian Franc",
    countryCode: "DJF",
    id: 41,
  },
  {
    countryName: "Danish Krone",
    countryCode: "DKK",
    id: 42,
  },
  {
    countryName: "Dominican Peso",
    countryCode: "DOP",
    id: 43,
  },
  {
    countryName: "Algerian Dinar",
    countryCode: "DZD",
    id: 44,
  },
  {
    countryName: "Egyptian Pound",
    countryCode: "EGP",
    id: 45,
  },
  {
    countryName: "Eritrean Nakfa",
    countryCode: "ERN",
    id: 46,
  },
  {
    countryName: "Ethiopian Birr",
    countryCode: "ETB",
    id: 47,
  },
  {
    countryName: "Fijian Dollar",
    countryCode: "FJD",
    id: 48,
  },
  {
    countryName: "Falkland Island Pound",
    countryCode: "FKP",
    id: 49,
  },
  {
    countryName: "Georgian Lari",
    countryCode: "GEL",
    id: 50,
  },
  {
    countryName: "Guernsey Pound",
    countryCode: "GGP",
    id: 51,
  },
  {
    countryName: "Ghanaian Cedi",
    countryCode: "GHS",
    id: 52,
  },
  {
    countryName: "Gibraltar Pound",
    countryCode: "GIP",
    id: 53,
  },
  {
    countryName: "Gambian Dalasi",
    countryCode: "GMD",
    id: 54,
  },
  {
    countryName: "Guinean Franc",
    countryCode: "GNF",
    id: 55,
  },
  {
    countryName: "Guatemalan Quetzal",
    countryCode: "GTQ",
    id: 56,
  },
  {
    countryName: "Guyanese Dollar",
    countryCode: "GYD",
    id: 57,
  },
  {
    countryName: "Hong Kong Dollar",
    countryCode: "HKD",
    id: 58,
  },
  {
    countryName: "Honduran Lempira",
    countryCode: "HNL",
    id: 59,
  },
  {
    countryName: "Croatian Kuna",
    countryCode: "HRK",
    id: 60,
  },
  {
    countryName: "Haitian Gourde",
    countryCode: "HTG",
    id: 61,
  },
  {
    countryName: "Hungarian Forint",
    countryCode: "HUF",
    id: 62,
  },
  {
    countryName: "Indonesian Rupiah",
    countryCode: "IDR",
    id: 63,
  },
  {
    countryName: "Israeli Shekel",
    countryCode: "ILS",
    id: 64,
  },
  {
    countryName: "Isle of Man Pound",
    countryCode: "IMP",
    id: 65,
  },
  {
    countryName: "Indian Rupee",
    countryCode: "INR",
    id: 66,
  },
  {
    countryName: "Iraqi Dinar",
    countryCode: "IQD",
    id: 67,
  },
  {
    countryName: "Iranian Rial",
    countryCode: "IRR",
    id: 68,
  },
  {
    countryName: "Icelandic Krona",
    countryCode: "ISK",
    id: 69,
  },
  {
    countryName: "Jersey Pound",
    countryCode: "JEP",
    id: 70,
  },
  {
    countryName: "Jamaican Dollar",
    countryCode: "JMD",
    id: 71,
  },
  {
    countryName: "Jordanian Dinar",
    countryCode: "JOD",
    id: 72,
  },
  {
    countryName: "Kenyan Shilling",
    countryCode: "KES",
    id: 73,
  },
  {
    countryName: "Kyrgyzstani Som",
    countryCode: "KGS",
    id: 74,
  },
  {
    countryName: "Cambodian Riel",
    countryCode: "KHR",
    id: 75,
  },
  {
    countryName: "Comorian Franc",
    countryCode: "KMF",
    id: 76,
  },
  {
    countryName: "North Korean Won",
    countryCode: "KPW",
    id: 77,
  },
  {
    countryName: "SouthKorean Won",
    countryCode: "KRW",
    id: 78,
  },
  {
    countryName: "Kuwaiti Dinar",
    countryCode: "KWD",
    id: 79,
  },
  {
    countryName: "Caymanian Dollar",
    countryCode: "KYD",
    id: 80,
  },
  {
    countryName: "Kazakhstani Tenge",
    countryCode: "KZT",
    id: 81,
  },
  {
    countryName: "Lao Kip",
    countryCode: "LAK",
    id: 82,
  },
  {
    countryName: "Lebanese Pound",
    countryCode: "LBP",
    id: 83,
  },
  {
    countryName: "Sri Lankan Rupee",
    countryCode: "LKR",
    id: 84,
  },
  {
    countryName: "Liberian Dollar",
    countryCode: "LRD",
    id: 85,
  },
  {
    countryName: "Basotho Loti",
    countryCode: "LSL",
    id: 86,
  },
  {
    countryName: "Libyan Dinar",
    countryCode: "LYD",
    id: 87,
  },
  {
    countryName: "Moroccan Dirham",
    countryCode: "MAD",
    id: 88,
  },
  {
    countryName: "Moldovan Leu",
    countryCode: "MDL",
    id: 89,
  },
  {
    countryName: "Malagasy Ariary",
    countryCode: "MGA",
    id: 90,
  },
  {
    countryName: "Macedonian Denar",
    countryCode: "MKD",
    id: 91,
  },
  {
    countryName: "Burmese Kyat",
    countryCode: "MMK",
    id: 92,
  },
  {
    countryName: "Mongolian Tughrik",
    countryCode: "MNT",
    id: 93,
  },
  {
    countryName: "Macau Pataca",
    countryCode: "MOP",
    id: 94,
  },
  {
    countryName: "Mauritanian Ouguiya",
    countryCode: "MRU",
    id: 95,
  },
  {
    countryName: "Mauritian Rupee",
    countryCode: "MUR",
    id: 96,
  },
  {
    countryName: "Maldivian Rufiyaa",
    countryCode: "MVR",
    id: 97,
  },
  {
    countryName: "Malawian Kwacha",
    countryCode: "MWK",
    id: 98,
  },
  {
    countryName: "Mexican Peso",
    countryCode: "MXN",
    id: 99,
  },
  {
    countryName: "Malaysian Ringgit",
    countryCode: "MYR",
    id: 100,
  },
  {
    countryName: "Mozambican Metical",
    countryCode: "MZN",
    id: 101,
  },
  {
    countryName: "Namibian Dollar",
    countryCode: "NAD",
    id: 102,
  },
  {
    countryName: "Nigerian Naira",
    countryCode: "NGN",
    id: 103,
  },
  {
    countryName: "Nicaraguan Cordoba",
    countryCode: "NIO",
    id: 104,
  },
  {
    countryName: "Norwegian Krone",
    countryCode: "NOK",
    id: 105,
  },
  {
    countryName: "Nepalese Rupee",
    countryCode: "NPR",
    id: 106,
  },
  {
    countryName: "New Zealand Dollar",
    countryCode: "NZD",
    id: 107,
  },
  {
    countryName: "Omani Rial",
    countryCode: "OMR",
    id: 108,
  },
  {
    countryName: "Panamanian Balboa",
    countryCode: "PAB",
    id: 109,
  },
  {
    countryName: "Peruvian Sol",
    countryCode: "PEN",
    id: 110,
  },
  {
    countryName: "Papua New Guinean Kina",
    countryCode: "PGK",
    id: 111,
  },
  {
    countryName: "Philippine Peso",
    countryCode: "PHP",
    id: 112,
  },
  {
    countryName: "Pakistani Rupee",
    countryCode: "PKR",
    id: 113,
  },
  {
    countryName: "Polish Zloty",
    countryCode: "PLN",
    id: 114,
  },
  {
    countryName: "Paraguayan Guarani",
    countryCode: "PYG",
    id: 115,
  },
  {
    countryName: "Qatari Riyal",
    countryCode: "QAR",
    id: 116,
  },
  {
    countryName: "Romanian Leu",
    countryCode: "RON",
    id: 117,
  },
  {
    countryName: "Serbian Dinar",
    countryCode: "RSD",
    id: 118,
  },
  {
    countryName: "Russian Ruble",
    countryCode: "RUB",
    id: 119,
  },
  {
    countryName: "Rwandan Franc",
    countryCode: "RWF",
    id: 120,
  },
  {
    countryName: "Saudi Arabian Riyal",
    countryCode: "SAR",
    id: 121,
  },
  {
    countryName: "Solomon Islander Dollar",
    countryCode: "SBD",
    id: 122,
  },
  {
    countryName: "Seychellois Rupee",
    countryCode: "SCR",
    id: 123,
  },
  {
    countryName: "Sudanese Pound",
    countryCode: "SDG",
    id: 124,
  },
  {
    countryName: "Swedish Krona",
    countryCode: "SEK",
    id: 125,
  },
  {
    countryName: "Singapore Dollar",
    countryCode: "SGD",
    id: 126,
  },
  {
    countryName: "Saint Helenian Pound",
    countryCode: "SHP",
    id: 127,
  },
  {
    countryName: "Sierra Leonean Leone",
    countryCode: "SLL",
    id: 128,
  },
  {
    countryName: "Somali Shilling",
    countryCode: "SOS",
    id: 129,
  },
  {
    countryName: "Seborgan Luigino",
    countryCode: "SPL",
    id: 130,
  },
  {
    countryName: "Surinamese Dollar",
    countryCode: "SRD",
    id: 131,
  },
  {
    countryName: "SaoTomean Dobra",
    countryCode: "STN",
    id: 132,
  },
  {
    countryName: "Salvadoran Colon",
    countryCode: "SVC",
    id: 133,
  },
  {
    countryName: "Syrian Pound",
    countryCode: "SYP",
    id: 134,
  },
  {
    countryName: "Swazi Lilangeni",
    countryCode: "SZL",
    id: 135,
  },
  {
    countryName: "Thai Baht",
    countryCode: "THB",
    id: 136,
  },
  {
    countryName: "Tajikistani Somoni",
    countryCode: "TJS",
    id: 137,
  },
  {
    countryName: "Turkmenistani Manat",
    countryCode: "TMT",
    id: 138,
  },
  {
    countryName: "Tunisian Dinar",
    countryCode: "TND",
    id: 139,
  },
  {
    countryName: "Tongan Pa&#039;anga",
    countryCode: "TOP",
    id: 140,
  },
  {
    countryName: "Turkish Lira",
    countryCode: "TRY",
    id: 141,
  },
  {
    countryName: "Trinidadian Dollar",
    countryCode: "TTD",
    id: 142,
  },
  {
    countryName: "Tuvaluan Dollar",
    countryCode: "TVD",
    id: 143,
  },
  {
    countryName: "Taiwan New Dollar",
    countryCode: "TWD",
    id: 144,
  },
  {
    countryName: "Tanzanian Shilling",
    countryCode: "TZS",
    id: 145,
  },
  {
    countryName: "Ukrainian Hryvnia",
    countryCode: "UAH",
    id: 146,
  },
  {
    countryName: "Ugandan Shilling",
    countryCode: "UGX",
    id: 147,
  },
  {
    countryName: "Uruguayan Peso",
    countryCode: "UYU",
    id: 148,
  },
  {
    countryName: "Uruguayan Peso",
    countryCode: "UYI",
    id: 149,
  },
  {
    countryName: "Uzbekistani Som",
    countryCode: "UZS",
    id: 150,
  },
  {
    countryName: "Venezuelan Bolívar",
    countryCode: "VEF",
    id: 151,
  },
  {
    countryName: "Venezuelan Bolívar",
    countryCode: "VES",
    id: 152,
  },
  {
    countryName: "Vietnamese Dong",
    countryCode: "VND",
    id: 153,
  },
  {
    countryName: "Ni-Vanuatu Vatu",
    countryCode: "VUV",
    id: 154,
  },
  {
    countryName: "Samoan Tala",
    countryCode: "WST",
    id: 155,
  },
  {
    countryName: "Central African CFA Franc BEAC",
    countryCode: "XAF",
    id: 156,
  },
  {
    countryName: "Silver Ounce",
    countryCode: "XAG",
    id: 157,
  },
  {
    countryName: "Gold Ounce",
    countryCode: "XAU",
    id: 158,
  },
  {
    countryName: "East Caribbean Dollar",
    countryCode: "XCD",
    id: 159,
  },
  {
    countryName: "IMF Special Drawing Rights",
    countryCode: "XDR",
    id: 160,
  },
  {
    countryName: "CFA Franc",
    countryCode: "XOF",
    id: 161,
  },
  {
    countryName: "Palladium Ounce",
    countryCode: "XPD",
    id: 162,
  },
  {
    countryName: "CFP Franc",
    countryCode: "XPF",
    id: 163,
  },
  {
    countryName: "Platinum Ounce",
    countryCode: "XPT",
    id: 164,
  },
  {
    countryName: "Yemeni Rial",
    countryCode: "YER",
    id: 165,
  },
  {
    countryName: "South African Rand",
    countryCode: "ZAR",
    id: 166,
  },
  {
    countryName: "Zambian Kwacha",
    countryCode: "ZMW",
    id: 167,
  },
  {
    countryName: "Zimbabwean Dollar",
    countryCode: "ZWD",
    id: 168,
  },
];

//creadted prredefined roles in workspace API, hwere we create new workspace

export {
  permissionTypeIds,
  appPermissions,
  roleRestrictionIds,
  perAccessIds,
  preDefinedStatus,
  preDefinedPriorities,
  preDefinedExpenseCategories,
  preDefinedCurrency,
  currencyList,
  workspaceCreaterId,
  preDefinedWorkCalId,
  preDefinedRoles,
  preDefinedWorkCal,
  perDefinedAdminRoleID,
  perDefinedEmployeeRoleID,
  perDefinedProjectAdminRoleID,
  perDefinedProjectManagerRoleID,
  appPermissionRestrictions,
  appPermissionAccess,
  workspaceTypes,
};
