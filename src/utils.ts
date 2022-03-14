import countries from './countries';

export type Country = typeof countries[number];

export const getCountryByIso = (code: Country[2]) =>
  countries.find((c) => c[2] === code) as Country;

export const removeMask = (value: string) => value.replace(/\D/g, '');

export const applyMask = (value = '', mask?: string) => {
  if (!mask || !value) return value;

  const flatValue = removeMask(value);
  let formattedValue = '';
  const splittedMask = mask.split('');
  for (const m in splittedMask) {
    const intCount = (formattedValue.match(/\d/g) || []).length;

    if (flatValue[intCount] == null) continue;

    if (splittedMask[m] === '.') formattedValue += flatValue[intCount];
    else formattedValue += splittedMask[m];
  }

  return formattedValue;
};

export const isE164Compliant = (value: string) =>
  /^\+[1-9]\d{1,14}$/.test(value);

export interface PhoneNumber {
  raw: string;
  formatted: string;
  country: Country;
}

export const splitPhoneNumber = (value: string): PhoneNumber => {
  if (!isE164Compliant(value))
    throw new Error('[react-telephone] phone number should follow E.164');

  const dial = removeMask(value).substring(0, 6);

  // search by iso2 country code and area
  const [country] = countries.filter(
    (c) =>
      dial.startsWith(c[3]) &&
      (c[6] ? c[6].some((a) => dial.startsWith(`${c[3]}${a}`)) : true)
  );

  return {
    raw: value,
    country: country,
    formatted: applyMask(replaceDialCode(value, country[3], ''), country[4]),
  };
};

export const replaceDialCode = (
  value: string,
  dialCode: string,
  replacer: string
) => value.replace('+' + dialCode, replacer);