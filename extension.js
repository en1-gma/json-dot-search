const vscode = require('vscode');
const { getLineNumber } = require('./utils');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

  let disposable = vscode.commands.registerCommand('json-dot-search.search', async function () {

    const jsonSearch = await vscode.window.showInputBox({
      placeHolder: 'Enter a JSON path to search for',
    });

    if (jsonSearch) {
      const { activeTextEditor, showErrorMessage, } = vscode.window;
      const { document } = activeTextEditor || {};
      const { fileName, getText, } = document || {};

      if (fileName.includes('.json')) {
        const text = getText();
        const json = JSON.parse(text);

        const [firstElement, ...path] = jsonSearch.split('.') || [jsonSearch];

        let rowNum = getLineNumber(text, firstElement, true);

        let res = json[firstElement];

        for (let i = 0; i < path.length; i++) {
          const el = res[path[i]];

          if (el) {
            rowNum += getLineNumber(JSON.stringify(res, null, " "), path[i], i < path.length - 1);
            res = el;
          }
        }

        activeTextEditor.selection = new vscode.Selection(rowNum, 0, rowNum, document.lineAt(rowNum).text.length);

      } else showErrorMessage('No active .json file found.');
    }
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}
