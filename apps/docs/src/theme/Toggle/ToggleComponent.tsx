/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/control-has-associated-label */
import IconMoon from "@site/src/components/icons/IconMoon"
import IconSun from "@site/src/components/icons/IconSun"
import clsx from "clsx"
import React, { memo, useRef, useState } from "react"
import styles from "./styles.module.scss" // Based on react-toggle (https://github.com/aaronshaf/react-toggle/).

export const ToggleComponent = memo(({ className, checked: defaultChecked, disabled, onChange }: any) => {
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
