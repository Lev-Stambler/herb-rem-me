export function interfaces(): string {
  return 'interfaces';
}

/**
 * non exported, mongo typings
 */
type mongoID = string
/****** end mongo typings */

type Efficacy = number

export interface Remedy {
  name: string,
  info?: RemedyInfo,
  noInfoFound: boolean,
}

export interface RemedyInfo {
  uses: {
    symptom: Symptom,
    sources: Source[],
  }[],
  sideEffects: {
    symptom: Symptom,
    sources: Source[],
  }[],
  // TODO special precautions
  // TODO interactions
  otherNames: []
}

interface Source {
  url: string
}

interface Symptom {
  name: string,
  related?: (mongoID | Symptom)[]
}

export interface WebMDInfo {
  webMDMainName: string,
  otherNames: string[],
  uses: string[]
}