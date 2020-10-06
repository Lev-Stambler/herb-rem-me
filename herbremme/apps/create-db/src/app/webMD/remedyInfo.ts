import $ from 'cheerio'
import { getHTMLBodyFromBrowserPage } from '@herbremme/utils'
import { WMUseProps, WMRemedy, WMRemedyProps, WMRemedySchema, WMUse, WMUseDoc } from '@herbremme/hmongo'
import { EfficacyEnum } from '@herbremme/interfaces'

async function getWebMDLinkFromRemedy(remedyName: string): Promise<string | null> {
  console.log(`https://duckduckgo.com/?q=webmd ${remedyName} vitamin`)
  // console.log($.load(html)('#search .r'))
  const html = await getHTMLBodyFromBrowserPage(`https://duckduckgo.com/?q=webmd+${remedyName}+vitamin&ia=web`)
  const firstRet = $.load(html)('.results--main #links .result__title a').map((i, e) => $(e).attr('href')).toArray()[0] as unknown as string
  // const ret = await fetch(`http://api.duckduckgo.com/?q=webmd ${remedyName} vitamin&format=json`)
  // const firstRet = (await ret.json()).
  // Not webMD
  if (!firstRet.includes('webmd.com') || !firstRet.includes('vitamins/ai/ingredientmono'))
    return null
  return firstRet
}

export async function getWebMDInfoForRemedy(remedyName: string): Promise<WMRemedyProps | null> {
  const webMDLink = await getWebMDLinkFromRemedy(remedyName)
  if (!webMDLink) {
    return null
  }
  // const ret = await fetch(webMDLink as string)
  const html = await getHTMLBodyFromBrowserPage(webMDLink as string)
  // console.log(html)
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
  const uses = nonFlatUses.flat()
  const proms = uses.map(async use => await WMUse.findOneAndUpdate({
    use: use.use,
    efficacy: use.efficacy
  }, use, { upsert: true }))
  const usesProps: WMUseDoc[] = await Promise.all(proms)
  console.log(usesProps)
  await WMRemedy.updateOne({ mainName: webMDMainName }, {
    mainName: webMDMainName,
    otherNames,
    uses: usesProps.map(use => use._id),
    initName: remedyName
  }, { upsert: true })
}

// TODO: put into mongoDB and then create a list of all WebMD info. Have diff catergorey for effective for, possibly effective for, etc. Make into categories
// Make it a vector --> encoder