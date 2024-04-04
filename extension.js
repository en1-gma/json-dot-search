const vscode = require('vscode');
const {
  adaptJsonDepth,
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
  const {
    activeTextEditor,
    showErrorMessage,
    showInformationMessage,
    showInputBox,
  } = vscode.window;
  const { document, selection } = activeTextEditor;
  const { fileName, getText, lineAt, offsetAt } = document;

  // Global scope variable
  var activeSelection = selection.active.line;

  vscode.window.onDidChangeTextEditorSelection((event) => activeSelection = event.textEditor.selection.active.line);

  let timeoutId;
  const commands = [
    vscode.commands.registerCommand('json-dot-search.search', async () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        if (fileName.includes('.json')) {

          const jsonSearch = await showInputBox({ placeHolder: 'Enter a JSON path to search for' });

          if (jsonSearch) {

            const text = getText();
            const json = JSON.parse(text);

            const notFoundEls = [];

            const keys = Object.keys(json);

            const [firstElement, ...path] = jsonSearch.split('.') || [jsonSearch];

            let res = json[firstElement];

            const searched = [firstElement];

            const aboveDelta = getAboveDelta(json, keys, keys.indexOf(firstElement));

            let rowNum = parse(aboveDelta).split('\n').length;
            for (let i = 0; i < path.length; i++) {

              const toSearch = path[i];
              const el = res[toSearch];

              if (el) {
                rowNum += getLineNumber(parse(res), toSearch, typeof el === 'object');
                res = el;
                searched.push(toSearch);
              } else notFoundEls.push(toSearch);
            }

            if (notFoundEls.length) showErrorMessage(`${notFoundEls.join('.')} not found inside ${searched.join('.')}`);
            else activeTextEditor.selection = new vscode.Selection(rowNum, 0, rowNum, lineAt(rowNum).text.length);
          }
        } else showErrorMessage('No active .json file found.');
      }, 100);

    }),
    vscode.commands.registerCommand('json-dot-search.copyDotPath', async () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const text = getText();

        const aboveDelta = text.substring(0, offsetAt(new vscode.Position(activeSelection, activeSelection)));

        const safeJson = jsonSanifier(aboveDelta);

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
