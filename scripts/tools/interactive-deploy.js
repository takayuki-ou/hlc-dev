#!/usr/bin/env node

const inquirer = require("inquirer");
const { execSync } = require("child_process");

/**
 * sfコマンドのプレビュー結果を取得します。
 * コマンドが失敗した場合でも、出力をJSONとして解析しようと試みます。
 * @param {string} targetOrg - 対象の組織
 * @returns {object} - デプロイプレビューのJSON結果
 * @throws {Error} - コマンド実行またはJSON解析に失敗した場合
 */
function getDeployPreview(targetOrg) {
  const deployCommand = `sf project deploy preview --json -o ${targetOrg}`;
  try {
    const deployOutput = execSync(deployCommand, { encoding: "utf8" });
    return JSON.parse(deployOutput);
  } catch (error) {
    // コマンドが失敗した場合でも、sfコマンドはJSONをstdoutやstderrに出力することがある
    const output = error.stdout || error.stderr;
    try {
      // 空の出力の場合、エラーメッセージから情報を取得する
      if (!output) {
        throw new Error(error.message);
      }
      return JSON.parse(output);
    } catch (parseError) {
      // JSONのパースに失敗した場合、より詳細なエラーをスローする
      const errorMessage = `デプロイプレビューの実行、または結果の解析に失敗しました。

[sf command]
${deployCommand}

[Error]
${error.message}

[Output]
${output}`;
      throw new Error(errorMessage);
    }
  }
}

async function main() {
  // 組織の指定を最初に受け取る
  const { targetOrg } = await inquirer.prompt([
    {
      type: "input",
      name: "targetOrg",
      message: "デプロイ先の組織を指定してください:",
      validate: (input) => {
        if (!input.trim()) {
          return "組織名を入力してください";
        }
        return true;
      }
    }
  ]);

  console.log("\nデプロイ対象を取得中...");
  const deployResult = getDeployPreview(targetOrg);

  // エラーレスポンスの処理
  if (deployResult.status !== 0) {
    const errorDetails = `
エラー: ${deployResult.name || "Unknown Error"}
メッセージ: ${deployResult.message || "No message provided"}
終了コード: ${deployResult.exitCode || "N/A"}`;
    throw new Error(`デプロイプレビューでエラーが返されました。${errorDetails}`);
  }

  const toDeploy = deployResult.result?.toDeploy;

  if (!toDeploy || toDeploy.length === 0) {
    console.log("デプロイ対象のファイルがありません。");
    return;
  }

  // チェックボックス用の選択肢を作成
  const choices = toDeploy.map((item) => ({
    name: `${item.type}:${item.fullName}`,
    value: `${item.type}:${item.fullName}`,
    checked: false
  }));

  // 対話的に選択
  const { selectedItems } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedItems",
      message: "デプロイするメタデータを選択してください:",
      choices: choices,
      validate: (answer) => {
        if (answer.length < 1) {
          return "少なくとも1つのアイテムを選択してください";
        }
        return true;
      }
    }
  ]);

  if (!selectedItems || selectedItems.length === 0) {
    console.log("何も選択されませんでした。処理を終了します。");
    return;
  }

  // 選択されたアイテムをスペース区切りで結合
  const metadataString = selectedItems.join(" ");

  // 最終的なデプロイコマンドを構築
  const finalCommand = `sf project deploy start --metadata ${metadataString} -o ${targetOrg}`;

  console.log("\n実行するコマンド:");
  console.log(finalCommand);

  // 実行確認
  const { confirmDeploy } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmDeploy",
      message: "このコマンドを実行しますか?",
      default: false
    }
  ]);

  if (confirmDeploy) {
    console.log("\nデプロイを実行中...");
    // 最終的なデプロイコマンドは、成功・失敗がストリームでわかるようにstdioをinheritする
    execSync(finalCommand, { stdio: "inherit" });
    console.log("\nデプロイが完了しました。");
  } else {
    console.log("デプロイをキャンセルしました。");
  }
}

main().catch((error) => {
  // inquirerがCtrl+Cでキャンセルされるとエラーをスローするが、メッセージは不要
  if (error.isTtyError) {
    console.log("\n処理が中断されました。");
  } else {
    console.error("\n[エラー発生]");
    console.error(error.message);
  }
  process.exit(1);
});
