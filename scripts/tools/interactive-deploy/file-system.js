import fs from "fs";
import path from "path";

/**
 * コマンドをファイルに保存します。
 * @param {string} command - 保存するコマンド
 */
export async function saveCommandToFile(command) {
  const historyDir = path.join("scripts", "tools", "command_history");
  try {
    if (!fs.existsSync(historyDir)) {
      fs.mkdirSync(historyDir, { recursive: true });
    }

    const now = new Date();
    const timestamp =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0") +
      now.getHours().toString().padStart(2, "0") +
      now.getMinutes().toString().padStart(2, "0") +
      now.getSeconds().toString().padStart(2, "0");

    const fileName = `${timestamp}.sh`;
    const filePath = path.join(historyDir, fileName);
    const fileContent = `#!/bin/bash\n\n${command}`;

    fs.writeFileSync(filePath, fileContent);
    console.log(`\nコマンドが ${filePath} に保存されました。`);
  } catch (error) {
    console.error("\nコマンドのファイルへの保存に失敗しました:", error.message);
  }
}
