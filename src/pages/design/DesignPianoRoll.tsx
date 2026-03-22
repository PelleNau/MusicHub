import { Navigate, useLocation } from "react-router-dom";

import Studio from "@/pages/Studio";
import { DESIGN_FIXTURE_SESSION_ID } from "@/domain/studio/studioSessionDevFixture";

const PIANO_ROLL_SEARCH = `?id=${DESIGN_FIXTURE_SESSION_ID}&capture=true&captureBar=false&captureScenario=piano-roll&mode=standard&fixture=1`;

export default function DesignPianoRoll() {
  const location = useLocation();

  if (location.search !== PIANO_ROLL_SEARCH) {
    return <Navigate to={{ pathname: location.pathname, search: PIANO_ROLL_SEARCH }} replace />;
  }

  return <Studio />;
}
