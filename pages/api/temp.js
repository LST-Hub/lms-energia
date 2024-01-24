import prisma from "../../lib/prisma";
import {
  appPermissionAccess,
  appPermissionRestrictions,
  appPermissions,
  currencyList,
  workspaceTypes,
} from "../../DBConstants";

export default async function handler(req, res) {
  // const workSpacetype = await prisma.workspaceType.createMany({
  //   data: workspaceTypes,
  // });
  // const permission = await prisma.permission.createMany({
  //   data: appPermissions,
  // });
  // const roleRestriction = await prisma.roleRestriction.createMany({
  //   data: appPermissionRestrictions,
  // });
  // const perAcc = await prisma.permissionAccess.createMany({
  //   data: appPermissionAccess,
  // });
  // const currency = await prisma.currencyLists.createMany({
  //   data: currencyList.map((c) => ({ code: c.countryCode, country: c.countryName, id: c.id })),
  // });
  // res.json(currency);

  // const workspace = await prisma.rolePermissions.create({
  //   data: {
  //     workspaceId: 7,
  //     roleId: 4,
  //     permissionId: 7,
  //     accessLevel: 4,
  //   }
  // })
  // res.json(workspace);
}
