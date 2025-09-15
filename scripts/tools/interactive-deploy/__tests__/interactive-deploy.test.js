import { main } from "../interactive-deploy.js";
import * as salesforce from "../salesforce.js";
import * as ui from "../ui.js";
import * as fileSystem from "../file-system.js";

jest.mock("../salesforce.js");
jest.mock("../ui.js");
jest.mock("../file-system.js");

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

describe("interactive-deploy script", () => {
  let consoleLogSpy;
  let consoleWarnSpy;
  let processExitSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    processExitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation((code) => {
        throw new Error(`process.exit called with code ${code}`);
      });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it("should deploy selected items with force flag when conflicts are approved", async () => {
    salesforce.getDeployPreview.mockReturnValue(mockConflictJson);
    ui.askForTargetOrg.mockResolvedValue("test-org");
    ui.confirmContinueWithConflicts.mockResolvedValue(true);
    ui.selectMetadata.mockResolvedValue([
      "Profile:StandardAul",
      "Profile:Admin"
    ]);
    salesforce.buildDeployCommand.mockReturnValue(
      "sf project deploy start --metadata Profile:StandardAul Profile:Admin -o test-org --ignore-conflicts"
    );
    ui.confirmSaveToFile.mockResolvedValue(false);
    ui.confirmDeploy.mockResolvedValue(true);

    await main();

    expect(salesforce.getDeployPreview).toHaveBeenCalledWith("test-org");
    expect(ui.confirmContinueWithConflicts).toHaveBeenCalledWith(
      mockConflictJson.result.conflicts
    );
    expect(ui.selectMetadata).toHaveBeenCalled();
    expect(salesforce.buildDeployCommand).toHaveBeenCalledWith(
      ["Profile:StandardAul", "Profile:Admin"],
      "test-org",
      true
    );
    expect(salesforce.runDeployCommand).toHaveBeenCalledWith(
      "sf project deploy start --metadata Profile:StandardAul Profile:Admin -o test-org --ignore-conflicts"
    );
    expect(fileSystem.saveCommandToFile).not.toHaveBeenCalled();
  });

  it("should exit if user does not approve conflicts", async () => {
    salesforce.getDeployPreview.mockReturnValue(mockConflictJson);
    ui.askForTargetOrg.mockResolvedValue("test-org");
    ui.confirmContinueWithConflicts.mockResolvedValue(false);

    await expect(main()).rejects.toThrow("process.exit called with code 1");

    expect(processExitSpy).toHaveBeenCalledWith(1);
    expect(salesforce.runDeployCommand).not.toHaveBeenCalled();
  });

  it("should save command to file if user confirms", async () => {
    const noConflictJson = {
      ...mockConflictJson,
      result: { ...mockConflictJson.result, conflicts: [] }
    };
    salesforce.getDeployPreview.mockReturnValue(noConflictJson);
    ui.askForTargetOrg.mockResolvedValue("test-org");
    ui.selectMetadata.mockResolvedValue(["Profile:StandardAul"]);
    salesforce.buildDeployCommand.mockReturnValue(
      "sf project deploy start --metadata Profile:StandardAul -o test-org"
    );
    ui.confirmSaveToFile.mockResolvedValue(true);
    ui.confirmDeploy.mockResolvedValue(true);

    await main();

    expect(fileSystem.saveCommandToFile).toHaveBeenCalledWith(
      "sf project deploy start --metadata Profile:StandardAul -o test-org"
    );
  });

  it("should not deploy if user does not confirm", async () => {
    salesforce.getDeployPreview.mockReturnValue(mockConflictJson);
    ui.askForTargetOrg.mockResolvedValue("test-org");
    ui.confirmContinueWithConflicts.mockResolvedValue(true);
    ui.selectMetadata.mockResolvedValue(["Profile:StandardAul"]);
    ui.confirmSaveToFile.mockResolvedValue(false);
    ui.confirmDeploy.mockResolvedValue(false);

    await main();

    expect(salesforce.runDeployCommand).not.toHaveBeenCalled();
  });
});
