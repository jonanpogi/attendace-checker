export const formatISODate = (
  isoDate: string,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
): string => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat(locale, options).format(date);
};
