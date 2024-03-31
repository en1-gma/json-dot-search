module.exports = {
  /**
   * 
   * @param {string} text 
   * @param {string} search 
   * @param {boolean} isAncestor 
   * @returns Line's number
   */
  getLineNumber: (text, search, isAncestor = false) => {
    let toRet;
    const splittedText = text.split('\n');

    for (let i = Number(isAncestor); i < splittedText.length; i++) {
      const line = splittedText[i];
      if (line.includes(`${search}\": ${isAncestor ? '{' : '\"'}`)) {
        toRet = i;
        break;
      }
    }
    return toRet;
  }
}
