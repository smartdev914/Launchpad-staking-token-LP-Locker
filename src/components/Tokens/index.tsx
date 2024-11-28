import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faCirclePlus, faList, faSadTear } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import TradingTokenManagerV1ContractContextProvider, { useTradingTokenManagerV1Contract } from '../contracts/TradingTokenManagerV1'
import TradingToken from './TradingToken'
import NotConnected from '../NotConnected'
import { TradingTokenData } from '../../typings'
import Button from '../Button'
import { Outer, MidSection, SectionInner, Grid, Loading } from '../Layout'
import { usePromise } from 'react-use'
import CreateTradingToken from './Create'
import { BigNumber, utils } from 'ethers'
import TradingTokenDetail from './TradingTokenDetail'
import TokenLockerManagerV1ContractContextProvider from '../contracts/TokenLockerManagerV1'

export interface TokensProps {
  viewMode: 'all' | 'create' | 'detail'
}

const TokensComponent: React.FC<TokensProps> = ({ viewMode }) => {
  const mounted = usePromise()
  const { chainId: chainIdToUse, address } = useParams()
  const { account, connector, chainId } = useWeb3React()
  const { createTokenEnabledOnNetwork, contract, count, getTradingTokenDataById, getTradingTokenDataByAddress } = useTradingTokenManagerV1Contract()
  const [tokenInstances, setTradingTokenInstances] = useState<Array<TradingTokenData>>([])
  const [sortedTradingTokenInstances, setSortedTradingTokenInstances] = useState<Array<TradingTokenData>>([])

  const setupLockTimer = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (chainId && chainIdToUse && chainId !== parseInt(chainIdToUse)) {
      console.warn('Incorrect chain id!')
    }
  }, [chainId, chainIdToUse])

  const setupAllTradingToken = useCallback(() => {
    if (!contract || !count || !getTradingTokenDataById || !getTradingTokenDataByAddress) {
      setTradingTokenInstances([])
      return
    }

    if (address) {
      mounted(getTradingTokenDataByAddress(address))
        .then((result) => {
          setTradingTokenInstances([result])
        })
        .catch(console.error)
    } else if (viewMode === 'all') {
      mounted(Promise.all(new Array(count).fill(null).map((val, index) => getTradingTokenDataById(index))))
        .then((results: Array<TradingTokenData>) => {
          setTradingTokenInstances(results)
        })
        .catch(console.error)
    } 
  }, [mounted, contract, address, getTradingTokenDataById, getTradingTokenDataByAddress, count, viewMode])

  useEffect(() => {
    setSortedTradingTokenInstances(
      [...tokenInstances].sort(
        (a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0),
      ),
    )
  }, [tokenInstances])

  useEffect(() => {
    if (!chainId || !contract || !connector) return
    setupLockTimer.current && clearTimeout(setupLockTimer.current)
    mounted(
      new Promise((done) => {
        setupLockTimer.current = setTimeout(done, 250)
      }),
    ).then(setupAllTradingToken)
  }, [chainId, mounted, contract, connector, setupAllTradingToken])

  return (
    <Outer>
      <div className="p-2 flex justify-center items-center gap-1">
        <Link to="/tokens/">
          <Button
            className={`rounded-l-none rounded-r-none border-b-2 ${
              viewMode === 'all'
                ? ' text-blue-300 border-blue-300 rounded-t-md'
                : ' text-gray-200 border-gray-200'
            }`}
          >
            <FontAwesomeIcon icon={faList}/> All Tokens ({count})
          </Button>
        </Link>

        <Link to="/tokens/create">
          <Button
            className={`rounded-l-none rounded-r-none border-b-2 ${
              viewMode === 'create'
                ? ' text-blue-300 border-blue-300 rounded-t-md'
                : ' text-gray-200 border-gray-200'
            }`}
          >
            <FontAwesomeIcon icon={faCirclePlus}/> Create Token
          </Button>
        </Link>
      </div>

      <MidSection>
        <SectionInner>
          {chainId && (!createTokenEnabledOnNetwork || !createTokenEnabledOnNetwork(chainId)) ? (
            <div className="m-auto text-center flex flex-col gap-4">
              <div>
                <FontAwesomeIcon size="4x" icon={faSadTear} />
              </div>
              <div className="text-lg">TradingToken is not available on this network</div>
            </div>
          ) : connector ? (
            <div className="flex flex-col justify-center w-full items-center gap-4">
              {(sortedTradingTokenInstances.length == 0 && viewMode === 'all') ? (
                <Loading>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <FontAwesomeIcon icon={faCircleNotch} fixedWidth spin className="opacity-50" size="5x" />
                  </motion.div>
                </Loading>
              ) : (
                <>
                  {typeof address !== 'undefined' &&
                  sortedTradingTokenInstances[0] ? (
                    <div className="w-full flex justify-around">
                      <TradingTokenDetail key={sortedTradingTokenInstances[0].address} tokenData={sortedTradingTokenInstances[0]} />
                    </div>
                  ) : 
                  viewMode === 'all' ? (
                    <Grid>
                      {sortedTradingTokenInstances.map((tokenData: TradingTokenData) => (
                        <TradingToken key={tokenData.address} tokenData={tokenData} />
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

const TokensComponentWrapper: React.FC<TokensProps> = (props) => {
  return (
    <TokenLockerManagerV1ContractContextProvider>
      <TradingTokenManagerV1ContractContextProvider>
        <TokensComponent {...props} />
      </TradingTokenManagerV1ContractContextProvider>
    </TokenLockerManagerV1ContractContextProvider>
  )
}

export default TokensComponentWrapper
