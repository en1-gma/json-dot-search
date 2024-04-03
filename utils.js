const jsonSanifier = (toSanify) => {
  let parsedJson;
  try {
    parsedJson = JSON.parse(toSanify);
  } catch (_) {

    if (toSanify.slice(-1) === ',') toSanify = toSanify.slice(0, -1);

    toSanify += '}';

    return jsonSanifier(toSanify);
  }
  return parsedJson;
}

module.exports = {
  getLineNumber: (sectorText, search, isAncestor = false) => {

    let toRet;

    const splittedSectorText = sectorText.split('\n');

    for (let i = Number(isAncestor); i < splittedSectorText.length; i++) {

      const line = splittedSectorText[i];

      if (line.includes(`\"${search}\": ${isAncestor ? '{' : '\"'}`)) {

        toRet = i;

        break;
      }
    }

    return toRet;
  },
  parse: (jsonObj) => JSON.stringify(jsonObj, null, " "),
  getAboveDelta: (json, keys, firstSectorIndex) => {

    const toRet = {};

    for (let i = 0; i < firstSectorIndex; i++) {

      const index = keys[i];
      toRet[index] = json[index];
    }

    return toRet;
  },
  getTrimmed: (lineAtObj) => lineAtObj.text.trim(),
  jsonSanifier,
}
