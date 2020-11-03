/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {
  ControllerHost,
  PropertyValues,
  UpdatingElement,
} from 'updating-element';
import {UpdatingController} from '../../controllers/updating-controller.js';
import {generateElementName} from '../test-helpers';
import {assert} from '@esm-bundle/chai';

// tslint:disable:no-any ok in tests

suite('UpdatingController', () => {
  let container: HTMLElement;

  class SimpleController extends UpdatingController {
    updateCount = 0;
    updatedCount = 0;
    connectedCount = 0;
    disconnectedCount = 0;
    updateChangedProperties: PropertyValues | null = null;
    updatedChangedProperties: PropertyValues | null = null;
    onConnected(host: ControllerHost) {
      this.connectedCount++;
      super.onConnected(host);
    }
    onDisconnected(host: ControllerHost) {
      this.disconnectedCount++;
      super.onDisconnected(host);
    }
    onUpdate(changedProperties: PropertyValues, host: ControllerHost) {
      this.updateCount++;
      this.updateChangedProperties = changedProperties;
      super.onUpdate(changedProperties, host);
    }
    onUpdated(changedProperties: PropertyValues, host: ControllerHost) {
      this.updatedCount++;
      this.updatedChangedProperties = changedProperties;
      super.onUpdated(changedProperties, host);
    }
  }

  class HostController extends SimpleController {
    nestedController = new SimpleController(this);
  }

  class A extends UpdatingElement {
    static properties = {foo: {}};
    foo = 'foo';
    updateCount = 0;
    updatedCount = 0;
    connectedCount = 0;
    disconnectedCount = 0;
    controller1 = new HostController(this);
    controller2 = new HostController(this);

    connectedCallback() {
      this.connectedCount++;
      super.connectedCallback();
    }

    disconnectedCallback() {
      this.disconnectedCount++;
      super.disconnectedCallback();
    }

    update(changedProperties: PropertyValues) {
      this.updateCount++;
      super.update(changedProperties);
    }

    updated(changedProperties: PropertyValues) {
      this.updatedCount++;
      super.updated(changedProperties);
    }
  }
  customElements.define(generateElementName(), A);
  let el!: A;

  setup(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    el = new A();
    container.appendChild(el);
    await el.updateComplete;
  });

  teardown(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  test('have host and element', async () => {
    assert.equal(el.controller1.host, el);
    assert.equal(el.controller1.element, el);
  });

  test('calls onConnected/onDisconnected', async () => {
    assert.equal(el.controller1.connectedCount, 1);
    assert.equal(el.controller2.connectedCount, 1);
    container.removeChild(el);
    assert.equal(el.controller1.disconnectedCount, 1);
    assert.equal(el.controller2.disconnectedCount, 1);
    container.appendChild(el);
    assert.equal(el.controller1.connectedCount, 2);
    assert.equal(el.controller2.connectedCount, 2);
  });

  test('calls onUpdate/onUpdated', async () => {
    let expectedChangedProperties: PropertyValues = new Map([
      ['foo', undefined],
    ]);
    assert.equal(el.controller1.updateCount, 1);
    assert.deepEqual(
      el.controller1.updateChangedProperties,
      expectedChangedProperties
    );
    assert.equal(el.controller1.updatedCount, 1);
    assert.deepEqual(
      el.controller1.updatedChangedProperties,
      expectedChangedProperties
    );
    assert.equal(el.controller2.updateCount, 1);
    assert.deepEqual(
      el.controller2.updateChangedProperties,
      expectedChangedProperties
    );
    assert.equal(el.controller2.updatedCount, 1);
    assert.deepEqual(
      el.controller2.updatedChangedProperties,
      expectedChangedProperties
    );
    el.foo = 'foo2';
    await el.updateComplete;
    expectedChangedProperties = new Map([['foo', 'foo']]);
    assert.equal(el.controller1.updateCount, 2);
    assert.deepEqual(
      el.controller1.updateChangedProperties,
      expectedChangedProperties
    );
    assert.equal(el.controller1.updatedCount, 2);
    assert.deepEqual(
      el.controller1.updatedChangedProperties,
      expectedChangedProperties
    );
    assert.equal(el.controller2.updateCount, 2);
    assert.deepEqual(
      el.controller2.updateChangedProperties,
      expectedChangedProperties
    );
    assert.equal(el.controller2.updatedCount, 2);
    assert.deepEqual(
      el.controller2.updatedChangedProperties,
      expectedChangedProperties
    );
  });

  test('requestUpdate causes element to requestUpdate', async () => {
    assert.equal(el.updateCount, 1);
    assert.equal(el.updatedCount, 1);
    el.controller1.requestUpdate();
    await el.updateComplete;
    assert.equal(el.updateCount, 2);
    assert.equal(el.updatedCount, 2);
    el.controller2.requestUpdate();
    await el.updateComplete;
    assert.equal(el.updateCount, 3);
    assert.equal(el.updatedCount, 3);
  });

  test('can be added/removed', async () => {
    // Remove
    el.removeController(el.controller1);
    el.foo = 'foo2';
    await el.updateComplete;
    assert.equal(el.controller1.updateCount, 1);
    assert.equal(el.controller1.connectedCount, 1);
    assert.equal(el.controller1.disconnectedCount, 1);
    el.controller1.requestUpdate();
    await el.updateComplete;
    assert.equal(el.updateCount, 2);
    assert.equal(el.controller1.updateCount, 1);
    // Add
    el.addController(el.controller1);
    assert.equal(el.controller1.connectedCount, 2);
    el.foo = 'foo3';
    await el.updateComplete;
    assert.equal(el.updateCount, 3);
    assert.equal(el.controller1.updateCount, 2);
    el.controller1.requestUpdate();
    await el.updateComplete;
    assert.equal(el.updateCount, 4);
    assert.equal(el.controller1.updateCount, 3);
  });

  suite('nested controllers', () => {
    test('have host and element', async () => {
      assert.equal(el.controller1.nestedController.host, el.controller1);
      assert.equal(el.controller1.nestedController.element, el);
    });

    test('calls onConnected/onDisconnected', async () => {
      assert.equal(el.controller1.connectedCount, 1);
      assert.equal(el.controller1.nestedController.connectedCount, 1);
      container.removeChild(el);
      assert.equal(el.controller1.disconnectedCount, 1);
      assert.equal(el.controller1.nestedController.disconnectedCount, 1);
      container.appendChild(el);
      assert.equal(el.controller1.connectedCount, 2);
      assert.equal(el.controller1.nestedController.connectedCount, 2);
    });

    test('calls onUpdate/onUpdated', async () => {
      let expectedChangedProperties: PropertyValues = new Map([
        ['foo', undefined],
      ]);
      assert.equal(el.controller1.updateCount, 1);
      assert.deepEqual(
        el.controller1.updateChangedProperties,
        expectedChangedProperties
      );
      assert.equal(el.controller1.updatedCount, 1);
      assert.deepEqual(
        el.controller1.updatedChangedProperties,
        expectedChangedProperties
      );
      assert.equal(el.controller1.nestedController.updateCount, 1);
      assert.deepEqual(
        el.controller1.nestedController.updateChangedProperties,
        expectedChangedProperties
      );
      assert.equal(el.controller1.nestedController.updatedCount, 1);
      assert.deepEqual(
        el.controller1.nestedController.updatedChangedProperties,
        expectedChangedProperties
      );
      el.foo = 'foo2';
      await el.updateComplete;
      expectedChangedProperties = new Map([['foo', 'foo']]);
      assert.equal(el.controller1.updateCount, 2);
      assert.deepEqual(
        el.controller1.updateChangedProperties,
        expectedChangedProperties
      );
      assert.equal(el.controller1.updatedCount, 2);
      assert.deepEqual(
        el.controller1.updatedChangedProperties,
        expectedChangedProperties
      );
      assert.equal(el.controller1.nestedController.updateCount, 2);
      assert.deepEqual(
        el.controller1.nestedController.updateChangedProperties,
        expectedChangedProperties
      );
      assert.equal(el.controller1.nestedController.updatedCount, 2);
      assert.deepEqual(
        el.controller1.nestedController.updatedChangedProperties,
        expectedChangedProperties
      );
    });

    test('requestUpdate causes element to requestUpdate', async () => {
      assert.equal(el.updateCount, 1);
      assert.equal(el.updatedCount, 1);
      el.controller1.nestedController.requestUpdate();
      await el.updateComplete;
      assert.equal(el.updateCount, 2);
      assert.equal(el.updatedCount, 2);
      el.controller2.nestedController.requestUpdate();
      await el.updateComplete;
      assert.equal(el.updateCount, 3);
      assert.equal(el.updatedCount, 3);
    });

    test('can be added/removed', async () => {
      // Remove
      el.controller1.removeController(el.controller1.nestedController);
      assert.equal(el.controller1.nestedController.connectedCount, 1);
      assert.equal(el.controller1.nestedController.disconnectedCount, 1);
      el.foo = 'foo2';
      await el.updateComplete;
      assert.equal(el.controller1.nestedController.updateCount, 1);
      el.controller1.nestedController.requestUpdate();
      await el.updateComplete;
      assert.equal(el.updateCount, 2);
      assert.equal(el.controller1.nestedController.updateCount, 1);
      // Add
      el.controller1.addController(el.controller1.nestedController);
      assert.equal(el.controller1.nestedController.connectedCount, 2);
      assert.equal(el.controller1.nestedController.disconnectedCount, 1);
      el.foo = 'foo3';
      await el.updateComplete;
      assert.equal(el.updateCount, 3);
      assert.equal(el.controller1.nestedController.updateCount, 2);
      el.controller1.nestedController.requestUpdate();
      await el.updateComplete;
      assert.equal(el.updateCount, 4);
      assert.equal(el.controller1.nestedController.updateCount, 3);
    });
  });
});
