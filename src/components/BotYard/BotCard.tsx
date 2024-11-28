import tw from "tailwind-styled-components"

import imgBot from "../../assets/images/logo-white.png"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStar } from "@fortawesome/free-solid-svg-icons"
import { faTelegram, faTelegramPlane } from "@fortawesome/free-brands-svg-icons"

const Card = tw.div`
  flex
  flex-col
  h-full
  w-full
  shadow-[0_5px_5px_-5px_gray]
`
const CardTitle = tw.div`
  w-full
  text-center
  shadow-[0_5px_5px_-5px_gray]
  rounded-t-lg
  text-[22px]
  font-bold
  bg-gray-800
  p-3
`

const CardContent = tw.div`
  w-full
  h-full
  p-6
  flex
  gap-4
  bg-gray-800
  bg-opacity-50
`

export default function BotCard ({data}: {data: any}) {
  return (
    <Card>
      <CardTitle>
        {data.title}
      </CardTitle>
      <CardContent>
        <img className="w-[200px]" src={imgBot} alt=""/>
        <div className="flex flex-col w-full items-center mt-3">
          <span className="flex-grow w-full">{data.desc}</span>
          <div className="w-full flex justify-end">
            <a href={data.url} target="_blank">
              <FontAwesomeIcon 
                className="text-[22px] border-2 border-gray-500 text-gray-500 hover:border-gray-200 hover:text-gray-200 px-6 py-1 rounded-xl cursor-pointer" 
                icon={faTelegram}
              />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}