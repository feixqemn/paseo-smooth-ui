import { useCallback, useEffect, useRef } from "react";
import { useKeyboardActionHandler } from "@/hooks/use-keyboard-action-handler";
import type { KeyboardActionId } from "@/keyboard/keyboard-action-dispatcher";
import { useActiveWorkspaceSelection } from "@/stores/navigation-active-workspace-store";
import { useWorkspaceFields } from "@/stores/session-store-hooks";
import {
  WORKSPACE_HEADER_RENAME_SOURCE_ID,
  useWorkspaceRenameStore,
} from "@/stores/workspace-rename-store";

const WORKSPACE_RENAME_ACTIONS: readonly KeyboardActionId[] = ["workspace.rename"];

/** Global commands edit the active workspace header, even when its sidebar row is hidden. */
export function WorkspaceRenameHost() {
  const selection = useActiveWorkspaceSelection();
  const serverId = selection?.serverId ?? null;
  const routeWorkspaceId = selection?.workspaceId ?? null;
  const fields = useWorkspaceFields(serverId, routeWorkspaceId, (workspace) => ({
    id: workspace.id,
    name: workspace.name,
    title: workspace.title ?? null,
  }));
  const start = useWorkspaceRenameStore((state) => state.start);
  const openFrameRef = useRef<number | null>(null);

  const cancelPendingOpen = useCallback(() => {
    if (openFrameRef.current !== null) {
      cancelAnimationFrame(openFrameRef.current);
      openFrameRef.current = null;
    }
  }, []);

  const workspaceId = fields?.id ?? null;
  useEffect(
    () => () => {
      cancelPendingOpen();
      const { active, clear } = useWorkspaceRenameStore.getState();
      if (
        active?.placement === "header" &&
        active.serverId === serverId &&
        active.workspaceId === workspaceId
      ) {
        clear(active);
      }
    },
    [cancelPendingOpen, serverId, workspaceId],
  );

  const handle = useCallback(() => {
    if (!serverId || !fields) return false;
    cancelPendingOpen();
    // Let command-center teardown finish before the inline input claims focus.
    openFrameRef.current = requestAnimationFrame(() => {
      openFrameRef.current = null;
      start({
        serverId,
        workspaceId: fields.id,
        name: fields.name,
        title: fields.title,
        initialValue: fields.title ?? fields.name,
        placement: "header",
        sourceId: WORKSPACE_HEADER_RENAME_SOURCE_ID,
      });
    });
    return true;
  }, [cancelPendingOpen, fields, serverId, start]);

  useKeyboardActionHandler({
    handlerId: "workspace-rename-global",
    actions: WORKSPACE_RENAME_ACTIONS,
    enabled: serverId !== null && fields !== null,
    priority: 0,
    handle,
  });

  return null;
}
