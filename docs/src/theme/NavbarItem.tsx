import React from "react"
import OriginalNavBarItem from "@theme-original/NavbarItem"
import { useLocation } from "@docusaurus/router"

export default function NavbarItem(props) {
  const { pathname } = useLocation()

  let [, , version] = pathname.split("/")

  return (
    <>
      <OriginalNavBarItem {...props} className={props.className + " " + version} />
    </>
  )
}
