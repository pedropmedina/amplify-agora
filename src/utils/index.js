const convertDollarsToCents = price => (price * 100).toFixed(0);

const convertCentsToDollars = price => (price / 100).toFixed(2);

export { convertDollarsToCents, convertCentsToDollars };
