import { Transform } from 'class-transformer';

/**
 * Transforms incoming strings to lowercase
 */
export function ToLowerCase() {
  return Transform(({ value }) => {
    if (value && typeof value === 'string') {
      return value.toLowerCase();
    }
    return value;
  });
}

/**
 * Transforms incoming strings to uppercase
 */
export function ToUpperCase() {
  return Transform(({ value }) => {
    if (value && typeof value === 'string') {
      return value.toUpperCase();
    }
    return value;
  });
}

/**
 * Removes whitespace from the beginning and end of a string
 */
export function Trim() {
  return Transform(({ value }) => {
    if (value && typeof value === 'string') {
      return value.trim();
    }
    return value;
  });
}

/**
 * Converts string to a boolean
 */
export function ToBoolean() {
  return Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') {
      return true;
    }
    if (value === 'false' || value === false || value === 0 || value === '0') {
      return false;
    }
    return value;
  });
}

/**
 * Converts string to a number
 */
export function ToNumber() {
  return Transform(({ value }) => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    return Number(value);
  });
}