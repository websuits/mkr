import xml2js from 'xml2js'

const parser = new xml2js.Parser({
  explicitArray: false,
  trim: true,
  attrkey: 'attributes',
})

export async function parseXml(
  xmlAsString: string
): Promise<TheMarketerProductReviews> {
  const partResult: TheMarketerProductReviews = await parser.parseStringPromise(
    xmlAsString
  )

  return partResult
}
