import { TCIMRemedyProps, TCIMUse, TCIMUseProps } from '@herbremme/hmongo'
import { readSync } from "fs"
import {TCIMUseDoc} from '@herbremme/hmongo'
import { readFileSync } from 'fs'
import { table } from 'console'

async function insertUse(uses: string[]): Promise<TCIMUseDoc[]> {
  console.log(uses)
  return Promise.all(uses.map(async use => {
    await TCIMUse.updateOne({ use }, { use }, {upsert: true})
    return await TCIMUse.findOne({ use })
  }))
}

export async function TCIMParseTxt(): Promise<TCIMRemedyProps[]> {
  const content = readFileSync('./_files/herb-TCMID.v2.01').toString()
  // Remove header line
  const lines = content.split('\n').splice(1)
  return (await Promise.all(lines.map(async line => {
    const tabSplit = line.split('\t')
    const english = /^[A-Za-z0-9]*$/;
    // check if second col is english or chinese. If chinese, no offset, if english subtract 1
    const offset = english.test(tabSplit[1]) && tabSplit[1] !== "NA" ? -1 : 0
    // console.log(tabSplit)
    console.log(tabSplit[2 + offset])
    if (!tabSplit[7 + offset] || tabSplit[7 + offset] === "NA")
      return null
    const uses = await insertUse(tabSplit[7 + offset].replace(".", "").split(", "))
    return {
      chineseName: tabSplit[0],
      uses: uses.map(use => use._id),
      _id: null,
      __v: 0,
      englishName: tabSplit[2 + offset] === "NA" ? null : tabSplit[2 + offset]
    }
  }))).filter(x => x !== null)
}