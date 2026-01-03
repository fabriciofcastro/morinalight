/**
 * Command Pattern Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { CommandInvoker, type Command } from "../command-pattern";

describe("Command Pattern", () => {
    let invoker: CommandInvoker;

    beforeEach(() => {
        invoker = new CommandInvoker();
    });

    describe("CommandInvoker", () => {
        it("should execute a command", async () => {
            const mockCommand: Command<string> = {
                execute: vi.fn().mockResolvedValue("success"),
            };

            const result = await invoker.execute(mockCommand);

            expect(result).toBe("success");
            expect(mockCommand.execute).toHaveBeenCalledOnce();
        });

        it("should add command to history after execution", async () => {
            const mockCommand: Command = {
                execute: vi.fn().mockResolvedValue(undefined),
            };

            await invoker.execute(mockCommand);

            expect(invoker.canUndo()).toBe(true);
            expect(invoker.canRedo()).toBe(false);
        });

        it("should undo command", async () => {
            const mockCommand: Command = {
                execute: vi.fn().mockResolvedValue(undefined),
                undo: vi.fn().mockResolvedValue(undefined),
            };

            await invoker.execute(mockCommand);
            await invoker.undo();

            expect(mockCommand.undo).toHaveBeenCalledOnce();
            expect(invoker.canUndo()).toBe(false);
            expect(invoker.canRedo()).toBe(true);
        });

        it("should redo command", async () => {
            const mockCommand: Command = {
                execute: vi.fn().mockResolvedValue("result"),
                undo: vi.fn().mockResolvedValue(undefined),
                redo: vi.fn().mockResolvedValue("result"),
            };

            await invoker.execute(mockCommand);
            await invoker.undo();
            const result = await invoker.redo();

            expect(result).toBe("result");
            expect(mockCommand.redo).toHaveBeenCalledOnce();
        });

        it("should throw error when undoing with no history", async () => {
            await expect(invoker.undo()).rejects.toThrow("Nothing to undo");
        });

        it("should throw error when redoing with no future", async () => {
            await expect(invoker.redo()).rejects.toThrow("Nothing to redo");
        });

        it("should clear history after executing new command when at middle of history", async () => {
            const command1: Command = {
                execute: vi.fn().mockResolvedValue(undefined),
                undo: vi.fn().mockResolvedValue(undefined),
            };
            const command2: Command = {
                execute: vi.fn().mockResolvedValue(undefined),
                undo: vi.fn().mockResolvedValue(undefined),
            };
            const command3: Command = {
                execute: vi.fn().mockResolvedValue(undefined),
            };

            await invoker.execute(command1);
            await invoker.execute(command2);
            await invoker.undo(); // Back to command1
            await invoker.execute(command3); // Should clear command2 from history

            expect(invoker.canRedo()).toBe(false);
        });

        it("should get command history", async () => {
            const command1: Command = {
                execute: vi.fn().mockResolvedValue(undefined),
            };
            const command2: Command = {
                execute: vi.fn().mockResolvedValue(undefined),
            };

            await invoker.execute(command1);
            await invoker.execute(command2);

            const history = invoker.getHistory();

            expect(history.length).toBe(2);
            expect(history[0]).toBe(command1);
            expect(history[1]).toBe(command2);
        });

        it("should clear all history", async () => {
            const mockCommand: Command = {
                execute: vi.fn().mockResolvedValue(undefined),
            };

            await invoker.execute(mockCommand);
            invoker.clear();

            expect(invoker.canUndo()).toBe(false);
            expect(invoker.canRedo()).toBe(false);
            expect(invoker.getHistory().length).toBe(0);
        });
    });
});
