# Lit fork

This is a Lit Monorepo fork.

Original repository: https://github.com/lit/lit.

## Usage

This fork can replace `lit` in a project by installing it as an alias:

```sh
yarn add lit@npm:@gynzy/lit
```

## Changes

This fork has three (non-functional) changes compared to the original packages:

### No mangling of (export) names

In `rollup-common.js` the `mangle` option in `generateTerserOptions` is disabled. This is required for Gynzy build processes in projects that use `lit`. 

### Scoped package names

All package names are scoped such that they can be published to the private Gynzy repository.

| Original name         | Fork name                   |
|-----------------------|-----------------------------|
| lit                   |  @gynzy/lit                 |
| lit-element           |  @gynzy/lit-element         |
| lit-html              |  @gynzy/lit-html            |
| @lit/reactive-element | @gynzy/lit-reactive-element |

### Scoped dependencies

Some packages depend on each other (e.g. `lit-element` depends on `@lit/reactive-element` and `lit-html`). This fork overrides these dependencies with versions from the fork.

## Releasing a new version

### Automatically

At the moment no CI exists. For now, the manual steps can be used.

### Manually

1. Use node 16.x.
2. Checkout the tag of the latest release.
3. Install all packages using `npm ci`.
4. Ensure the required patches are applied / have no conflict.
5. Build all packages using `npm run build`.
6. Publish the packages to the private npm repository: `npm publish`. The `@gynzy`-scope ensures that the package is published to the private Gynzy repository.
