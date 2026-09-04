import { basicExperiments } from "./basic";
import { systemExperiments } from "./systems";
import { advancedExperiments } from "./advanced";
import type { ExperimentDef } from "../components/ExperimentShell";

export const experiments: ExperimentDef[] = [...basicExperiments, ...systemExperiments, ...advancedExperiments];
export const byId = (id: string) => experiments.find((e) => e.id === id);
