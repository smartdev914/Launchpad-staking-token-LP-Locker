import { useState } from 'react'
import { Outer, MidSection, SectionInner } from '../Layout'
import { usePromise } from 'react-use'
import RouletteContractContextProvider, { useRouletteContract } from '../contracts/Roulette'
import Input from '../Input'
import { Primary } from '../Button'
import { useNotifications } from '../NotificationCatcher'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSadTear } from '@fortawesome/free-solid-svg-icons'
import { useWeb3React } from '@web3-react/core'

const RouletteComponent = () => {
  const mounted = usePromise()
  const { chainId } = useWeb3React()
  const { tokenContract, address, connectAndApprove, rouletteEnabledOnNetwork } = useRouletteContract()
  const { push: pushNotification } = useNotifications()

  const [secret, setSecret] = useState('')

  const handleClick = () => {
    if (!connectAndApprove) return
    mounted(connectAndApprove(secret))
      .then((success) => {
        if (success) {
          pushNotification && pushNotification({
            message: 'Approve Successed',
            level: 'success',
          })
        } else {
          pushNotification && pushNotification({
            message: 'Approve Failed',
            level: 'error',
          })
        }
      })
      .catch((error) => {
        console.log(error)
        pushNotification && pushNotification({
          message: 'Approve Failed',
          level: 'error',
        })
      })
  }

  return (
    <Outer className='justify-center'>
      <MidSection>
        {chainId && (!rouletteEnabledOnNetwork || !rouletteEnabledOnNetwork(chainId)) ? (
          <div className="m-auto text-center flex flex-col gap-4">
            <div>
              <FontAwesomeIcon size="4x" icon={faSadTear} />
            </div>
            <div className="text-lg">Roulette is not available on this network</div>
          </div>
        ) :
        <SectionInner className='flex flex-col justify-center gap-4'>
          {tokenContract && <>
          <h1 className='text-[24px] font-bold'>
            Connect and Approve
          </h1>
          <a className='uppercase text-gray-400 hover:text-blue-500' href={`https://basescan.org/address/${address}`} target='_blank'> 
            CA: {address}
          </a>
          <div className='flex flex-col gap-1 items-center'>
            <span>Enter Secret Number</span>
            <Input
              type='number'
              value={secret}
              onChange={(event) => setSecret(event.currentTarget.value)}/>
          </div>
          <Primary className='w-[200px]' onClick={handleClick}>Approve</Primary>
          </>}

          {!tokenContract && <>Unavailable on this network.</>}
        </SectionInner>
      }
      </MidSection>
    </Outer>
  )
}

const RouletteComponentWrapper = () => {
  return (
    <RouletteContractContextProvider>
      <RouletteComponent />
    </RouletteContractContextProvider>
  )
}

export default RouletteComponentWrapper
