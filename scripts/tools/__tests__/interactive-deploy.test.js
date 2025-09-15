import { main } from "../interactive-deploy.js";
import { execSync } from "child_process";
import inquirer from "inquirer";
import fs from "fs";

// Mock dependencies
jest.mock("child_process", () => ({
  execSync: jest.fn()
}));

jest.mock("inquirer", () => ({
  prompt: jest.fn()
}));

jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn()
}));

const mockConflictJson = {
  status: 0,
  result: {
    ignored: [],
    toDeploy: [
      {
        type: "Profile",
        fullName: "StandardAul",
        conflict: false,
        ignored: false,
        path: "force-app/main/default/profiles/StandardAul.profile-meta.xml",
        projectRelativePath:
          "force-app/main/default/profiles/StandardAul.profile-meta.xml",
        operation: "deploy"
      }
    ],
    toRetrieve: [],
    toDelete: [],
    conflicts: [
      {
        type: "Profile",
        fullName: "Admin",
        conflict: true,
        ignored: false,
        path: "force-app/main/default/profiles/Admin.profile-meta.xml",
        projectRelativePath:
          "force-app/main/default/profiles/Admin.profile-meta.xml",
        operation: "deploy"
      }
    ]
  },
  warnings: []
};

describe("interactive-deploy script - conflict scenarios", () => {
  let consoleLogSpy;
  let consoleWarnSpy;
  let processExitSpy;

  beforeEach(() => {
    jest.clearAllMocks();

    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit called with code ${code}`);
    });

    fs.existsSync.mockReturnValue(true);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it("should handle conflicts and proceed with --ignore-conflicts when user chooses to continue", async () => {
    execSync.mockReturnValueOnce(JSON.stringify(mockConflictJson));

    inquirer.prompt
      .mockResolvedValueOnce({ targetOrg: "test-org" })
      .mockResolvedValueOnce({ continueWithForce: true })
      .mockResolvedValueOnce({
        selectedItems: ["Profile:StandardAul", "Profile:Admin"]
      })
      .mockResolvedValueOnce({ saveToFile: false })
      .mockResolvedValueOnce({ confirmDeploy: true });

    await main();

    expect(execSync).toHaveBeenCalledWith(
      "sf project deploy start --metadata Profile:StandardAul Profile:Admin -o test-org --ignore-conflicts",
      { stdio: "inherit" }
    );
  });

  it("should exit when user chooses not to continue with conflicts", async () => {
    execSync.mockReturnValueOnce(JSON.stringify(mockConflictJson));

    inquirer.prompt
      .mockResolvedValueOnce({ targetOrg: "test-org" })
      .mockResolvedValueOnce({ continueWithForce: false });

    await expect(main()).rejects.toThrow("process.exit called with code 1");

    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "\nコンフリクトを解決してから、再度デプロイを試みてください。"
    );
  });
});
