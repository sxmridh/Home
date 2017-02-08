window.Polymer = {
  dom: 'shadow',
  lazyRegister: true
};

(function(srcs, doc) {
  srcs.map(function(src) {
    var element = doc.createElement('script'), prevScriptTag = doc.scripts[0];
    element.src = src;
    element.async = true;
    prevScriptTag.parentNode.insertBefore(element, prevScriptTag);
  });
})(
  [
    !(
      'registerElement' in document &&
      'import' in document.createElement('link') &&
      'content' in document.createElement('template')
    ) && '/dep/webcomponentsjs/webcomponents-lite.min.js',
    !(
      'Intl' in window
    ) && '/dep/intl/dist/Intl.min.js'
  ].filter(Boolean),
  document
)
