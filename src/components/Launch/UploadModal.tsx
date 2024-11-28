import React, { useState }  from 'react'
import DetailsCard from '../DetailsCard'
import { Primary } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { upload_image } from './Api'

interface Props {
  address?: string,
  onUpdateImageCID: Function,
  onUpdateMetadataCID: Function
}

const UploadModal: React.FC<Props> = (props) => {

  const [imageCID, setImageCID] = useState('')
  const [metadataCID, setMetadataCID] = useState('')

  const [selectedImages, setSelectedImages] = useState<Array<File>>([]);
  const [selectedMetadata, setSelectedMetadata] = useState<Array<File>>([]);

  const [fileUploading, setFileUploading] = useState(false)
  const [metaUploading, setMetaUploading] = useState(false)

  const changeImageHandler = (event: any) => {
    setSelectedImages(event.target.files);
  };

  const handleUploadImage = async() => {

    const formData = new FormData();

    Array.from(selectedImages).forEach((file: File) => {
      formData.append("file", file)
    })

    const metadata = JSON.stringify({
      name: `${props.address}_images`,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', options);

    setFileUploading(true)

    upload_image(formData)
      .then((res) => {
        setImageCID(res.data.IpfsHash)
        props.onUpdateImageCID(res.data.IpfsHash, res.data.isDuplicate?0:res.data.PinSize)
      })
      .catch(console.error)
      .finally(() => setFileUploading(false))
  };

  const changeMetadataHandler = (event: any) => {
    setSelectedMetadata(event.target.files);
  };

  const handleUploadMetadata = async() => {

    const formData = new FormData();

    Array.from(selectedMetadata).forEach((file: File) => {
      formData.append("file", file)
    })

    const metadata = JSON.stringify({
      name: `${props.address}_metadata`,
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', options);

    setMetaUploading(true)


    upload_image(formData)
      .then((res) => {
        setMetadataCID(res.data.IpfsHash)
        props.onUpdateMetadataCID(res.data.IpfsHash, res.data.isDuplicate?0:res.data.PinSize)
      })
      .catch(console.error)
      .finally(() => setMetaUploading(false))
  };


  return (
    <DetailsCard
      className="w-[400px]"
      headerContent={
        <div className="flex items-center justify-between">
          <div className="text-xl">Upload to IPFS</div>
          <div className="flex gap-2 items-center">
          </div>
        </div>
      }
      mainContent={
        <div className='flex flex-col gap-10'>
          <div className='flex flex-col gap-3'>
            <label className="text-center border border-gray-700 py-2 rounded-lg">Upload Images</label>
            <input type="file" onChange={changeImageHandler} multiple />
            {imageCID && <a className='text-sm overflow-hidden text-ellipsis hover:text-blue-400' href={`https://ipfs.io/ipfs/${imageCID}`} target='_blank'>{`ipfs://${imageCID}`}</a>}
            <Primary onClick={handleUploadImage} disabled={selectedImages.length>0?false:true}>
              {fileUploading && <FontAwesomeIcon className='animate-spin mr-1' icon={faCircleNotch}/>}
              Upload
            </Primary>
            {fileUploading && <small className='text-gray-400'>Depending on the size of your upload, this process may take some time. Please do not close your browser or close this modal.</small>}
          </div>
          
          <div className='flex flex-col gap-3'>
            <label className="text-center border border-gray-700 py-2 rounded-lg">Upload Metadata</label>
            <input type="file" onChange={changeMetadataHandler} multiple />
            {metadataCID && <a className='text-sm overflow-hidden text-ellipsis hover:text-blue-400' href={`https://ipfs.io/ipfs/${metadataCID}`} target='_blank'>{`ipfs://${metadataCID}`}</a>}
            <Primary onClick={handleUploadMetadata} disabled={selectedMetadata.length>0?false:true}>
              {metaUploading && <FontAwesomeIcon className='animate-spin mr-1' icon={faCircleNotch}/>}
              Upload
            </Primary>
            {metaUploading && <small className='text-gray-400'>Depending on the size of your upload, this process may take some time. Please do not close your browser or close this modal.</small>}
          </div>
        </div>
      }
    />
  )
}

export default UploadModal
