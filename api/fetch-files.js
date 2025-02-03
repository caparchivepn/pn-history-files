import 'dotenv/config';

export default async function handler(req, res) {
  const { query, pageToken } = req.query;
  const folderId = "1Y0zWn74fRmo32APXO1CMSsZ7b_tfR5z4";
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?pageSize=1&q='${folderId}' in parents ${query ? `and (name contains '${query}' or fullText contains '${query}')`:""}&orderBy=name desc&fields=files(id, name),nextPageToken${pageToken ? `&pageToken=${pageToken}` : ""}&key=${apiKey}`
      );
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching files" });
  }
}