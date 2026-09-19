import { create } from "zustand";

export const WORKSPACE_HEADER_RENAME_SOURCE_ID = "workspace-header";

export type WorkspaceRenamePlacement = "header" | "sidebar";

export interface WorkspaceRenameTarget {
  serverId: string;
  workspaceId: string;
  name: string;
  title?: string | null;
  initialValue: string;
  placement: WorkspaceRenamePlacement;
  sourceId: string;
}

export interface WorkspaceRenameIdentity {
  serverId: string;
  workspaceId: string;
  placement: WorkspaceRenamePlacement;
  sourceId: string;
}

export function matchesWorkspaceRenameTarget(
  target: WorkspaceRenameTarget | null,
  identity: WorkspaceRenameIdentity,
): target is WorkspaceRenameTarget {
  return (
    target !== null &&
    target.serverId === identity.serverId &&
    target.workspaceId === identity.workspaceId &&
    target.placement === identity.placement &&
    target.sourceId === identity.sourceId
  );
}

interface WorkspaceRenameStoreState {
  active: WorkspaceRenameTarget | null;
  start: (target: WorkspaceRenameTarget) => void;
  clear: (target: WorkspaceRenameTarget) => void;
}

export const useWorkspaceRenameStore = create<WorkspaceRenameStoreState>((set) => ({
  active: null,
  start: (target) => set({ active: target }),
  // The reference check prevents an older editor's cancel/save completion from closing a newer one.
  clear: (target) => set((state) => (state.active === target ? { active: null } : state)),
}));
