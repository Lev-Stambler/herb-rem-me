import $ from 'cheerio'
import { Remedy } from '@herbremme/interfaces'
import { writeFileSync } from 'fs'
import fetch from 'node-fetch'
import { getWebMDInfoForRemedy } from './app/webMD'
import { connectMongoose } from '@herbremme/hmongo'
import { environment } from './environments/environment'

const filename = "db.json" // TODO mongodb db
async function main() {
  await connectMongoose(environment.DB.USER, environment.DB.PASS, environment.DB.DB)
  // Get a list of all herbs
  const herbs = await getAllHerbsFromTRC()
  writeFileSync('./_files/' + filename, JSON.stringify(herbs))
  for (let i = 0; i < herbs.length; i++) {
    console.info(`Scraping for herb: ${herbs[i]}`)
    await getWebMDInfoForRemedy(herbs[i])
  }
}

// TODO end diff file

// TODO scrape http://www.naturalmedicinalherbs.net/herbs/latin-names/
/**
 * Scrape from https://naturalmedicines.therapeuticresearch.com/databases/food,-herbs-supplements.aspx
 * Get all listed herbs
 */
async function getAllHerbsFromTRC(): Promise<string[]> {
  // 0 for digits
  const allLetterIndexing = ["0", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
  const scrapeProms = allLetterIndexing.map(indexLetter => fetch(`https://naturalmedicines.therapeuticresearch.com/databases/food,-herbs-supplements.aspx?letter=${indexLetter}`).then(async ret => {
    const srcHTML = await ret.text();
    const elems = $.load(srcHTML)('.letterGroup a')
    return elems.map(function () {
      return $(this).text().replace(" - [FAST FACTS]", "")
    }).toArray().map(x => x.toString()) as string[]
  }).catch(e => {
    console.error(`Error with scraping from TRC: `, e)
    return [] as string[]
  }))
  const nonFlatRemedies = await Promise.all(scrapeProms)
  return nonFlatRemedies.flat()
}

console.log("Running create-db")
main()
// connectMongoose(environment.DB.USER, environment.DB.PASS, environment.DB.DB)
//   .then(() => getWebMDInfoForRemedy('turmeric'))
