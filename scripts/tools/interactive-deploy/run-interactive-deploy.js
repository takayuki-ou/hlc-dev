#!/usr/bin/env node

import { main } from './interactive-deploy.js';

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
