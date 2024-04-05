const vscode = require('vscode');
const {
  getAboveDelta,
  getLastJson,
  getLineNumber,
  jsonSanifier,
  parse,
} = require('./utils');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

  // Global scope variable
  var activeSelection = vscode.window.activeTextEditor.selection.active.line;

  vscode.window.onDidChangeTextEditorSelection((event) => activeSelection = event.textEditor.selection.active.line);

  let timeoutId;
  const commands = [
    vscode.commands.registerCommand('json-dot-search.search', async () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const {
          activeTextEditor,
          showErrorMessage,
          showInputBox,
        } = vscode.window;

        const { fileName, getText, lineAt } = activeTextEditor.document;

        if (fileName.includes('.json')) {

          const jsonSearch = await showInputBox({ placeHolder: 'Enter a JSON path to search for' });

          if (jsonSearch) {

            const text = getText();
            const json = JSON.parse(text);

            const notFoundEls = [];

            const keys = Object.keys(json);

            const [firstElement, ...path] = jsonSearch.split('.') || [jsonSearch];

            let res = json[firstElement];

            if (res) {

              const searched = [firstElement];

              const aboveDelta = getAboveDelta(json, keys, keys.indexOf(firstElement));

              let rowNum = parse(aboveDelta).split('\n').length - Number(!!Object.keys(aboveDelta).length); // subtracting 0 or 1

              for (let i = 0; i < path.length; i++) {

                const toSearch = path[i];
                const el = res[toSearch];

                if (el) {
                  rowNum += getLineNumber(parse(res), toSearch, typeof el === 'object');
                  res = el;
                  searched.push(toSearch);
                } else notFoundEls.push(toSearch);
              }
              console.log('rowNum', rowNum)
              if (notFoundEls.length) showErrorMessage(`${notFoundEls.join('.')} not found inside ${searched.join('.')}`);
              else activeTextEditor.selection = new vscode.Selection(rowNum, 0, rowNum, lineAt(rowNum).text.length);
            } else showErrorMessage(`${firstElement} not found inside the file.`);
          }
        } else showErrorMessage('No active .json file found.');
      }, 100);

    }),
    vscode.commands.registerCommand('json-dot-search.copyDotPath', async () => {

      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {

        const {
          activeTextEditor,
          showInformationMessage,
        } = vscode.window;

        const { getText, offsetAt } = activeTextEditor.document;

        const text = getText();

        const aboveDelta = text.substring(0, offsetAt(new vscode.Position(activeSelection + 1, 0)));

        const safeJson = jsonSanifier(aboveDelta.trim());
        const keys = Object.keys(safeJson);

        const firstPath = keys[keys.length - 1];

        const path = getLastJson(firstPath, safeJson).filter(Boolean);

        await vscode.env.clipboard.writeText(path.join('.'));

        showInformationMessage('Path successfully copied to clipboard!');
      }, 100);
    }),
  ];
  context.subscriptions.push(...commands);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}
