import { useEffect, useState } from 'react'
import { Outer, MidSection, SectionInner } from '../Layout'
import { usePromise } from 'react-use'
import SteatlhNftContractContextProvider, { useSteatlhNftContract } from '../contracts/SteatlhNft'
import Input from '../Input'
import { Primary } from '../Button'
import { useNotifications } from '../NotificationCatcher'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSadTear } from '@fortawesome/free-solid-svg-icons'
import { useWeb3React } from '@web3-react/core'
import { formatUnits } from 'ethers/lib/utils'

import nftImg from "../../assets/images/nft.gif"
import openseaImg from "../../assets/images/opensea.png"
import { BigNumber } from 'ethers'

const SteatlhNftComponent = () => {
  const mounted = usePromise()
  const { chainId, account } = useWeb3React()
  const { nftContract, address, mint, getBalance, mintPrice, SteatlhNftEnabledOnNetwork } = useSteatlhNftContract()
  const { push: pushNotification } = useNotifications()

  const [mintAmount, setMintAmount] = useState(0)
  const [timer, setTime] = useState<number>(0)
  const [balance, setBalance] = useState<number>(0)

  const handleClick = () => {
    if (!mint || !mintAmount || !mintPrice || !mintPrice.toNumber()) return
    if (mintAmount > 5) {
      pushNotification && pushNotification({
        message: 'You cant mint more than 5 nfts.',
        level: 'error',
      })
      return
    }
    mounted(mint(mintAmount, mintPrice))
      .then((success) => {
        if (success) {
          pushNotification && pushNotification({
            message: 'Mint Successed',
            level: 'success',
          })
        } else {
          pushNotification && pushNotification({
            message: 'Mint Failed',
            level: 'error',
          })
        }
      })
      .catch((error) => {
        console.log(error)
        pushNotification && pushNotification({
          message: error.message,
          level: 'error',
        })
      })
  }

  const getMintPrice = () => {
    if(!mintPrice || !mintAmount) return 0;
    return (Number(formatUnits(mintPrice))*mintAmount).toFixed(4);
  }

  useEffect(() => {
    if (!mounted || !nftContract || !account || !getBalance) return
    mounted(getBalance(account))
      .then((response: BigNumber) => {setBalance(response.toNumber())})
      .catch((error) => {console.log(error), setBalance(0)})
  }, [mounted, nftContract, account, getBalance])

  useEffect(() => {
    const deadline = new Date("2023-09-12 12:00:00")
    const current = Date.now()
    const leftTime = Math.max(deadline.getTime()/1000 - Math.floor(current/1000), 0)
    setTime(leftTime)
    if (leftTime > 0) {
      const timerId = setInterval(() => {
        setTime(prev => {
          if(prev > 0) return prev-1
          return 0
        })
      }, 1000)
      return () => {
        clearInterval(timerId)
      }
    }
  }, [])

  const getFormat2 = (num: number) => {
    if (num < 10) return `0${num}`
    return num
  }

  return (
    <Outer className='justify-center'>
      <MidSection>
        {chainId && (!SteatlhNftEnabledOnNetwork || !SteatlhNftEnabledOnNetwork(chainId)) ? (
          <div className="m-auto text-center flex flex-col gap-4">
            <div>
              <FontAwesomeIcon size="4x" icon={faSadTear} />
            </div>
            <div className="text-lg">SteatlhNft is not available on this network</div>
          </div>
        ) :
        <SectionInner className='flex flex-col justify-center gap-4'>
          {nftContract && <>
            {timer > 0 && (
            <div className='flex gap-2 font-mono text-blue-400 border-blue-400 border-2 border-dashed px-10 py-2 my-10'>
              <div className='flex flex-col items-center justify-center'>
                <span className='text-[32px] leading-8 text-blue-500 animate-pulse'>{getFormat2(new Date(timer*1000).getDay())}</span>
                <small>day</small>
              </div>
              <span className='pt-1'>:</span>
              <div className='flex flex-col items-center justify-center'>
                <span className='text-[32px] leading-8 text-blue-500 animate-pulse'>{getFormat2(new Date(timer*1000).getHours())}</span>
                <small>hour</small>
              </div>
              <span className='pt-1'>:</span>
              <div className='flex flex-col items-center justify-center'>
                <span className='text-[32px] leading-8 text-blue-500 animate-pulse'>{getFormat2(new Date(timer*1000).getMinutes())}</span>
                <small>min</small>
              </div>
              <span className='pt-1'>:</span>
              <div className='flex flex-col items-center justify-center'>
                <span className='text-[32px] leading-8 text-blue-500 animate-pulse'>{getFormat2(new Date(timer*1000).getSeconds())}</span>
                <small>sec</small>
              </div>
            </div>)}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 justify-around'>
              <div className='flex flex-col w-[300px] h-[300px] relative mx-auto'>
                <img className='w-full h-full rounded-md' src={nftImg} alt=""/>
                <a href="https://opensea.io/collection/stealthpad-card" target='_blank'>
                  <img className='h-[24px] absolute bottom-1 right-1' src={openseaImg} alt=''/>
                </a>
              </div>
              <div className='flex flex-col items-center justify-center gap-4'>
                <h1 className='text-[24px] font-bold'>
                  StealthPad NFT Minting
                </h1>
                <h1 className='text-[24px] font-bold'>
                  9/13/2023 - 9/17/2023
                </h1>
                <h1 className='text-[24px] font-bold'>
                  12:00:00 AM (PST)
                </h1>
                <a className='uppercase w-full text-gray-400 break-all hover:text-blue-500' href={`https://etherscan.io/address/${address}`} target='_blank'> 
                  CA: {address}
                </a>
                {timer == 0 && (<>
                  <div className='flex flex-col gap-1 items-center'>
                    <span>Enter Nft Amount <small>(Max:{5-balance})</small></span>
                    <Input
                      type='number'
                      value={mintAmount}
                      max={balance?5-balance:5}
                      onChange={(event) => setMintAmount(Number(event.target.value))}/>
                  </div>
                  <Primary className='w-[250px]' onClick={handleClick}>
                    Mint {mintAmount && `(Price: ${getMintPrice()}ETH)` || ''}
                  </Primary>
                </>)}
              </div>
            </div>
          </>}

          {!nftContract && <>Unavailable on this network.</>}
        </SectionInner>
      }
      </MidSection>
    </Outer>
  )
}

const SteatlhNftComponentWrapper = () => {
  return (
    <SteatlhNftContractContextProvider>
      <SteatlhNftComponent />
    </SteatlhNftContractContextProvider>
  )
}

export default SteatlhNftComponentWrapper
