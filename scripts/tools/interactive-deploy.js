#!/usr/bin/env node

const inquirer = require("inquirer");
const { execSync } = require("child_process");

async function main() {
  try {
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

    let deployResult;
    try {
      // デプロイコマンドを実行してJSONを取得
      const deployCommand = `sf project deploy preview --json -o ${targetOrg}`;
      const deployOutput = execSync(deployCommand, { encoding: "utf8" });
      deployResult = JSON.parse(deployOutput);
    } catch (error) {
      // execSyncがエラーを投げた場合、stderrからJSONを取得
      try {
        const errorOutput = error.stderr || error.stdout || error.message;
        deployResult = JSON.parse(errorOutput);
      } catch (parseError) {
        console.error("デプロイコマンドの実行に失敗しました:", error.message);
        process.exit(1);
      }
    }

    // エラーレスポンスの処理
    if (deployResult.status !== 0 || deployResult.exitCode !== undefined) {
      console.error(`\nエラー: ${deployResult.name || "Unknown Error"}`);
      console.error(
        `メッセージ: ${deployResult.message || "No message provided"}`
      );
      process.exit(deployResult.exitCode || 1);
    }

    const toDeploy = deployResult.result.toDeploy;

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

    if (selectedItems.length === 0) {
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
      execSync(finalCommand, { stdio: "inherit" });
    } else {
      console.log("デプロイをキャンセルしました。");
    }
  } catch (error) {
    console.error("エラーが発生しました:", error.message);
    process.exit(1);
  }
}

main();
