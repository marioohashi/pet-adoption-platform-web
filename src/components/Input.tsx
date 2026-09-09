import type React from "react";

type Props = React.ComponentProps<"input"> & {
    legend?: string
}

export function Input({ legend, type = "text", ...rest }: Props) {
    return (
        <fieldset className="flex flex1 max-h-20 focus-within:text-green-100">
            {legend && (
                <legend className="uppercase text-xxs text-gray-200 mb-2 text-inherit">
                    {legend}
                </legend>
            )}
            <input type={type} {...rest} />
        </fieldset>
    )
}