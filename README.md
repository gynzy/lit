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

In `rollup-common.js` the `mangle` option in `generateTerserOptions` is disabled. This is required for Gynzy build process in [external-board-tools](https://github.com/gynzy/external-board-tools/). 

In external-board-tools there's a package [base-tool](https://github.com/gynzy/external-board-tools/) which contains generic functionality for tools. During build every tool is split such that generic functionality is imported from base-tool. In order to make this happen it is important that names are not mangled, which was the default for lit-element 1 (when the plan was devised and executed), but not for lit 2.

### Scoped package names

All package names are scoped such that they can be published to the private Gynzy repository.

| Original name         | Fork name                   |
|-----------------------|-----------------------------|
| lit                   | @gynzy/lit                  |
| lit-element           | @gynzy/lit-element          |
| lit-html              | @gynzy/lit-html             |
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
6. Publish each package to the private npm repository. The `@gynzy`-scope ensures that the package is published to the private Gynzy repository.
     
	 1. Go to each package folder
	      
		  1. `packages/lit`
		  2. `packages/lit-element`
		  3. `packages/lit-html`
		  4. `packages/reactive-element`

	 2. Run `npm publish` in each package folder to publish to the repository.
