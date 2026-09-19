import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getHostRuntimeStore } from "@/runtime/host-runtime";
import {
  matchesWorkspaceRenameTarget,
  useWorkspaceRenameStore,
  type WorkspaceRenameIdentity,
  type WorkspaceRenamePlacement,
} from "@/stores/workspace-rename-store";

export interface RenamableWorkspace {
  serverId: string;
  workspaceId: string;
  name: string;
  title?: string | null;
}

export interface WorkspaceRenameController {
  isRenaming: boolean;
  initialValue: string;
  open: () => void;
  cancel: () => void;
  submit: (value: string) => Promise<void>;
}

export function useWorkspaceRename(input: {
  workspace: RenamableWorkspace | null;
  placement: WorkspaceRenamePlacement;
  sourceId: string;
}): WorkspaceRenameController {
  const { workspace, placement, sourceId } = input;
  const { t } = useTranslation();
  const identity = useMemo<WorkspaceRenameIdentity | null>(
    () =>
      workspace
        ? {
            serverId: workspace.serverId,
            workspaceId: workspace.workspaceId,
            placement,
            sourceId,
          }
        : null,
    [placement, sourceId, workspace],
  );
  const activeTarget = useWorkspaceRenameStore(
    useCallback(
      (state) =>
        identity && matchesWorkspaceRenameTarget(state.active, identity) ? state.active : null,
      [identity],
    ),
  );
  const start = useWorkspaceRenameStore((state) => state.start);
  const clear = useWorkspaceRenameStore((state) => state.clear);

  const open = useCallback(() => {
    if (!workspace) {
      return;
    }
    start({
      ...workspace,
      placement,
      sourceId,
      initialValue: workspace.title ?? workspace.name,
    });
  }, [placement, sourceId, start, workspace]);

  const cancel = useCallback(() => {
    if (activeTarget) {
      clear(activeTarget);
    }
  }, [activeTarget, clear]);

  const submit = useCallback(
    async (value: string) => {
      const target = activeTarget;
      if (!target) {
        return;
      }
      const client = getHostRuntimeStore().getClient(target.serverId);
      if (!client) {
        throw new Error(t("sidebar.workspace.toasts.hostDisconnected"));
      }
      const title = value.trim();
      await client.setWorkspaceTitle(target.workspaceId, title.length === 0 ? null : title);
    },
    [activeTarget, t],
  );

  return useMemo(
    () => ({
      isRenaming: activeTarget !== null,
      initialValue: activeTarget?.initialValue ?? "",
      open,
      cancel,
      submit,
    }),
    [activeTarget, cancel, open, submit],
  );
}
