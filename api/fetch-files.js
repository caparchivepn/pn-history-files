import 'dotenv/config'

export default async function handler(req, res) {
  const { query, pageToken, language } = req.query
  const folderIdFr = '1Al38gDn14b3aRAtn6pp04egz6xvalHHA'
  const folderIdDe = '1EmE-wp-WlAsvedyU5q0VkaZkgNfraNVX'
  const apiKey = process.env.GOOGLE_API_KEY

  try {
    const folderId = language == 'FR' ? folderIdFr : folderIdDe
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?pageSize=25&q='${folderId}' in parents ${
        query ? `and (fullText contains '${query}')` : '&orderBy=name desc'
      }&fields=files(id, name),nextPageToken${
        pageToken ? `&pageToken=${pageToken}` : ''
      }&key=${apiKey}`,
    )

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Error fetching files' })
  }
}
