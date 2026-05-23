import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0x7D7D338BAb8e19bad2c0959f15fe5d7ad6737708'
const RPC_URL = 'https://testrpc.xlayer.tech'
const TOKEN_URI_ABI = ['function tokenURI(uint256 tokenId) view returns (string)']

export default async function handler(req, res) {
  const { tokenId } = req.query
  if (!tokenId) return res.status(400).send('Missing tokenId')

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, TOKEN_URI_ABI, provider)
    const tokenURI = await contract.tokenURI(tokenId)

    const base64 = tokenURI.replace('data:application/json;base64,', '')
    const json = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))

    // If image is already a data URI, decode and serve SVG directly
    const imageField = json.image ?? ''
    if (imageField.startsWith('data:image/svg+xml;base64,')) {
      const svgContent = Buffer.from(
        imageField.replace('data:image/svg+xml;base64,', ''), 'base64'
      ).toString('utf8')
      res.setHeader('Content-Type', 'image/svg+xml')
      res.setHeader('Cache-Control', 'public, max-age=3600')
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.send(svgContent)
    }

    // If image is already an https URL just redirect
    if (imageField.startsWith('https://')) {
      return res.redirect(302, imageField)
    }

    res.status(404).send('No image found')
  } catch (e) {
    console.error(e)
    res.status(500).send(e.message)
  }
}