{ pkgs ? import <nixpkgs> {} }:

with pkgs;

stdenv.mkDerivation {
  name = "datasounds-build-env";

  buildInputs = [
    rsync
    nodejs
    nodePackages.grunt-cli
    nodePackages.bower
  ];
}
