import { Outer, MidSection } from '../Layout'
import { usePromise } from 'react-use'
import { useNotifications } from '../NotificationCatcher'
import BotCard from './BotCard'

const bots = [
  {
    title: "Stealth Roulette Bot",
    desc: "Play Russian Roulette with StealthGroup or Add the Bot and Play with your Friends in a Private Group.",
    url: "https://t.me/StealthRoulette_bot"
  },
  {
    title: "Stealth BuyBot",
    desc: "Add StealthBuyBot to your Token group to get your investors excited. Trending Coming Soon.",
    url: "https://t.me/StealthBuy_Bot"
  },
  {
    title: "ETH Trending",
    desc: "Get all the Latest Token Releases on ETH Network",
    url: "https://t.me/ETHStealthTrending"
  }
]

const BotYardComponent = () => {
  const mounted = usePromise()
  const { push: pushNotification } = useNotifications()

  return (
    <Outer className='justify-center'>
      <MidSection>
        <div className='grid grid-cols-1 lg:grid-cols-2 justify-around gap-10 max-w-[1024px] mx-auto'>
          {bots.map(bot => <BotCard data={bot} key={bot.title}/>)}
        </div>
      </MidSection>
    </Outer>
  )
}

export default BotYardComponent
