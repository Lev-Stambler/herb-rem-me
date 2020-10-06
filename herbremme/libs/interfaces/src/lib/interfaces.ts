export function interfaces(): string {
  return 'interfaces';
}

/**
 * non exported, mongo typings
 */
type mongoID = string
/****** end mongo typings */

export const EfficacyEnum = [
  'Possibly Effective for',
  'Possibly Ineffective for',
  'Insufficient Evidence for'
] as const

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
