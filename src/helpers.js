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
  parseJSON,
};
