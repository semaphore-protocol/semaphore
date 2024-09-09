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
                <span />
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
                </button>
            ) : (
                <span />
            )}
        </div>
    )
}
