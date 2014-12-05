(function () {
  'use strict';

  function isUnregisteredCustomElement(el) {
    if (el.constructor === HTMLElement) {
      console.error('Found unregistered custom element:', el);
    }
  }

  function isCustomEl(el) {
    return el.localName.indexOf('-') !== -1 || el.getAttribute('is');
  }
  document.addEventListener('polymer-ready', function () {
    [].slice.call(document.querySelectorAll('html /deep/ *'))
      .filter(function (el) {
        return isCustomEl(el);
      })
      .forEach(isUnregisteredCustomElement);
  });
})();
