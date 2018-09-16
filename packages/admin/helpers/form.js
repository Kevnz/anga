const to = require('to-case');
module.exports = (attributes, item = null) => {
  const rows = attributes.map((attr) => {
    if (attr === '_id' && item) {
      return `<div>
      <label>${to.capital(attr)}</label>
      <input type="hidden" name="${attr}" value="${item ? item[attr] : ''}" />
      </div>`;
    } else if (attr === '_id' && !item) {
      return '';
    } else if (attr === 'user') {
      return '';
    }

    return `<div>
      <label>${to.capital(attr)}</label>
      <input type="text" name="${attr}" value="${item ? item[attr] : ''}" />
      </div>`;
  });

  return `<form method="${item ? 'PUT' : 'POST'}">
  <h3>Create or Update</h3>
  ${rows.join('')}
  <div><input type="submit" value="${item ? 'Update' : 'Save'}" /></div>
  </form>`;
};
