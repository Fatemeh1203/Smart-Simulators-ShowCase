import { ExperimentMeta } from "./types";
import { chargeMeta } from "./ChargeLab";
import { conservationMeta } from "./Conservation";
import { coulombMeta } from "./Coulomb";
import { fieldMeta, pointFieldMeta } from "./Field";
import { fieldLinesMeta } from "./FieldLines";
import { potentialEnergyMeta, potentialMeta } from "./Potential";
import { conductorMeta } from "./Conductor";
import { capacitorMeta, dielectricMeta, capEnergyMeta } from "./Capacitor";

export const experiments: ExperimentMeta[] = [
  chargeMeta, conservationMeta, coulombMeta, fieldMeta, pointFieldMeta, fieldLinesMeta,
  potentialEnergyMeta, potentialMeta, conductorMeta, capacitorMeta, dielectricMeta, capEnergyMeta,
];

export const byId = (id: string) => experiments.find(e => e.id === id) ?? experiments[0];
