export const FONT_FAMILY = {
  regular: 'Manrope-Regular',
  medium: 'Manrope-Medium',
  semibold: 'Manrope-SemiBold',
  bold: 'Manrope-Bold',
  extrabold: 'Manrope-ExtraBold',
  extralight: 'Manrope-ExtraLight',
};

export type FontKey = keyof typeof FONT_FAMILY;

export const typography = {
  regular: { fontFamily: FONT_FAMILY.regular },
  medium: { fontFamily: FONT_FAMILY.medium },
  semibold: { fontFamily: FONT_FAMILY.semibold },
  bold: { fontFamily: FONT_FAMILY.bold },
  extrabold: { fontFamily: FONT_FAMILY.extrabold },
  extralight: { fontFamily: FONT_FAMILY.extralight },
};

export const font = (key: FontKey) => ({ fontFamily: FONT_FAMILY[key] });