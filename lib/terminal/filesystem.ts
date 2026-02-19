import { siteConfig } from "@/config/site";
import type { FileSystemNode, FileSystem } from "./types";

function createFileSystemNode(
  name: string,
  type: "directory" | "file",
  path: string,
  children?: FileSystemNode[],
  content?: string | Record<string, unknown>
): FileSystemNode {
  return {
    name,
    type,
    path,
    children,
    content,
  };
}

function normalizePath(path: string): string {
  // Remove leading/trailing slashes and normalize
  return path.replace(/^\/+|\/+$/g, "") || "/";
}

function resolvePath(currentPath: string, targetPath: string): string {
  const current = normalizePath(currentPath);
  const target = normalizePath(targetPath);

  if (target.startsWith("/")) {
    return target;
  }

  if (current === "/") {
    return `/${target}`;
  }

  const parts = current.split("/").filter(Boolean);
  const targetParts = target.split("/").filter(Boolean);

  for (const part of targetParts) {
    if (part === "..") {
      parts.pop();
    } else if (part !== "." && part !== "") {
      parts.push(part);
    }
  }

  return `/${parts.join("/")}`;
}

function findNode(fs: FileSystem, path: string): FileSystemNode | null {
  const normalized = normalizePath(path);
  if (normalized === "/") {
    return fs.root;
  }

  const parts = normalized.split("/").filter(Boolean);
  let current: FileSystemNode | undefined = fs.root;

  for (const part of parts) {
    if (!current?.children) {
      return null;
    }
    current = current.children.find((child) => child.name === part);
    if (!current) {
      return null;
    }
  }

  return current || null;
}

export function createFileSystem(): FileSystem {
  const projects = siteConfig.projects.map((project) =>
    createFileSystemNode(
      project.name.toLowerCase().replace(/\s+/g, "-"),
      "file",
      `/projects/${project.name.toLowerCase().replace(/\s+/g, "-")}`,
      undefined,
      {
        name: project.name,
        summary: project.summary,
        role: project.role,
        stack: project.stack,
        link: project.link,
        usage: `  open ${project.name.toLowerCase().replace(/\s+/g, "-")} --site    Open project in a new tab`,
      }
    )
  );

  const capabilities = siteConfig.capabilities.map((capability) =>
    createFileSystemNode(
      capability.title.toLowerCase().replace(/\s+/g, "-"),
      "file",
      `/capabilities/${capability.title.toLowerCase().replace(/\s+/g, "-")}`,
      undefined,
      {
        title: capability.title,
        description: capability.description,
        icon: capability.icon,
      }
    )
  );

  const modes = siteConfig.modes.map((mode) =>
    createFileSystemNode(mode.key, "file", `/modes/${mode.key}`, undefined, {
      key: mode.key,
      label: mode.label,
      title: mode.title,
      description: mode.description,
      href: mode.href,
      icon: mode.icon,
      usage: `  open ${mode.key} --site    Open ${mode.label.toLowerCase()} in a new tab`,
    })
  );

  const root: FileSystemNode = createFileSystemNode("/", "directory", "/", [
    createFileSystemNode("about", "directory", "/about", [
      createFileSystemNode("info", "file", "/about/info", undefined, {
        owner: siteConfig.info.owner,
        siteName: siteConfig.info.siteName,
        focusAreas: siteConfig.info.focusAreas,
        description: siteConfig.info.description,
      }),
    ]),
    createFileSystemNode("projects", "directory", "/projects", projects),
    createFileSystemNode("contact", "directory", "/contact", [
      createFileSystemNode("info", "file", "/contact/info", undefined, {
        title: siteConfig.contact.title,
        description: siteConfig.contact.description,
        reasons: siteConfig.contact.reasons,
        email: siteConfig.contact.email,
        badge: siteConfig.contact.badge,
        usage: "  open contact/email    Start the interactive email composer\n  email                 Same as above (shortcut)\n  email --name \"Name\" --email \"you@example.com\" --body \"Message\"",
      }),
      createFileSystemNode("email", "file", "/contact/email", undefined, {
        type: "email_composer",
        description: "Send an email via the terminal",
        usage: "Type 'email' to start the email composer, or use: email --name \"Name\" --email \"email@example.com\" --body \"Message\"",
      }),
    ]),
    createFileSystemNode(
      "capabilities",
      "directory",
      "/capabilities",
      capabilities
    ),
    createFileSystemNode("modes", "directory", "/modes", modes),
  ]);

  return { root };
}

export function getFileSystem(): FileSystem {
  return createFileSystem();
}

export function listDirectory(
  fs: FileSystem,
  path: string
): FileSystemNode[] | null {
  const node = findNode(fs, path);
  if (!node) {
    return null;
  }
  if (node.type !== "directory") {
    return null;
  }
  return node.children || [];
}

export function resolveAbsolutePath(
  currentPath: string,
  targetPath: string
): string {
  return resolvePath(currentPath, targetPath);
}

export function pathExists(fs: FileSystem, path: string): boolean {
  return findNode(fs, path) !== null;
}

export function getNode(fs: FileSystem, path: string): FileSystemNode | null {
  return findNode(fs, path);
}
