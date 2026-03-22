import { Navigate, useLocation } from "react-router-dom";

import Studio from "@/pages/Studio";
import { DESIGN_FIXTURE_SESSION_ID } from "@/domain/studio/studioSessionDevFixture";

const ARRANGEMENT_SEARCH = `?id=${DESIGN_FIXTURE_SESSION_ID}&capture=true&captureBar=false&captureScenario=arrangement-piano-roll&mode=standard`;

export default function DesignArrangement() {
  const location = useLocation();

  if (location.search !== ARRANGEMENT_SEARCH) {
    return <Navigate to={{ pathname: location.pathname, search: ARRANGEMENT_SEARCH }} replace />;
  }

  return <Studio />;
}
