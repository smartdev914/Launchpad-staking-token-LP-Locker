import { BridgeData } from '../typings'

const bridges: Record<number, BridgeData> = {
  1: {
    bridge: '0x7BF2f06D65b5C9f146ea79a4eCC7C7cdFC01B613',
    erc20Handler: '0x016c1D8cf86f60A5382BA5c42D4be960CBd1b868',
    destinations: [
      {
        chainId: 1,
        resources: {
          '0x9B4A2E36d59e8b5E75d9f033b962E226fE617464':
            '0x000000000000000000000061eccf50a459b11f2609bcec009481f4dcbb824761',
        },
      },
      {
        chainId: 5,
        resources: {
          '0x9B4A2E36d59e8b5E75d9f033b962E226fE617464':
            '0x000000000000000000000061eccf50a459b11f2609bcec009481f4dcbb824761',
        },
      },
    ],
  },
  97: {
    bridge: '0xc5C3A145307548e71e3320360B92eFE5a732844a',
    erc20Handler: '0x77A5c78977EDf1eB48b040a0f454201bbB21FA39',
    destinations: [
      {
        chainId: 4,
        resources: {
          '0x61eCcF50a459B11f2609BceC009481F4Dcbb8247':
            '0x000000000000000000000061eccf50a459b11f2609bcec009481f4dcbb824761',
        },
      },
      {
        chainId: 123,
        resources: {
          '0x61eCcF50a459B11f2609BceC009481F4Dcbb8247':
            '0x000000000000000000000061eccf50a459b11f2609bcec009481f4dcbb824761',
        },
      },
    ],
  },
}

export default bridges
