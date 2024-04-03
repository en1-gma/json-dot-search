const vscode = require('vscode');
const { getLineNumber, parse, getAboveDelta, jsonSanifier } = require('./utils');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const { activeTextEditor, showErrorMessage } = vscode.window;
  const { document, selection } = activeTextEditor;
  const { fileName, getText, lineAt, offsetAt } = document;

  // Global scope variable
  var activeSelection = selection.active.line;

  vscode.window.onDidChangeTextEditorSelection((event) => activeSelection = event.textEditor.selection.active.line);

  const commands = [
    vscode.commands.registerCommand('json-dot-search.search', async () => {

      const jsonSearch = await vscode.window.showInputBox({ placeHolder: 'Enter a JSON path to search for' });

      if (jsonSearch) {

        if (fileName.includes('.json')) {
          const text = getText();
          const json = JSON.parse(text);

          const notFoundEls = [];

          const [firstElement, ...path] = jsonSearch.split('.') || [jsonSearch];

          const searched = [firstElement];

          const keys = Object.keys(json);

          let res = json[firstElement];

          const aboveDelta = getAboveDelta(json, keys, keys.indexOf(firstElement));

          let rowNum = parse(aboveDelta).split('\n').length - 1;

          for (let i = 0; i < path.length; i++) {

            const toSearch = path[i];
            const el = res[toSearch];

            if (el) {

              rowNum += getLineNumber(parse(res), toSearch, i < path.length - 1);
              res = el;
              searched.push(toSearch);
            } else notFoundEls.push(toSearch);
          }

          if (notFoundEls.length) showErrorMessage(`${notFoundEls.join('.')} not found inside ${searched.join('.')}`);

          activeTextEditor.selection = new vscode.Selection(rowNum, 0, rowNum, lineAt(rowNum).text.length);
        } else showErrorMessage('No active .json file found.');
      }
    }),
    vscode.commands.registerCommand('json-dot-search.copyDotPath', () => {

      const text = getText();
      const aboveDelta = text.substring(0, offsetAt(new vscode.Position(activeSelection, activeSelection)));

      const safeJson = jsonSanifier(aboveDelta);

      const keys = Object.keys(safeJson);

      const firstPath = keys[keys.length - 1];

      let el = safeJson[firstPath];

      const path = [firstPath];

      while (typeof el === 'object') {

        const innerKeys = Object.keys(el);

        const indexPath = innerKeys[innerKeys.length - 1];

        path.push(indexPath);

        el = el[indexPath];
      }

      vscode.env.clipboard.writeText(path.join('.'));
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
