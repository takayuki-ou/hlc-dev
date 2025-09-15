import inquirer from "inquirer";

/**
 * デプロイ先の組織をユーザーに問い合わせます。
 * @returns {Promise<string>} 選択された組織
 */
export async function askForTargetOrg() {
  const { targetOrg } = await inquirer.prompt([
    {
      type: "input",
      name: "targetOrg",
      message: "デプロイ先の組織を指定してください (空白の場合はデフォルト組織):"
    }
  ]);
  return targetOrg;
}

/**
 * コンフリクトがある場合に、ユーザーにデプロイを続行するかどうかを確認します。
 * @param {object[]} conflicts - コンフリクトのリスト
 * @returns {Promise<boolean>} 続行するかどうか
 */
export async function confirmContinueWithConflicts(conflicts) {
  console.warn("以下のコンポーネントでコンフリクトが発生しています:");
  conflicts.forEach((conflict) => {
    console.warn(
      `- ${conflict.type}:${conflict.fullName}\n  ${conflict.path}`
    );
  });

  const { continueWithForce } = await inquirer.prompt([
    {
      type: "confirm",
      name: "continueWithForce",
      message: "デプロイ対象の選択に進みますか？",
      default: false
    }
  ]);
  return continueWithForce;
}

/**
 * デプロイするメタデータをユーザーに選択させます。
 * @param {object[]} componentsToDeploy - デプロイ可能なコンポーネントのリスト
 * @param {object[]} conflicts - コンフリクトのあるコンポーネントのリスト
 * @returns {Promise<string[]>} 選択されたメタデータのリスト
 */
export async function selectMetadata(componentsToDeploy, conflicts) {
  const choices = componentsToDeploy.map((item) => ({
    name: `${item.type}:${item.fullName}`,
    value: `${item.type}:${item.fullName}`,
    checked: false
  }));
  if (conflicts?.length > 0) {
    conflicts.forEach((conflict) => {
      choices.push({
        name: `${conflict.type}:${conflict.fullName} (コンフリクト)`,
        value: `${conflict.type}:${conflict.fullName}`,
        checked: false
      });
    });
  }

  const { selectedItems } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedItems",
      message: "デプロイするメタデータを選択してください:",
      choices: choices,
      loop: false,
      validate: (answer) => {
        if (answer.length < 1) {
          return "少なくとも1つのアイテムを選択してください";
        }
        return true;
      }
    }
  ]);
  return selectedItems;
}

/**
 * コマンドをファイルに保存するかどうかをユーザーに確認します。
 * @returns {Promise<boolean>} 保存するかどうか
 */
export async function confirmSaveToFile() {
  const { saveToFile } = await inquirer.prompt([
    {
      type: "confirm",
      name: "saveToFile",
      message: "このコマンドをファイルに保存しますか?",
      default: false
    }
  ]);
  return saveToFile;
}

/**
 * デプロイを実行するかどうかをユーザーに確認します。
 * @returns {Promise<boolean>} 実行するかどうか
 */
export async function confirmDeploy() {
  const { confirmDeploy } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmDeploy",
      message: "このコマンドを実行しますか?",
      default: true
    }
  ]);
  return confirmDeploy;
}
