export type StepperProps = {
    step: number
    onPrevClick?: () => void
    onNextClick?: () => void
}

export default function Stepper({ step, onPrevClick, onNextClick }: StepperProps) {
    return (
        <div className="stepper">
            {onPrevClick !== undefined ? (
                <button className="button-stepper" disabled={!onPrevClick} onClick={onPrevClick || undefined}>
                    Prev
                </button>
            ) : (
                <span></span>
            )}

            <p>{step.toString()}/3</p>

            {onNextClick !== undefined ? (
                <button className="button-stepper" disabled={!onNextClick} onClick={onNextClick || undefined}>
                    Next
                </button>
            ) : (
                <span></span>
            )}
        </div>
    )
}
