export function isNumeric(value: string): boolean {
    // parseFloat handles leading/trailing whitespace and decimal points
    const n = parseFloat(value);
    // isFinite guards against Infinity and NaN
    return !isNaN(n) && isFinite(n) && String(n) === value.trim();
}

export function isInteger(value: string): boolean {
    return isNumeric(value) && Number(value) % 1 === 0;
}

export function isFloat(value: string): boolean {
    return isNumeric(value) && Number(value) % 1 !== 0;
}

export function isPositiveInteger(value: string): boolean {
    return isInteger(value) && Number(value) > 0;
}

export function isPositiveFloat(value: string): boolean {
    return isFloat(value) && Number(value) > 0;
}


export function isNegativeInteger(value: string): boolean {
    return isInteger(value) && Number(value) < 0;
}

export function isNegativeFloat(value: string): boolean {
    return isFloat(value) && Number(value) < 0;
}

export function isZero(value: string): boolean {
    return isInteger(value) && Number(value) === 0;
}

export function isPositive(value: string): boolean {
    return isPositiveInteger(value) || isPositiveFloat(value);
}

export function isNegative(value: string): boolean {
    return isNegativeInteger(value) || isNegativeFloat(value);
}

export function isZeroOrPositive(value: string): boolean {
    return isZero(value) || isPositive(value);
}

export function isZeroOrNegative(value: string): boolean {
    return isZero(value) || isNegative(value);
}




