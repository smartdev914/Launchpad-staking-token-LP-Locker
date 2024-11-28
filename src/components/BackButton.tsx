import { useNavigate } from 'react-router-dom'

const BackButton= () => {
  const navigate = useNavigate()

  return (
    <div className='mx-1 cursor-pointer' onClick={() => navigate(-1)}>
      {'<-'}
    </div>
  )
}

export default BackButton
