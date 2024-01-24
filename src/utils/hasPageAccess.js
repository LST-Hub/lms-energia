import { perAccessIds } from "../../DBConstants";
import { modes } from "./Constants";

function hasPageModeAccess(pageMode, accessLevel) {
  switch (pageMode) {
    case modes.create:
      return Number(accessLevel) >= perAccessIds.create;
    case modes.view:
      return Number(accessLevel) >= perAccessIds.view;
    case modes.edit:
      return Number(accessLevel) >= perAccessIds.edit;
    default:
      return false;
  }
}

export default hasPageModeAccess;
