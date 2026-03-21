import { Navigate, useLocation } from "react-router-dom";

import Studio from "@/pages/Studio";
import { DESIGN_FIXTURE_SESSION_ID } from "@/domain/studio/studioSessionDevFixture";

const MIXER_SEARCH = `?id=${DESIGN_FIXTURE_SESSION_ID}&capture=true&captureBar=false&captureScenario=mixer&mode=standard`;

export default function DesignMixer() {
  const location = useLocation();

  if (location.search !== MIXER_SEARCH) {
    return <Navigate to={{ pathname: location.pathname, search: MIXER_SEARCH }} replace />;
  }

  return <Studio />;
}
