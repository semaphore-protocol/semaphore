/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import useIsBrowser from "@docusaurus/useIsBrowser"
import React from "react"
import { ToggleComponent } from "./ToggleComponent"

export default function Toggle(props) {
    const isBrowser = useIsBrowser()

    return <ToggleComponent disabled={!isBrowser} {...props} />
}
