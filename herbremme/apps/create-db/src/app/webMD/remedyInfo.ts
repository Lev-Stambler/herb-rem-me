import $ from 'cheerio'
import { getHTMLBodyFromBrowserPage } from '@herbremme/utils'
import { WMUseProps, WMRemedy, WMRemedyProps, WMRemedySchema, WMUse } from '@herbremme/hmongo'
import { EfficacyEnum } from '@herbremme/interfaces'

async function getWebMDLinkFromRemedy(remedyName: string): Promise<string | null> {
  console.log(`https://duckduckgo.com/?q=webmd ${remedyName} vitamin`)
  // console.log($.load(html)('#search .r'))
  const html = await getHTMLBodyFromBrowserPage(`https://duckduckgo.com/?q=webmd ${remedyName} vitamin`)
  const firstRet = $.load(html)('.results--main .result__title a').map((i, e) => $(e).attr('href')).toArray()[0] as unknown as string
  // Not webMD
  if (!firstRet.includes('webmd.com') || !firstRet.includes('vitamins/ai/ingredientmono'))
    return null
  return firstRet
}

export async function getWebMDInfoForRemedy(remedyName: string): Promise<WMRemedyProps | null> {
  const webMDLink = await getWebMDLinkFromRemedy(remedyName)
  console.log(webMDLink)
  if (!webMDLink) {
    return null
  }
  // const ret = await fetch(webMDLink as string)
  const html = await getHTMLBodyFromBrowserPage(webMDLink as string)
  const $WebMD = $.load(html)
  const webMDMainName = $WebMD('.vitamin-header h1').text()
  const otherNames = $WebMD('.vitamin-header .other-names p').text().replace('.', '').split(', ')
  const usesHTML = $WebMD('.tab-container #tab-2').html()
  const splitByH3 = usesHTML.split("<h3>")
  const h3SectionToIndividualUses = (h3Section: string, efficacy: typeof EfficacyEnum[number]) => {
    const removeH3Close = h3Section.replace(/.*<\/h3>/g, '')
    return $.load(removeH3Close)('li strong').map((i, elem) => $(elem).text()).toArray().map(use => {
      return {
        use: use as unknown as string,
        efficacy,
      }
    })
  }
  const nonFlatUses = splitByH3.map(s => {
    if (s.includes(EfficacyEnum[0])) return h3SectionToIndividualUses(s, EfficacyEnum[0])
    else if (s.includes(EfficacyEnum[1])) return h3SectionToIndividualUses(s, EfficacyEnum[1])
    else return h3SectionToIndividualUses(s, EfficacyEnum[2])
  })
  console.log(nonFlatUses)
  const uses = nonFlatUses.flat()
  const proms = uses.map(use => WMUse.updateOne({
    use: use.use,
    efficacy: use.efficacy
  }, use, { upsert: true }))
  const usesProps: WMUseProps[] = await Promise.all(proms)

  // const uses = $WebMD('.tab-container #tab-2 li strong').map((i, elem) => $(elem).text()).toArray().map(e => e.toString().replace('.', ''))
  console.log({
    webMDMainName,
    otherNames,
    uses: nonFlatUses.flat()
  })
  await WMRemedy.create({
    mainName: webMDMainName,
    otherNames,
    uses: usesProps.map(use => use._id)
  })
}

// TODO: put into mongoDB and then create a list of all WebMD info. Have diff catergorey for effective for, possibly effective for, etc. Make into categories
// Make it a vector --> encoder