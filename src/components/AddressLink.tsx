import React, { CSSProperties, useContext, useCallback, useEffect, useState } from 'react'
import { useWeb3React, getWeb3ReactContext } from '@web3-react/core'
import { providers } from 'ethers'
import { getExplorerAddressLink, getShortAddress } from '../util'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExternalLinkAlt, faFileCode, faCopy } from '@fortawesome/free-solid-svg-icons'
import Anchor from './Anchor'
import { usePromise } from 'react-use'
import { useNotifications } from './NotificationCatcher'

// const { Web3Provider: Web3ProviderClass } = providers

// const { is } = utils

const IS_CONTRACT_CACHE: Record<number, Record<string, boolean>> = {}

export interface AddressLinkProps {
  //
  address: string
  internalUrl?: string
  linkText?: string
  definitelyContract?: boolean
  showContractIcon?: boolean
  className?: string
  style?: CSSProperties
}

const AddressLink: React.FC<AddressLinkProps> = ({
  address,
  internalUrl,
  linkText,
  definitelyContract = false,
  showContractIcon = true,
  className = '',
  style = {},
}) => {
  const mounted = usePromise()
  const { chainId, connector } = useWeb3React()
  const { chainId: chainIdConstant, connector: connectorConstant } = useContext(getWeb3ReactContext('constant'))
  // const [explorerUrl, setExplorerUrl] = useState<string>()
  const [provider, setProvider] = useState<providers.Web3Provider>()
  const [isContract, setIsContract] = useState<boolean>(definitelyContract)
  const { push: pushNotification } = useNotifications()

  const eitherChainId = typeof chainId !== 'undefined' ? chainId : chainIdConstant
  const eitherConnector = typeof connector !== 'undefined' ? connector : connectorConstant

  const getIsContract = useCallback(async () => {
    if (!showContractIcon) return false

    if (definitelyContract) return true

    if (!eitherChainId) return false

    if (IS_CONTRACT_CACHE[eitherChainId]?.hasOwnProperty(address)) return IS_CONTRACT_CACHE[eitherChainId][address]

    if (!provider) return false

    if (!IS_CONTRACT_CACHE[eitherChainId]) IS_CONTRACT_CACHE[eitherChainId] = {}

    IS_CONTRACT_CACHE[eitherChainId][address] = (await mounted(provider.getCode(address))) !== '0x'

    return IS_CONTRACT_CACHE[eitherChainId][address]
  }, [mounted, definitelyContract, showContractIcon, eitherChainId, provider, address])

  useEffect(() => {
    if (definitelyContract || !showContractIcon || !eitherChainId || !eitherConnector) {
      setProvider(undefined)
      return
    }

    mounted(eitherConnector.getProvider())
      .then((_provider) => new providers.Web3Provider(_provider))
      .then(setProvider)
      .catch((err: Error) => {
        console.error(err)
        setProvider(undefined)
      })
  }, [mounted, definitelyContract, eitherChainId, eitherConnector, showContractIcon])

  useEffect(() => {
    mounted(getIsContract())
      .then(setIsContract)
      .catch((err: Error) => {
        setIsContract(false)
      })
  }, [mounted, getIsContract])

  const copyClipboard = (data:string) => {
    navigator.clipboard.writeText(data)
      .then(() => {
        pushNotification && pushNotification({
          message: 'Text copied to clipboard',
          level: 'success',
        })
      })
      .catch((error) => {
        pushNotification && pushNotification({
          message: 'Failed to copy text:' + error,
          level: 'error',
        })
      });
  }

  return (
    <span className={`inline-flex gap-1 items-center max-w-full ${className}`}>
      {internalUrl ? (
        <Link to={internalUrl} className="shrink overflow-hidden flex gap-2 items-center" style={style}>
          <span className="text-blue-400 overflow-hidden text-ellipsis lowercase">
            {linkText || getShortAddress(address)}
          </span>
        </Link>
      ) : (
        <>
          <span className="text-blue-400 lowercase">{linkText || getShortAddress(address)}</span>
        </>
      )}

      {eitherChainId ? (
        <Anchor
          className="shrink-0"
          target="_blank"
          rel="noopener noreferrer"
          href={getExplorerAddressLink(eitherChainId, address)}
        >
          <FontAwesomeIcon icon={faExternalLinkAlt} fixedWidth />
        </Anchor>
      ) : (
        <></>
      )}

      <Anchor
        className="shrink-0 cursor-pointer"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => copyClipboard(address)}
      >
        <FontAwesomeIcon icon={faCopy} fixedWidth />
      </Anchor>
    </span>
  )
}

export default AddressLink
