const to = require('to-case');

module.exports = (attributes) => {
  const elements = attributes.map((attr) => {
    return `<th> ${to.capital(attr)} </th>`;
  });

  return `<thead><tr>${elements.join('')}</tr></thead>`;
};
