"use client"

export type StepperProps = {
    step: number
    onPrevClick?: () => void
    onNextClick?: () => void
}

export default function Stepper({ step, onPrevClick, onNextClick }: StepperProps) {
    return (
        <div className="stepper">
            {onPrevClick !== undefined ? (
                <button
                    className="button-stepper"
                    disabled={!onPrevClick}
                    onClick={onPrevClick || undefined}
                    type="button"
                >
                    Prev
                </button>
            ) : (
                <button className="button-stepper"></button>
            )}

            <p>{step.toString()}/3</p>

            {onNextClick !== undefined ? (
                <button
                    className="button-stepper"
                    disabled={!onNextClick}
                    onClick={onNextClick || undefined}
                    type="button"
                >
                    Next
                    <span className="icon-next">
                        <svg viewBox="0 0 24 24" focusable="false">
                            <path
                                fill="currentColor"
                                d="M10.5859 6.34317L12.0001 4.92896L19.0712 12L12.0001 19.0711L10.5859 17.6569L16.2428 12L10.5859 6.34317Z"
                            ></path>
                        </svg>
                    </span>
                </button>
            ) : (
                <span />
            )}
        </div>
    )
}
