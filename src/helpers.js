export const addCommas = (nStr, currency = false) => {
  const x = String(nStr).split('.');

  let x1 = x[0];
  let x2 = x.length > 1 ? `.${x[1]}` : '';

  const rgx = /(\d+)(\d{3})/;

  while (rgx.test(x1)) {
    // eslint-disable-next-line no-useless-concat
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }

  if (x2 === '' && currency) x2 = '.00';

  return x1 + x2;
};

export const parseJSON = (json) => {
  try {
    const o = JSON.parse(json);

    if (o && typeof o === 'object') {
      return o;
    }
  } catch {
    return json;
  }

  return json;
};

export default {
  addCommas,
  parseJSON,
};
