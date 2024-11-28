import tw from 'tailwind-styled-components'

export const Outer = tw.div`
  text-gray-800
  dark:text-gray-200
`

export const MidSection = tw.section`
  bg-gray-200
  dark:bg-gray-900
  py-10
  px-5
  md:px-10
`

export const SectionInner = tw.div`
  container
  m-auto
  md:flex
  justify-between
  items-center
`

export const Grid = tw.div`
  grid
  grid-cols-1
  md:grid-cols-2
  xl:grid-cols-3
  gap-5
  w-full
`

export const Loading = tw.div`
  flex
  justify-center
  items-center
  py-20
`

export const SectionInfo = tw.div`
  flex 
  flex-col 
  p-4 
  relative 
  bg-gray-200 
  bg-opacity-50 
  dark:bg-gray-900 
  dark:bg-opacity-70 
  border 
  rounded-t 
  border-gray-100 
  dark:border-gray-800
  min-w-[300px]
`