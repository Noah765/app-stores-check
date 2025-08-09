{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = {nixpkgs, ...}: let
    inherit (nixpkgs) lib legacyPackages;
    forAllSystems = lib.genAttrs lib.systems.flakeExposed;
  in {
    devShells = forAllSystems (x: {default = legacyPackages.${x}.mkShell {packages = with legacyPackages.${x}; [nodejs prettier];};});
    formatter = forAllSystems (x: legacyPackages.${x}.alejandra);
  };
}
