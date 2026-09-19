import { useCallback, useState } from "react";
import { type QueryClient } from "@tanstack/react-query";
import type { DaemonClient } from "@getpaseo/client/internal/daemon-client";
import type { ListTerminalsResponse } from "@getpaseo/protocol/messages";
import { useTranslation } from "react-i18next";
import { useSessionStore } from "@/stores/session-store";
import type { WorkspaceTabDescriptor } from "@/screens/workspace/workspace-tabs-types";

export interface RenamingWorkspaceTab {
  kind: "terminal" | "agent";
  id: string;
  tabKey: string;
  currentTitle: string;
}

interface UseWorkspaceTabRenameInput {
  client: DaemonClient | null;
  normalizedServerId: string;
  queryClient: QueryClient;
  terminalsData: ListTerminalsResponse["payload"] | undefined;
  terminalsQueryKey: readonly unknown[];
}

interface UseWorkspaceTabRenameResult {
  renamingTab: RenamingWorkspaceTab | null;
  handleRenameTab: (tab: WorkspaceTabDescriptor) => void;
  handleRenameSubmit: (nextTitle: string) => Promise<void>;
  handleRenameCancel: () => void;
}

export function useWorkspaceTabRename(
  input: UseWorkspaceTabRenameInput,
): UseWorkspaceTabRenameResult {
  const { client, normalizedServerId, queryClient, terminalsData, terminalsQueryKey } = input;
  const { t } = useTranslation();
  const [renamingTab, setRenamingTab] = useState<RenamingWorkspaceTab | null>(null);

  const handleRenameTab = useCallback(
    (tab: WorkspaceTabDescriptor) => {
      if (tab.target.kind === "terminal") {
        const { terminalId } = tab.target;
        const terminal = terminalsData?.terminals.find((entry) => entry.id === terminalId) ?? null;
        const currentTitle = terminal?.title ?? terminal?.name ?? "";
        setRenamingTab({ kind: "terminal", id: terminalId, tabKey: tab.key, currentTitle });
        return;
      }
      if (tab.target.kind === "agent") {
        const { agentId } = tab.target;
        const agent =
          useSessionStore.getState().sessions[normalizedServerId]?.agents?.get(agentId) ?? null;
        const currentTitle = agent?.title ?? "";
        setRenamingTab({ kind: "agent", id: agentId, tabKey: tab.key, currentTitle });
      }
    },
    [normalizedServerId, terminalsData],
  );

  const handleRenameSubmit = useCallback(
    async (nextTitle: string) => {
      if (!renamingTab) return;
      const tabToRename = renamingTab;
      if (!client) {
        throw new Error(t("workspace.terminal.hostDisconnected"));
      }
      const trimmed = nextTitle.trim();
      if (tabToRename.kind === "terminal") {
        const result = await client.renameTerminal({
          terminalId: tabToRename.id,
          title: trimmed,
        });
        if (!result.success) {
          throw new Error(result.error ?? "Failed to rename terminal");
        }
        void queryClient.invalidateQueries({ queryKey: terminalsQueryKey });
        return;
      }
      await client.updateAgent(tabToRename.id, { name: trimmed });
      void queryClient.invalidateQueries({
        queryKey: ["sidebarAgentsList", normalizedServerId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["allAgents", normalizedServerId],
      });
    },
    [client, normalizedServerId, queryClient, renamingTab, terminalsQueryKey, t],
  );

  const handleRenameCancel = useCallback(() => {
    setRenamingTab((current) => (current === renamingTab ? null : current));
  }, [renamingTab]);

  return {
    renamingTab,
    handleRenameTab,
    handleRenameSubmit,
    handleRenameCancel,
  };
}
