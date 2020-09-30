import $ from 'cheerio'
import { getHTMLBodyFromBrowserPage} from '@herbremme/utils'

async function getWebMDLinkFromRemedy(remedyName: string): Promise<string | null> {
  // console.log(html)
  // console.log($.load(html)('#search .r'))
  const html = await getHTMLBodyFromBrowserPage(`https://duckduckgo.com/?q=webmd ${remedyName} vitamin`)
  console.log($.load(html)('.results--main .result__title a').map((i, e) => $(e).attr('href')).toArray()[0])
  const firstRet = $.load(html)('.results--main .result__title a').map((i, e) => $(e).attr('href')).toArray()[0] as string
  // Not webMD
  if (!firstRet.includes('webmd.com') || !firstRet.includes('vitamins/ai/ingredientmono'))
    return null
  return firstRet
}

export async function getWebMDInfo(remedyName: string): Promise<WebMDInfo | null> {
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
  const uses = $WebMD('.tab-container #tab-2 li strong').map((i, elem) => $(elem).text()).toArray().map(e => e.toString().replace('.', ''))
  console.log({
    webMDMainName,
    otherNames,
    uses
  })
  return {
    webMDMainName,
    otherNames,
    uses
  }
}
