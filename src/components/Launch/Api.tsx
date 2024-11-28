import axios from "axios"

const JWT = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2MjgzMzExYS0yYzVhLTRhMjMtODBlMy0wMDgyYzc4Y2Y3YWIiLCJlbWFpbCI6ImRldnBheWluY0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiOWZiZmNlOTU5N2NiZmYyYmQxNzUiLCJzY29wZWRLZXlTZWNyZXQiOiI2MTMzMDJhYWRmMWI0Mzc1OWViYTgyNGVlZDc0ZDAzZjljYjUzZGVjZDlmZDNkYjI0NzdkMzQxMTRjOTdhMzkyIiwiaWF0IjoxNjk1MzY3MjI4fQ.ZQ6YSBkfjjH-RND2qs5xMJC8z4RUBL0AaTh4WndquiQ`

const API_URL = "https://api.stealthpad.xyz/api/profiles"

interface COLLETION {
  address: string
  description?: string
  website_url?: string
  twitter_url?: string
  telegram_url?: string
  image_cid?: string
  metadata_cid?: string
  upload_size?: number
  logo_url?: string
}

export function get_collection_info(address: string) {
  return axios.get(`${API_URL}/${address}`)
}

export function insert_collection_info(collection: COLLETION) {
  return axios.post(API_URL, collection)
}

export function update_collection_info(collection: COLLETION) {
  return axios.put(`${API_URL}/${collection.address}`, collection)
}

export function delete_collection_info(address: string) {
  return axios.delete(`${API_URL}/${address}`)
}

export function upload_image(formData: FormData) {
  return axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxBodyLength: 10*1024*1024,  // 10 GB
      headers: {
        'Content-Type': `multipart/form-data`,
        Authorization: JWT,
      }
    });
}