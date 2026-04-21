export type { TemplateDef } from "./helpers";
export { buildLayoutFromTemplate, newEmptyLayout } from "./helpers";

import type { TemplateDef } from "./helpers";

// Event
import {
  weddingReceptionSmall,
  weddingReceptionMedium,
  weddingReceptionLarge,
} from "./event/weddingReception";
import {
  ceremonyRows,
  ceremonyCircle,
  ceremonySemicircle,
} from "./event/ceremony";
import {
  classroomRows,
  classroomPods,
  classroomUShape,
  classroomLecture,
} from "./event/classroom";
import { boardroom } from "./event/boardroom";

// Landscape
import { propertyStarter } from "./landscape/propertyStarter";
import { foundationPlanting } from "./landscape/foundationPlanting";
import { vegetableGarden } from "./landscape/vegetableGarden";
import { patioBuild } from "./landscape/patioBuild";
import { pollinatorBed } from "./landscape/pollinatorBed";
import { backyardGarden } from "./landscape/backyardGarden";
import { patioWalkway } from "./landscape/patioWalkway";
import { frontYard } from "./landscape/frontYard";

// Interior
import { studioRoom } from "./interior/studio";
import { livingRoom } from "./interior/livingRoom";
import { bedroom } from "./interior/bedroom";
import { officeWorkspace } from "./interior/office";
import { meetingRoom } from "./interior/meetingRoom";
import { restaurantFloor } from "./interior/restaurantFloor";

export const TEMPLATES: TemplateDef[] = [
  // Event
  weddingReceptionSmall,
  weddingReceptionMedium,
  weddingReceptionLarge,
  ceremonyRows,
  ceremonyCircle,
  ceremonySemicircle,
  classroomRows,
  classroomPods,
  classroomUShape,
  classroomLecture,
  boardroom,

  // Landscape
  propertyStarter,
  foundationPlanting,
  backyardGarden,
  patioWalkway,
  frontYard,
  patioBuild,
  vegetableGarden,
  pollinatorBed,

  // Interior
  livingRoom,
  bedroom,
  studioRoom,
  officeWorkspace,
  meetingRoom,
  restaurantFloor,
];
