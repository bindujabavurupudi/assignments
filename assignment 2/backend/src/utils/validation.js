function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parsePositiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

function parseNonNegativeInteger(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    return NaN;
  }
  return number;
}

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

module.exports = {
  isNonEmptyString,
  parsePositiveNumber,
  parseNonNegativeInteger,
  createError,
};
