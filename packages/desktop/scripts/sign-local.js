const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const signingDir = path.join(os.homedir(), ".paseo", "signing");

function unlockLocalSigningIdentity() {
  const identity = JSON.parse(fs.readFileSync(path.join(signingDir, "identity.json"), "utf8"));
  const password = fs.readFileSync(path.join(signingDir, "keychain-password"), "utf8").trim();
  try {
    execFileSync("/usr/bin/security", ["unlock-keychain", "-p", password, identity.keychain], {
      stdio: "ignore",
    });
  } catch {
    throw new Error("Could not unlock the saved local signing identity");
  }
  process.env.CSC_KEYCHAIN = identity.keychain;
  return identity;
}

module.exports = { unlockLocalSigningIdentity };

// Re-sign an existing bundle after a local resource/ASAR update. codesign derives
// its designated requirement from the unchanged bundle ID and fixed certificate.
if (require.main === module) {
  const identity = unlockLocalSigningIdentity();
  execFileSync(
    "/usr/bin/codesign",
    [
      "--force",
      "--sign",
      identity.sha1,
      "--keychain",
      identity.keychain,
      "--timestamp=none",
      "--preserve-metadata=entitlements,flags",
      process.argv[2] || "/Applications/Paseo.app",
    ],
    { stdio: "inherit" },
  );
}
