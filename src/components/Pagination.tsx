import leftSvg from "../assets/left.svg";
import rightSvg from "../assets/right.svg";
import { Button } from "./Button";

type Props = {
    current: number;
    total: number;
    onNext: () => void;
    onPrevious: () => void;
}

export function Pagination({ current, total, onNext, onPrevious }: Props) {
    return (
        <div className="flex flex-1 justify-center items-center gap-3 font-sans">
            <Button variant="iconSmall" onClick={onPrevious} disabled={current === 1}>
                <img src={leftSvg} alt="voltar" className="w-4 h-4 brightness-75 hover:brightness-100 transition" />
            </Button>
            <span className="text-sm font-semibold text-[#6B7280]">
                <strong className="text-[#2D2D2D]">{current}</strong> / {total}
            </span>
            <Button variant="iconSmall" onClick={onNext} disabled={current === total}>
                <img src={rightSvg} alt="avançar" className="w-4 h-4 brightness-75 hover:brightness-100 transition" />
            </Button>
        </div>
    );
}