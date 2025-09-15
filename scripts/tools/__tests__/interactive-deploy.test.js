import { main } from '../interactive-deploy.js';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import fs from 'fs';

// Mock dependencies
jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

// A realistic mock of the JSON output for a conflict scenario,
// based on the user's provided file paths.
const mockConflictJson = {
  status: 0,
  result: {
    files: [],
    conflicts: [
      {
        state: "Conflict",
        fullName: "MyController",
        type: "ApexClass",
        filePath: "force-app/main/default/classes/MyController.cls",
      },
      {
        state: "Conflict",
        fullName: "myApp",
        type: "LightningComponentBundle",
        filePath: "force-app/main/default/lwc/myApp/myApp.html",
      }
    ]
  },
  warnings: []
};

describe('interactive-deploy script', () => {
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(() => {
    // Reset mocks and spies before each test
    jest.clearAllMocks();

    // Spy on console.error and process.exit
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
        throw new Error(`process.exit called with code ${code}`);
    });
  });

  afterEach(() => {
    // Restore original functions
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  it('should detect conflicts, log them, and exit with status 1', async () => {
    // Arrange: Setup mocks for the conflict scenario
    inquirer.prompt.mockResolvedValueOnce({ targetOrg: 'my-test-org' });
    execSync.mockReturnValue(JSON.stringify(mockConflictJson));

    // Act & Assert: Expect main() to throw an error because process.exit is mocked to throw
    await expect(main()).rejects.toThrow('process.exit called with code 1');

    // Assert: Check that the correct messages were logged and the process exited
    expect(execSync).toHaveBeenCalledWith('sf project deploy preview --json -o my-test-org', { encoding: 'utf8' });
    expect(consoleErrorSpy).toHaveBeenCalledWith('\nデプロイプレビューでコンフリクトが検出されました。');
    expect(consoleErrorSpy).toHaveBeenCalledWith('以下のコンポーネントを解決してください:');
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Conflict: ApexClass:MyController'));
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Conflict: LightningComponentBundle:myApp'));
    expect(consoleErrorSpy).toHaveBeenCalledWith('\nコンフリクトを解決してから、再度デプロイを試みてください。');
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
