/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import useIsBrowser from "@docusaurus/useIsBrowser"
import IconMoon from "@site/src/components/icons/IconMoon"
import IconSun from "@site/src/components/icons/IconSun"
import clsx from "clsx"
import React, { memo, useRef, useState } from "react"
import styles from "./styles.module.scss" // Based on react-toggle (https://github.com/aaronshaf/react-toggle/).

const ToggleComponent = memo(({ className, switchConfig, checked: defaultChecked, disabled, onChange }) => {
    const [checked, setChecked] = useState(defaultChecked)
    const [focused, setFocused] = useState(false)
    const inputRef = useRef(null)
    return (
        <div
            className={clsx(styles.toggle, className, {
                [styles.toggleChecked]: checked,
                [styles.toggleFocused]: focused,
                [styles.toggleDisabled]: disabled
            })}
        >
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
            <div className={styles.toggleTrack} role="button" tabIndex={-1} onClick={() => inputRef.current?.click()}>
                <div className={styles.toggleTrackCheck}>
                    <span className={styles.toggleIcon}>
                        <IconMoon />
                    </span>
                </div>
                <div className={styles.toggleTrackX}>
                    <span className={styles.toggleIcon}>
                        <IconSun />
                    </span>
                </div>
                <div className={styles.toggleTrackThumb} />
            </div>

            <input
                ref={inputRef}
                checked={checked}
                type="checkbox"
                className={styles.toggleScreenReader}
                aria-label="Switch between dark and light mode"
                onChange={onChange}
                onClick={() => setChecked(!checked)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        inputRef.current?.click()
                    }
                }}
            />
        </div>
    )
})
export default function Toggle(props) {
    const isBrowser = useIsBrowser()

    return <ToggleComponent disabled={!isBrowser} {...props} />
}
