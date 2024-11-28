import React from 'react'
import {Tooltip as ReactTooltip, PlacesType} from 'react-tooltip'

interface Props {
  children?: React.ReactNode,
  id: string,
  place?: PlacesType,
  className?: string
}

const Tooltip: React.FC<Props> = ( { children, id, place, className } ) => {
  return <ReactTooltip id={id} place={place} className={className}> {children} </ReactTooltip>
}

export default Tooltip
