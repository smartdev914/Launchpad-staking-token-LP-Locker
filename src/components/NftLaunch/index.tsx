import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faCirclePlus, faList, faSadTear } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import NotConnected from '../NotConnected'
import Button from '../Button'
import { Outer, MidSection, SectionInner, Grid, Loading } from '../Layout'
import { usePromise } from 'react-use'
import CreateTradingToken from './Create'
import { BigNumber, utils } from 'ethers'
import NftFactoryContractContextProvider, { useNftFactoryContract } from '../contracts/NftFactory'
import NftLaunchItem from './NftLaunchItem'
import NftLaunchDetail from './NftLaunchDetail'
import NftLaunchAdmin from './NftLaunchAdmin'

export interface NftLaunchProps {
  viewMode: 'all' | 'create' | 'detail' | 'admin'
}

const NftLaunchComponent: React.FC<NftLaunchProps> = ({ viewMode }) => {
  const mounted = usePromise()
  const { chainId: chainIdToUse, address, ref } = useParams()
  const { account, connector, chainId } = useWeb3React()
  const { contract, nftFactoryEnabledOnNetwork, getContractAddress, totalProjects } = useNftFactoryContract()
  const [nftLaunchList, setNftLaunchList] = useState<string[]>([])

  const setupLockTimer = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (chainId && chainIdToUse && chainId !== parseInt(chainIdToUse)) {
      console.warn('Incorrect chain id!')
    }
  }, [chainId, chainIdToUse])

  const setupAllNftLaunch = useCallback(() => {
    if (!contract || !totalProjects || !getContractAddress) {
      setNftLaunchList([])
      return
    }

    if (address) {
      setNftLaunchList([address])
    } else if (viewMode === 'all') {
      mounted(Promise.all(new Array(totalProjects).fill(null).map((val, index) => getContractAddress(index+1))))
        .then((results: string[]) => {
          setNftLaunchList(results)
        })
        .catch(console.error)
    } 
  }, [mounted, contract, address, getContractAddress, totalProjects, viewMode])

  useEffect(() => {
    if (!chainId || !contract || !connector) return
    setupLockTimer.current && clearTimeout(setupLockTimer.current)
    mounted(
      new Promise((done) => {
        setupLockTimer.current = setTimeout(done, 250)
      }),
    ).then(setupAllNftLaunch)
  }, [chainId, mounted, contract, connector, setupAllNftLaunch])

  return (
    <Outer>
      <div className="p-2 flex justify-center items-center gap-1">
        <Link to="/nfts/">
          <Button
            className={`rounded-l-none rounded-r-none transition-colors ${
              viewMode === 'all' || viewMode === 'detail' || viewMode === 'admin'
                ? ' border-b-2 text-blue-300 border-blue-300 rounded-t-md'
                : ' border-b-2 text-gray-200 border-gray-200'
            }`}
          >
            <FontAwesomeIcon icon={faList}/> NFT Launch List ({totalProjects})
          </Button>
        </Link>

        <Link to="/nfts/create">
          <Button
            className={`rounded-l-none rounded-r-none transition-colors ${
              viewMode === 'create'
                ? ' border-b-2 text-blue-300 border-blue-300 rounded-t-md'
                : ' border-b-2 text-gray-200 border-gray-200'
            }`}
          >
            <FontAwesomeIcon icon={faCirclePlus}/> Create NFT Launch
          </Button>
        </Link>
      </div>

      <MidSection>
        <SectionInner>
          {chainId && (!nftFactoryEnabledOnNetwork || !nftFactoryEnabledOnNetwork(chainId)) ? (
            <div className="m-auto text-center flex flex-col gap-4">
              <div>
                <FontAwesomeIcon size="4x" icon={faSadTear} />
              </div>
              <div className="text-lg">NFTLaunch is not available on this network</div>
            </div>
          ) : connector ? (
            <div className="flex flex-col justify-center w-full items-center gap-4">
              {(nftLaunchList.length == 0 && viewMode === 'all') ? (
                <Loading>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin className="opacity-50" size="5x" />
                  </motion.div>
                </Loading>
              ) : (
                <>
                  {viewMode === 'detail' && typeof address !== 'undefined' ? (
                    <div className="w-full flex justify-around">
                      <NftLaunchDetail className='w-full' address={address} />
                    </div>
                  ) : 
                  viewMode === 'admin' && typeof address !== 'undefined' && nftLaunchList[0] ? (
                    <div className="w-full flex justify-around">
                      <NftLaunchAdmin className='w-full' address={nftLaunchList[0]} />
                    </div>
                  ) : 
                  viewMode === 'all' ? (
                    <Grid>
                      {nftLaunchList.map((item: string) => (
                        <NftLaunchItem key={item} address={item} />
                      ))}
                    </Grid>
                  ) : viewMode === 'create' ? (
                    <CreateTradingToken />
                  ):(<></>)}
                </>
              )}
            </div>
          ) : (
            <NotConnected text="Connect your wallet to view staking." />
          )}
        </SectionInner>
      </MidSection>
    </Outer>
  )
}

const NftLaunchComponentWrapper: React.FC<NftLaunchProps> = (props) => {
  return (
    <NftFactoryContractContextProvider>
      <NftLaunchComponent {...props} />
    </NftFactoryContractContextProvider>
  )
}

export default NftLaunchComponentWrapper
